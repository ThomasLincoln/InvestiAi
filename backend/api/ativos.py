from fastapi import APIRouter
from sqlmodel import Session, select
from core.database import engine
from models.ativo_base import ativos_base
from models.cotacoes_diarias import cotacoes_diarias

router = APIRouter(
    prefix="/ativos",
    tags=["Ativos"]
)

@router.get("/")
def read_ativos():
    with Session(engine) as session:
        statement = (
            select(ativos_base, cotacoes_diarias.preco_fechamento)
            .join(cotacoes_diarias, ativos_base.id == cotacoes_diarias.ativo_id, isouter=True)
            .order_by(ativos_base.id, cotacoes_diarias.data.desc())
            .distinct(ativos_base.id)
        )
        resultados = session.exec(statement).all()

        ativos = []
        for ativo, preco in resultados:
            ativos.append({
                "id": str(ativo.id),
                "ticker": ativo.ticker,
                "nome": ativo.nome,
                "preco": preco if preco is not None else 0.0,
            })
            
        print("💵 Ativos na carteira: ", ativos)
        return ativos