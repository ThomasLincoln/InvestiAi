import yfinance as yf
from datetime import date, timedelta
from models.cotacoes_diarias import cotacoes_diarias

def get_actual_value_stock(ticker: str) -> float | None:
    try:
        ativo = yf.Ticker(ticker)
        info = ativo.info
        preco = info.get("currentPrice") or info.get("regularMarketPrice")
        
        if preco is None:
            hist = ativo.history(period="1d")
            if not hist.empty:
                preco = float(hist["Close"].iloc[-1])
        return preco
    except Exception as e:
        print(f"Erro ao buscar ticker {ticker}: {e}")
        return None

def buscar_e_salvar_cotacoes_faltantes(ticker_consulta: str, ativo_id: int, data_inicio: date):
    # Pega o histórico completo desde a data do aporte até hoje em UMA ÚNICA REQUISIÇÃO
    ativo = yf.Ticker(ticker_consulta)
    historico = ativo.history(start=data_inicio, end=date.today() + timedelta(days=1))
    
    novas_cotacoes = []
    for data_pandas, linha in historico.iterrows():
        preco_fechamento = float(linha["Close"])
        if preco_fechamento > 0:
            novas_cotacoes.append(
                cotacoes_diarias(
                    ativo_id=ativo_id,
                    data=data_pandas.date(),
                    preco_fechamento=preco_fechamento
                )
            )
    return novas_cotacoes