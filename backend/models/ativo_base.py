from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class ativos_base(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default=None)
    ticker: str
    nome: str
    TickerConsulta: str