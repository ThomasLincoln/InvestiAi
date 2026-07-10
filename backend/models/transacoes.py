from sqlmodel import Field, SQLModel, Relationship
from models.ativo import ativos_base


class transacoes(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    Quantidade: int
    Usuario: str
    data_transacao: str
    preco_unitario: float
    tipo: str
    Ativo: int
