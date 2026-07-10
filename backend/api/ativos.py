from fastapi import APIRouter
from sqlmodel import Session, select
from core.database import engine
from models.ativo import ativos_base

router = APIRouter(
    prefix="/ativos",
    tags=["Ativos"]
)


@router.get("/")
def read_ativos():
    with Session(engine) as session:
        ativos = session.exec(select(ativos_base)).all()
        return ativos