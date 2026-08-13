from sqlmodel import Session, select, col
from datetime import date
from core.database import engine
from models.transacoes import transacoes
from models.historico_patrimonio import historico_patrimonio
from models.cotacoes_diarias import cotacoes_diarias
from models.perfil_pessoal import perfil_pessoal
from models.ativo_base import ativos_base
from services.yahoo_integration import get_actual_value_stock

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
        print(resultados)
        for transacao, ativo in resultados:
            dados_formatados.append(
                {
                    "id": ativo.id,
                    "ticker": ativo.TickerConsulta
                }
            )
        for ativo in dados_formatados:
            valor_atual = get_actual_value_stock(ativo["ticker"])
            novo_historico = cotacoes_diarias(
                ativo_id=ativo["id"],
                data=date.today(),
                preco_fechamento=valor_atual
            )
            session.add(novo_historico)
        session.commit()
        session.refresh(novo_historico)
        print("Adicionado um novo registro de valor", ativos_base.id, valor_atual)
        pass
    
def consolidar_patrimonio_dia_atual():
    print("🔄 [Service] Atualizando patrimônios")
    with Session(engine) as session:
        # Obter os ativos comprados de cada usuário no dia atual
        query_precos = select(cotacoes_diarias).where(cotacoes_diarias.data == date.today())
        cotacoes_hoje = session.exec(query_precos).all()
        query =(
            select(transacoes, ativos_base)
            .join(ativos_base, col(transacoes.Ativo) == ativos_base.id)
            .where(transacoes.data_transacao <= date.today())
        )
        # Organizar quantos ele comprou de cada ativo e o valor total disso
        resultados = session.exec(query).all()
        precos_por_ativo = {cotacao.ativo_id: cotacao.preco_fechamento for cotacao in cotacoes_hoje}
        carteiras_por_usuario = {}
        for transacao, ativo in resultados:
            ticker = ativo.ticker
            quantidade = transacao.Quantidade
            valor = transacao.preco_unitario
            usuario_id = str(transacao.Usuario)

            if usuario_id not in carteiras_por_usuario:
                carteiras_por_usuario[usuario_id] = {}
            if ticker not in carteiras_por_usuario[usuario_id]:
                carteiras_por_usuario[usuario_id][ticker] = {
                    "quantidade": 0,
                    "valorPago": 0.0,
                    "valorHoje": 0.0,
                }
            valorAtual = precos_por_ativo.get(ativo.id, 0.0)    
            carteiras_por_usuario[usuario_id][ticker]["quantidade"] += quantidade
            carteiras_por_usuario[usuario_id][ticker]["valorPago"] = valor
            carteiras_por_usuario[usuario_id][ticker]["valorHoje"] = valorAtual
        print(carteiras_por_usuario)
        # Salvar esse registro
        for usuario_id, ativos in carteiras_por_usuario.items():
            total_aplicado = 0.0
            total_mercado = 0.0
            for ticker, dados in ativos.items():
                total_aplicado += dados["valorPago"] * dados["quantidade"]
                total_mercado += dados["valorHoje"] * dados["quantidade"]
            ganho_capital = total_mercado - total_aplicado
            
            novo_historico = historico_patrimonio(
                usuario_id=usuario_id,
                data=date.today(),
                ganho_capital=ganho_capital,
                valor_aplicado=total_aplicado,
                valor_mercado=total_mercado,
            )
            
            session.add(novo_historico)
            print(novo_historico)
        session.commit()