from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, col
from core.database import engine
from models.transacoes import transacoes
from models.ativo_base import ativos_base
from models.cotacoes_diarias import cotacoes_diarias
from models.historico_patrimonio import historico_patrimonio
from core.security import obter_usuario_atual
from datetime import datetime, timezone
from uuid import UUID
from dto.UsuarioDTO import NovoAporte
from services.cotacoes_service import consolidar_patrimonio_retroativo, atualizar_cotacoes_e_patrimonio

router = APIRouter(prefix="/usuario", tags=["Usuarios"])


@router.get("/ativos")
def lerAtivos_usuario(usuario_id: str = Depends(obter_usuario_atual)):
    print(f"👉 Rota /ativos acessada pelo usuário: {usuario_id}")
    usuario_uuid = UUID(str(usuario_id))
    with Session(engine) as session:
        query = (
            select(transacoes, ativos_base)
            .join(ativos_base, col(transacoes.Ativo) == ativos_base.id)
            .where(transacoes.Usuario == usuario_uuid)
        )
        resultados = session.exec(query).all()

        dados_formatados = []
        for transacao, ativo in resultados:
            dados_formatados.append(
                {
                    "id": transacao.id,
                    "Quantidade": transacao.Quantidade,
                    "preco_unitario": transacao.preco_unitario,
                    "Ativo": {"ticker": ativo.ticker, "nome": ativo.nome},
                }
            )

        return dados_formatados


@router.get("/ativosAgrupados")
def lerAtivosAgrupados_usuario(usuario_id: str = Depends(obter_usuario_atual)):
    dados_formatados = []
    print(f"👉 Rota /ativosAgrupados acessada pelo usuário: {usuario_id}")
    usuario_uuid = UUID(str(usuario_id))
    with Session(engine) as session:
        query_transacoes = (
            select(transacoes, ativos_base)
            .join(ativos_base, col(transacoes.Ativo) == ativos_base.id)
            .where(transacoes.Usuario == usuario_uuid)
            .order_by(transacoes.data_transacao.asc(), transacoes.id.asc())
        )
        resultados = session.exec(query_transacoes).all()

        query_cotacoes = (
            select(cotacoes_diarias)
            .order_by(cotacoes_diarias.ativo_id, cotacoes_diarias.data.desc())
            .distinct(cotacoes_diarias.ativo_id)
        )
        
        ultimas_cotacoes = session.exec(query_cotacoes).all()
        
        mapa_precos = {cotacao.ativo_id: cotacao.preco_fechamento for cotacao in ultimas_cotacoes}
        
        ativos_consolidados = {}
        for transacao, ativo in resultados:
            ticker = ativo.ticker
            if ticker not in ativos_consolidados:
                ativos_consolidados[ticker] = {
                    "Ativo": {"ticker": ticker, "nome": ativo.nome, "tipo": ativo.tipo},
                    "ID": ativo.id,
                    "Quantidade": 0,
                    "custo_total": 0.0,
                    "preco": mapa_precos.get(ativo.id, 0.0)
                }
            
            is_venda = (transacao.tipo or "").lower() == "venda"
            if is_venda:
                qtd_atual = ativos_consolidados[ticker]["Quantidade"]
                if qtd_atual > 0:
                    pm = ativos_consolidados[ticker]["custo_total"] / qtd_atual
                    nova_qtd = max(0, qtd_atual - transacao.Quantidade)
                    ativos_consolidados[ticker]["Quantidade"] = nova_qtd
                    ativos_consolidados[ticker]["custo_total"] = max(0.0, nova_qtd * pm)
            else:
                custo_da_transacao = transacao.Quantidade * transacao.preco_unitario
                ativos_consolidados[ticker]["Quantidade"] += transacao.Quantidade
                ativos_consolidados[ticker]["custo_total"] += custo_da_transacao

        for ticker, dados in ativos_consolidados.items():
            quantidade = dados["Quantidade"]
            if quantidade > 0:
                preco_medio = (dados["custo_total"] / quantidade) if quantidade > 0 else 0
                dados_formatados.append(
                    {
                        "ID": dados["ID"],
                        "Ativo": dados["Ativo"],
                        "Quantidade": dados["Quantidade"],
                        "preco_medio": round(preco_medio, 2),
                        "preco": dados["preco"]
                    }
                )
        return dados_formatados

