from sqlmodel import Session, select, col
from datetime import date, timedelta, datetime
from uuid import UUID
from core.database import engine
from models.transacoes import transacoes
from models.historico_patrimonio import historico_patrimonio
from models.cotacoes_diarias import cotacoes_diarias
from models.perfil_pessoal import perfil_pessoal
from models.ativo_base import ativos_base
from services.yahoo_integration import get_actual_value_stock, buscar_e_salvar_cotacoes_faltantes

def atualizar_cotacoes_e_patrimonio():
    print("🔄 [Service] Processando cotações e obtendo valores atuais")
    with Session(engine) as session:
        # 1. Buscar transações dos usuários
        query = (
            select(transacoes, ativos_base)
            .join(ativos_base, col(transacoes.Ativo) == ativos_base.id)
            .distinct(ativos_base.ticker)
        )
        resultados = session.exec(query).all()
        dados_formatados = []
        for transacao, ativo in resultados:
            dados_formatados.append(
                {
                    "id": ativo.id,
                    "ticker": ativo.TickerConsulta
                }
            )
        for ativo in dados_formatados:
            valor_atual = get_actual_value_stock(ativo["ticker"])
            if valor_atual is not None:
                cotacao_hoje = session.exec(
                    select(cotacoes_diarias).where(
                        cotacoes_diarias.ativo_id == ativo["id"],
                        cotacoes_diarias.data == date.today()
                    )
                ).first()
                if cotacao_hoje:
                    cotacao_hoje.preco_fechamento = valor_atual
                    session.add(cotacao_hoje)
                else:
                    novo_historico = cotacoes_diarias(
                        ativo_id=ativo["id"],
                        data=date.today(),
                        preco_fechamento=valor_atual
                    )
                    session.add(novo_historico)
                print(f"Atualizado registro de valor {ativo['id']}: {valor_atual}")
        session.commit()
    
def consolidar_patrimonio_dia_atual():
    print("🔄 [Service] Atualizando patrimônios do dia atual")
    with Session(engine) as session:
        usuarios = session.exec(select(transacoes.Usuario).distinct()).all()
        for usuario_id in usuarios:
            consolidar_patrimonio_retroativo(str(usuario_id), date.today())
        
def consolidar_patrimonio_retroativo(usuario_id: str | UUID, data_inicio_recalculo: date | None = None):
    print(f"🔄 [Service] Recalculando patrimônio para o usuário {usuario_id}")    
    usuario_uuid = UUID(str(usuario_id))
    with Session(engine) as session:
        # 1. Obter as transações e ativos do usuário
        query_transacoes = (
            select(transacoes, ativos_base)
            .join(ativos_base, col(transacoes.Ativo) == ativos_base.id)
            .where(transacoes.Usuario == usuario_uuid)
            .order_by(transacoes.data_transacao.asc())
        )
        todas_transacoes = session.exec(query_transacoes).all()
        if not todas_transacoes:
            return
        
        primeira_data = todas_transacoes[0][0].data_transacao
        if data_inicio_recalculo is None:
            data_inicio = primeira_data
        else:
            if isinstance(data_inicio_recalculo, str):
                data_inicio_recalculo = datetime.strptime(data_inicio_recalculo, "%Y-%m-%d").date()
            data_inicio = min(data_inicio_recalculo, primeira_data)
        
        # 2. Garantir que as cotações históricas existam no banco para todos os ativos
        ativos_unicos = {a.id: a for _, a in todas_transacoes}
        for ativo_id, ativo in ativos_unicos.items():
            cotacoes_existentes = session.exec(
                select(cotacoes_diarias.data)
                .where(
                    cotacoes_diarias.ativo_id == ativo_id,
                    cotacoes_diarias.data >= data_inicio
                )
            ).all()
            datas_existentes = set(cotacoes_existentes)
            novas_cotacoes = buscar_e_salvar_cotacoes_faltantes(
                ativo.TickerConsulta, ativo.id, data_inicio
            )
            for cotacao in novas_cotacoes:
                if cotacao.data not in datas_existentes:
                    session.add(cotacao)
                    datas_existentes.add(cotacao.data)
        session.commit()
        
        # 3. Carregar mapa de cotações
        cotacoes_todas = session.exec(
            select(cotacoes_diarias)
            .where(cotacoes_diarias.data >= data_inicio)
        ).all()
        mapa_cotacoes = {(c.ativo_id, c.data): c.preco_fechamento for c in cotacoes_todas}

        # 4. Limpar histórico anterior do período para remover duplicatas
        registros_antigos = session.exec(
            select(historico_patrimonio).where(
                historico_patrimonio.usuario_id == usuario_uuid,
                historico_patrimonio.data >= data_inicio
            )
        ).all()
        for reg in registros_antigos:
            session.delete(reg)
        session.commit()
        
        # 5. Iterar mantendo o último preço conhecido (Forward-Fill)
        dia_atual = data_inicio
        hoje = date.today()
        ultimo_preco_conhecido = {}
        
        # Carregar cotações anteriores a data_inicio para inicializar preços
        cotacoes_anteriores = session.exec(
            select(cotacoes_diarias)
            .where(cotacoes_diarias.data < data_inicio)
            .order_by(cotacoes_diarias.data.asc())
        ).all()
        for c in cotacoes_anteriores:
            ultimo_preco_conhecido[c.ativo_id] = c.preco_fechamento

        while dia_atual <= hoje:
            transacoes_ate_o_dia = [(t, a) for t, a in todas_transacoes if t.data_transacao <= dia_atual]
            
            carteira_no_dia = {}
            for t, a in transacoes_ate_o_dia:
                if a.id not in carteira_no_dia:
                    carteira_no_dia[a.id] = {"qtd": 0, "pago": 0.0, "preco_compra": t.preco_unitario}
                carteira_no_dia[a.id]["qtd"] += t.Quantidade
                carteira_no_dia[a.id]["pago"] += (t.Quantidade * t.preco_unitario)
            
            total_aplicado = 0.0
            total_mercado = 0.0
            for ativo_id, dados in carteira_no_dia.items():
                total_aplicado += dados["pago"]
                
                # Se houver cotação hoje, atualiza o último preço conhecido
                if (ativo_id, dia_atual) in mapa_cotacoes:
                    ultimo_preco_conhecido[ativo_id] = mapa_cotacoes[(ativo_id, dia_atual)]
                
                # Preço a usar: cotação mais recente conhecida ou preço de compra como fallback
                preco_ativo = ultimo_preco_conhecido.get(ativo_id, dados["preco_compra"])
                total_mercado += (dados["qtd"] * preco_ativo)

            if total_aplicado > 0:
                novo_registro = historico_patrimonio(
                    usuario_id=usuario_uuid,
                    data=dia_atual,
                    valor_aplicado=round(total_aplicado, 2),
                    valor_mercado=round(total_mercado, 2),
                    ganho_capital=round(total_mercado - total_aplicado, 2)
                )
                session.add(novo_registro)

            dia_atual += timedelta(days=1)
        session.commit()
        print(f"✅ [Service] Patrimônio consolidado com sucesso para usuário {usuario_id}")