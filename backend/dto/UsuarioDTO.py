from typing import Optional
from pydantic import BaseModel


class NovoAporte(BaseModel):
    Ativo: int
    Quantidade: int
    preco_unitario: float
    data_transacao: str
    tipo: Optional[str] = "Compra"
