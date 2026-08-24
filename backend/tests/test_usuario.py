# backend/tests/test_usuario.py
from unittest.mock import patch
from datetime import date
from sqlmodel import Session
from models.ativo_base import ativos_base
from models.cotacoes_diarias import cotacoes_diarias

def test_aportar_ativo_e_obter_historico(client, session: Session):
    # 1. Cadastrar um ativo base
    ativo = ativos_base(
        id=1,
        ticker="CMIG3",
        nome="Cemig ON",
        TickerConsulta="CMIG3.SA"
    )
    session.add(ativo)
    session.commit()

    # 2. Mockar o retorno do Yahoo Finance para o teste
    mock_cotacoes = [
        cotacoes_diarias(ativo_id=1, data=date(2026, 8, 20), preco_fechamento=15.0),
        cotacoes_diarias(ativo_id=1, data=date(2026, 8, 21), preco_fechamento=16.0),
        cotacoes_diarias(ativo_id=1, data=date(2026, 8, 22), preco_fechamento=17.0),
        cotacoes_diarias(ativo_id=1, data=date(2026, 8, 23), preco_fechamento=18.0),
    ]

    with patch("services.cotacoes_service.buscar_e_salvar_cotacoes_faltantes", return_value=mock_cotacoes):
        # 3. Fazer requisição de aporte
        payload = {
            "Ativo": 1,
            "Quantidade": 10,
            "preco_unitario": 15.0,
            "data_transacao": "2026-08-20"
        }
        response = client.post("/usuario/aportar_ativo", json=payload)
        assert response.status_code == 200
        assert "mensagem" in response.json()

        # 4. Consultar o histórico consolidado
        hist_response = client.get("/usuario/historico_patrimonio")
        assert hist_response.status_code == 200
        historico = hist_response.json()

        # Deve haver pontos a partir de 2026-08-20
        assert len(historico) > 0
        assert historico[0]["valor_aplicado"] == 150.0  # 10 * 15
        assert historico[0]["valor_mercado"] == 150.0   # 10 * 15 (cotacao do dia 20)