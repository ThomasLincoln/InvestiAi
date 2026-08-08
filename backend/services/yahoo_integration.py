import yfinance as yf

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