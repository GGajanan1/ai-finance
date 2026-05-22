"""FRED API helpers — yield curve spread and fed funds rate."""
from core.config import settings

_PLACEHOLDER_FRED_KEY = "YOUR_FRED_API_KEY_HERE"

def get_fred_macro() -> dict:
    """
    Returns {'yield_curve_spread': float, 'fed_funds_rate': float}.
    Falls back to sensible defaults when no FRED API key is configured.
    """
    fred_key = settings.FRED_API_KEY
    if not fred_key or fred_key == _PLACEHOLDER_FRED_KEY:
        return {"yield_curve_spread": 0.45, "fed_funds_rate": 5.25}

    from fredapi import Fred
    fred = Fred(api_key=fred_key)

    spread_series  = fred.get_series("T10Y2Y")
    dff_series     = fred.get_series("DFF")

    return {
        "yield_curve_spread": round(float(spread_series.iloc[-1]), 2),
        "fed_funds_rate":     round(float(dff_series.iloc[-1]),    2),
    }
