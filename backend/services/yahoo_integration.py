import yfinance as yf
from datetime import date, timedelta
from models.cotacoes_diarias import cotacoes_diarias

def get_actual_value_stock(ticker: str) -> float | None:
    candidate_tickers = [ticker]
    if ticker.endswith(".SA"):
        base_ticker = ticker[:-3]
        if not any(char.isdigit() for char in base_ticker):
            candidate_tickers.append(f"{base_ticker}11.SA")
            candidate_tickers.append(f"{base_ticker}3.SA")
            candidate_tickers.append(f"{base_ticker}4.SA")
    else:
        candidate_tickers.append(f"{ticker}.SA")
        if not any(char.isdigit() for char in ticker):
            candidate_tickers.append(f"{ticker}11.SA")

    for t in candidate_tickers:
        try:
            ativo = yf.Ticker(t)
            info = ativo.info
            preco = info.get("currentPrice") or info.get("regularMarketPrice")
            
            if preco is None:
                hist = ativo.history(period="1d")
                if not hist.empty:
                    preco = float(hist["Close"].iloc[-1])
            if preco is not None and preco > 0:
                return preco
        except Exception as e:
            print(f"Erro ao buscar ticker {t}: {e}")
            continue
    return None

def buscar_e_salvar_cotacoes_faltantes(ticker_consulta: str, ativo_id: int, data_inicio: date):
    candidate_tickers = [ticker_consulta]
    if ticker_consulta.endswith(".SA"):
        base_ticker = ticker_consulta[:-3]
        if not any(char.isdigit() for char in base_ticker):
            candidate_tickers.append(f"{base_ticker}11.SA")
    else:
        candidate_tickers.append(f"{ticker_consulta}.SA")

    for t in candidate_tickers:
        try:
            ativo = yf.Ticker(t)
            historico = ativo.history(start=data_inicio, end=date.today() + timedelta(days=1))
            if not historico.empty:
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
                if novas_cotacoes:
                    return novas_cotacoes
        except Exception:
            continue
    return []