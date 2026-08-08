from uuid import UUID
from typing import Optional
from sqlmodel import Field, SQLModel

class perfil_pessoal(SQLModel, table=True):
    id: UUID = Field(primary_key=True)
    fullname: Optional[str] = Field(default=None)
    email: str
    picture: Optional[str] = Field(default=None)
    saldo: int = Field(default=0)