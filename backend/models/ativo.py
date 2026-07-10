from sqlmodel import Field, SQLModel

class ativos_base(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    ticker: str
    nome: str
    TickerConsulta: str