from datetime import datetime, date
from uuid import UUID
from typing import Optional
from sqlmodel import Field, SQLModel

class transacoes(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default=None)
    Quantidade: int
    Usuario: UUID = Field(foreign_key="perfil_pessoal.id")
    data_transacao: date
    preco_unitario: float
    tipo: str
    Ativo: int = Field(foreign_key="ativos_base.id")