@router.get("/obterHistorico")
def obter_historico(usuario_id: str = Depends(obter_usuario_atual)):
    print(f"👉 Rota /obterHistorico ativada pelo usuário: {usuario_id}")
    usuario_uuid = UUID(str(usuario_id))
    with Session(engine) as session:
            query = (
                select(transacoes, ativos_base)
                .join(ativos_base, col(transacoes.Ativo) == ativos_base.id)
                .where(transacoes.Usuario == usuario_uuid)
            )
            resultados = session.exec(query).all()
            ativos_consolidados = {}
            for transacao, ativo in resultados:
                data_string = str(transacao.data_transacao).split(" ")[0]
                
                if data_string not in ativos_consolidados:
                    ativos_consolidados[data_string] = []
                
                ativos_consolidados[data_string].append({
                    "quantidade":transacao.Quantidade,
                    "preco_unitario": transacao.preco_unitario,
                    "tipo": transacao.tipo
                })
            historico_lista = [
            {"data": data, "transacoes": itens} 
            for data, itens in ativos_consolidados.items()
            ]
        
            return historico_lista


@router.get("/transacoes")
def listar_transacoes_usuario(usuario_id: str = Depends(obter_usuario_atual)):
    print(f"👉 Rota /usuario/transacoes acessada pelo usuário: {usuario_id}")
    usuario_uuid = UUID(str(usuario_id))
    with Session(engine) as session:
        query = (
            select(transacoes, ativos_base)
            .join(ativos_base, col(transacoes.Ativo) == ativos_base.id)
            .where(transacoes.Usuario == usuario_uuid)
            .order_by(col(transacoes.data_transacao).desc(), col(transacoes.id).desc())
        )
        resultados = session.exec(query).all()

        lista = []
        for transacao, ativo in resultados:
            valor_total = round(transacao.Quantidade * transacao.preco_unitario, 2)
            lista.append({
                "id": transacao.id,
                "data": str(transacao.data_transacao),
                "tipo": transacao.tipo or "Compra",
                "quantidade": transacao.Quantidade,
                "preco_unitario": transacao.preco_unitario,
                "valor_total": valor_total,
                "ativo": {
                    "id": ativo.id,
                    "ticker": ativo.ticker,
                    "nome": ativo.nome,
                    "tipo": ativo.tipo
                }
            })
        return lista


@router.delete("/transacoes/{transacao_id}")
def excluir_transacao(transacao_id: int, usuario_id: str = Depends(obter_usuario_atual)):
    print(f"👉 Exclusão de transação {transacao_id} solicitada pelo usuário: {usuario_id}")
    usuario_uuid = UUID(str(usuario_id))
    with Session(engine) as session:
        transacao = session.get(transacoes, transacao_id)
        if not transacao:
            raise HTTPException(status_code=404, detail="Transação não encontrada.")

        if transacao.Usuario != usuario_uuid:
            raise HTTPException(status_code=403, detail="Você não tem permissão para excluir esta transação.")

        data_inicio = transacao.data_transacao
        session.delete(transacao)
        session.commit()

        # Recalcula histórico patrimonial retroativamente a partir da data da transação excluída
        try:
            consolidar_patrimonio_retroativo(usuario_id=usuario_uuid, data_inicio_recalculo=data_inicio)
        except Exception as e:
            print(f"Aviso: Erro ao consolidar patrimônio após exclusão: {e}")

        return {"mensagem": "Transação excluída com sucesso!", "id": transacao_id}


