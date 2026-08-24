# backend/tests/test_ativos.py
from sqlmodel import Session
from models.ativo_base import ativos_base

def test_listar_ativos_vazio(client):
    response = client.get("/ativos/")
    assert response.status_code == 200
    assert response.json() == []

def test_listar_ativos_com_dados(client, session: Session):
    # Cria ativo no banco de teste
    ativo = ativos_base(
        id=1,
        ticker="PETR4",
        nome="Petrobras PN",
        TickerConsulta="PETR4.SA"
    )
    session.add(ativo)
    session.commit()

    response = client.get("/ativos/")
    assert response.status_code == 200
    dados = response.json()
    assert len(dados) == 1
    assert dados[0]["ticker"] == "PETR4"