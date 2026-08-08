from sqlmodel import Session, select, col
from datetime import date
from core.database import engine
from models.transacoes import transacoes
from models.cotacoes_diarias import cotacoes_diarias
from models.ativo_base import ativos_base
from services.yahoo_integration import get_actual_value_stock

def atualizar_cotacoes_e_patrimonio():
    """Busca cotações atuais, calcula Valor Aplicado vs Ganho de Capital e salva no Supabase."""
    print("🔄 [Service] Processando cotações e calculando patrimônio...")
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
        # 2. Consultar cotação externa (ex: Brapi / Yahoo Finance)
        
        # 3. Gravar na tabela 'historico_patrimonio' ou 'cotacoes_diarias'
        pass