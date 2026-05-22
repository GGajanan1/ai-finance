"""Router: GET /api/equity/{ticker}/chart?period=1W"""
import yfinance as yf
from fastapi import APIRouter, HTTPException
from core.cache import cache_get, cache_set
from services.indicators import compute_indicators

router = APIRouter()

# period → yfinance params
PERIOD_MAP = {
    "1W": {"period": "5d",  "interval": "1h"},
    "1M": {"period": "1mo", "interval": "1d"},
    "3M": {"period": "3mo", "interval": "1d"},
    "6M": {"period": "6mo", "interval": "1d"},
    "1Y": {"period": "1y",  "interval": "1d"},
}

# shorter TTL for intraday data
TTL_MAP = {"1W": 300, "1M": 1800, "3M": 3600, "6M": 3600, "1Y": 7200}


def _ts(idx) -> int:
    try:
        return int(idx.timestamp())
    except Exception:
        import pandas as pd
        return int(pd.Timestamp(idx).timestamp())


@router.get("/api/equity/{ticker}/chart")
def get_chart_data(ticker: str, period: str = "1W"):
    p = period.upper()
    if p not in PERIOD_MAP:
        p = "1W"

    cache_key = f"chart_{ticker}_{p}"
    cached = cache_get(cache_key)
    if cached:
        return cached

    try:
        params = PERIOD_MAP[p]
        hist = yf.Ticker(ticker).history(period=params["period"], interval=params["interval"])
        if hist.empty:
            raise HTTPException(status_code=404, detail="No data found for ticker")

        ohlcv = [
            {
                "time":   _ts(idx),
                "open":   round(float(r["Open"]),   4),
                "high":   round(float(r["High"]),   4),
                "low":    round(float(r["Low"]),    4),
                "close":  round(float(r["Close"]),  4),
                "volume": int(r["Volume"]),
            }
            for idx, r in hist.iterrows()
        ]

        result = {
            "ticker":     ticker,
            "period":     p,
            "ohlcv":      ohlcv,
            "indicators": compute_indicators(hist),
        }

        cache_set(cache_key, result, ex=TTL_MAP.get(p, 1800))
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