@router.post("/aportar_ativo")
def aportar(
    dados_do_aporte: NovoAporte, usuario_id: str = Depends(obter_usuario_atual)
):
    print(f"👉 Rota /aportart_ativo acessada pelo usuário: {usuario_id}")
    usuario_uuid = UUID(str(usuario_id))
    with Session(engine) as session:
        # Garante que data_transacao seja um objeto date para o SQLite
        if isinstance(dados_do_aporte.data_transacao, str):
            data_transacao_obj = datetime.strptime(dados_do_aporte.data_transacao, "%Y-%m-%d").date()
        else:
            data_transacao_obj = dados_do_aporte.data_transacao

        tipo_transacao = "Venda" if (dados_do_aporte.tipo or "").lower() == "venda" else "Compra"

        novo_aporte = transacoes(
            Usuario=usuario_uuid,
            Quantidade=dados_do_aporte.Quantidade,
            preco_unitario=dados_do_aporte.preco_unitario,
            tipo=tipo_transacao,
            Ativo=dados_do_aporte.Ativo,
            data_transacao=data_transacao_obj,
        )
        session.add(novo_aporte)
        session.commit()
        session.refresh(novo_aporte)
        # Comentado para agilizar o cadastro em lote de múltiplos aportes:
        # consolidar_patrimonio_retroativo(usuario_id=usuario_uuid, data_inicio_recalculo=data_transacao_obj)

        msg = "Venda registrada com sucesso!" if tipo_transacao == "Venda" else "Aporte registrado com sucesso!"
        return {"mensagem": msg, "id_transcao": novo_aporte.id}

@router.get("/historico_patrimonio")
def get_historico_patrimonio(usuario_id: str = Depends(obter_usuario_atual)):
    print(f"👉 Rota /historico_patrimonio acessada pelo usuário: {usuario_id}")
    usuario_uuid = UUID(str(usuario_id))
    with Session(engine) as session:
        query_encontrar_historico = (
            select(historico_patrimonio)
            .where(historico_patrimonio.usuario_id == usuario_uuid)
            .order_by(historico_patrimonio.data.asc())
        )
        resultados = session.exec(query_encontrar_historico).all()
        
        # Só recalcula se não há nenhum histórico (primeira vez do usuário).
        # Duplicatas são resolvidas pelo mapa abaixo — não precisa recalcular tudo.
        if len(resultados) == 0:
            consolidar_patrimonio_retroativo(usuario_id=usuario_uuid)
            resultados = session.exec(query_encontrar_historico).all()

        mapa_por_data = {}
        for reg in resultados:
            mapa_por_data[reg.data] = reg
            
        registros_limpos = sorted(mapa_por_data.values(), key=lambda r: r.data)
        
        return [
            {
                "data": reg.data.strftime("%Y-%m-%d"),
                "valor_aplicado": reg.valor_aplicado,
                "valor_mercado": reg.valor_mercado,
                "ganho_capital": reg.ganho_capital,
            }
            for reg in registros_limpos
        ]

@router.post("/recalcular_patrimonio")
def recalcular_patrimonio(usuario_id: str = Depends(obter_usuario_atual)):
    """
    Recalcula todo o histórico de patrimônio do usuário sob demanda.
    Útil quando o servidor estava inativo e o job agendado não rodou.
    """
    print(f"🔄 Recálculo manual solicitado pelo usuário: {usuario_id}")
    usuario_uuid = UUID(str(usuario_id))
    try:
        atualizar_cotacoes_e_patrimonio()
        consolidar_patrimonio_retroativo(usuario_id=usuario_uuid)
        return {"mensagem": "Patrimônio recalculado com sucesso!"}
    except Exception as e:
        print(f"❌ Erro ao recalcular patrimônio: {e}")
        from fastapi import HTTPException
        raise HTTPException(
            status_code=503,
            detail=f"Erro ao buscar cotações (Yahoo Finance pode estar com limite de requisições). Tente novamente em alguns minutos. Detalhe: {str(e)}"
        )

@router.delete("/deletarTransacao")
def deletar_transacao():
    return {"mensagem": "Registro deletado"}