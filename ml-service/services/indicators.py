 """Technical indicator computation using pandas-ta."""
import pandas as pd

try:
    import pandas_ta as ta
    HAS_TA = True
except ImportError:
    HAS_TA = False
    print("⚠️  pandas-ta not installed — indicators unavailable. Run: pip install pandas-ta")


def _ts(idx) -> int:
    """Convert pandas Timestamp to Unix seconds (lightweight-charts format)."""
    try:
        return int(idx.timestamp())
    except Exception:
        return int(pd.Timestamp(idx).timestamp())


def compute_indicators(hist: pd.DataFrame) -> dict:
    """
    Accepts a yfinance history DataFrame, returns indicator arrays
    formatted for lightweight-charts time series:
      { sma20, sma50, bb, rsi, macd }
    All 'time' values are Unix seconds (int).
    Missing values are dropped — never forward-filled.
    """
    if not HAS_TA or hist.empty:
        return {}

    df = hist.copy()
    df.columns = [c.lower() for c in df.columns]
    close = df["close"]
    result = {}

    # SMA 20
    try:
        s = ta.sma(close, length=20).dropna()
        result["sma20"] = [{"time": _ts(i), "value": round(float(v), 4)} for i, v in s.items()]
    except Exception:
        pass

    # SMA 50
    try:
        s = ta.sma(close, length=50).dropna()
        result["sma50"] = [{"time": _ts(i), "value": round(float(v), 4)} for i, v in s.items()]
    except Exception:
        pass

    # Bollinger Bands (20, 2)
    try:
        bb = ta.bbands(close, length=20, std=2)
        if bb is not None and not bb.empty:
            bb = bb.dropna()
            uc = next(c for c in bb.columns if "BBU" in c)
            mc = next(c for c in bb.columns if "BBM" in c)
            lc = next(c for c in bb.columns if "BBL" in c)
            result["bb"] = [
                {"time": _ts(i), "upper": round(float(r[uc]), 4),
                 "mid": round(float(r[mc]), 4), "lower": round(float(r[lc]), 4)}
                for i, r in bb.iterrows()
            ]
    except Exception:
        pass

    # RSI (14)
    try:
        s = ta.rsi(close, length=14).dropna()
        result["rsi"] = [{"time": _ts(i), "value": round(float(v), 2)} for i, v in s.items()]
    except Exception:
        pass

    # MACD (12, 26, 9)
    try:
        m = ta.macd(close, fast=12, slow=26, signal=9)
        if m is not None and not m.empty:
            m = m.dropna()
            mc  = next(c for c in m.columns if c.startswith("MACD_"))
            sc  = next(c for c in m.columns if "MACDs_" in c)
            hc  = next(c for c in m.columns if "MACDh_" in c)
            result["macd"] = [
                {"time": _ts(i), "macd": round(float(r[mc]), 4),
                 "signal": round(float(r[sc]), 4), "hist": round(float(r[hc]), 4),
                 "color": "#26a69a" if float(r[hc]) >= 0 else "#ef5350"}
                for i, r in m.iterrows()
            ]
    except Exception:
        pass

    return result
