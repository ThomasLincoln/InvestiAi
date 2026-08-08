from datetime import date
from typing import Optional
from sqlmodel import SQLModel,Field
from uuid import UUID

class historico_patrimonio(SQLModel, table = True):
    __tablename__ = "historico_patrimonio"
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: UUID = Field(foreign_key="perfil_pessoal.id", index=True)
    data: date = Field(index=True)
    valor_aplicado: float    # Soma do custo de compra acumulado até a data
    valor_mercado: float     # Soma de (Quantidade de ativos * Cotação do dia)
    ganho_capital: float    # valor de mercado - valor aplicado

