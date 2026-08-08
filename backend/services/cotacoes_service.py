from sqlmodel import Session, select, col
from core.database import engine
from models.transacoes import transacoes
from models.ativo_base import ativos_base

def atualizar_cotacoes_e_patrimonio():
    """Busca cotações atuais, calcula Valor Aplicado vs Ganho de Capital e salva no Supabase."""
    print("🔄 [Service] Processando cotações e calculando patrimônio...")
    with Session(engine) as session:
        # 1. Buscar transações dos usuários
        query = (
            select(transacoes, ativos_base)
            .join(ativos_base, col(transacoes.Ativo) == ativos_base.id)
            .distinct(ativos_base)
        )
        # 2. Consultar cotação externa (ex: Brapi / Yahoo Finance)
        # 3. Gravar na tabela 'historico_patrimonio' ou 'cotacoes_diarias'
        pass