from datetime import date
from typing import Optional
from sqlmodel import SQLModel, Field, Index

class cotacoes_diarias(SQLModel, table =True):
    __tablename__ = "cotacoes_diarias"
    __table_args__=(
        # Indice composto único: impede de uma cotacao tenha um registro no mesmo dia
        Index("idx_cotacao_ativo_data", "ativo_id", "data", unique=True),
    )
    id: Optional[int] = Field(default=None, primary_key=True)
    ativo_id: int = Field(foreign_key="ativos_base.id", index=True)
    data: date= Field(index=True)
    preco_fechamento : float = Field()