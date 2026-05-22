"""Router: GET /api/equity/{ticker}"""
import yfinance as yf
from fastapi import APIRouter, HTTPException
from core.cache import cache_get, cache_set, TTL_EQUITY

router = APIRouter()

@router.get("/api/equity/{ticker}")
def get_equity_data(ticker: str):
    cache_key = f"equity_{ticker}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    try:
        t    = yf.Ticker(ticker)
        hist = t.history(period="1mo")
        if hist.empty:
            raise HTTPException(status_code=404, detail="No data found for ticker")

        history = [
            {
                "date":   idx.strftime("%Y-%m-%d"),
                "close":  row["Close"],
                "volume": int(row["Volume"]),
            }
            for idx, row in hist.iterrows()
        ]

        result = {
            "ticker":        ticker,
            "current_price": history[-1]["close"],
            "history":       history,
        }
        cache_set(cache_key, result, ex=TTL_EQUITY)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
