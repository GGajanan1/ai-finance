"""Router: GET /api/macro"""
from fastapi import APIRouter, HTTPException
from core.cache import cache_get, cache_set, TTL_MACRO_FRED
from services.fred import get_fred_macro
from services.worldbank import fetch_indicators, fetch_single_indicator

router = APIRouter()

@router.get("/api/macro")
def get_macro_data(
    countries:  str = "IND,USA,CHN",
    indicators: str = "NY.GDP.MKTP.KD.ZG,FP.CPI.TOTL.ZG",
    bust:       str = None,
):
    """
    'bust' is a timestamp sent by the frontend after the user adds/removes a
    country or indicator — presence means skip Redis and fetch fresh data.
    """
    cache_key = f"macro_data_{countries}_{indicators}"
    if not bust:
        cached = cache_get(cache_key)
        if cached:
            return cached

    try:
        # ── FRED KPI cards ────────────────────────────────────────────────────
        fred_data       = get_fred_macro()
        yield_curve     = fred_data["yield_curve_spread"]
        fed_funds_rate  = fred_data["fed_funds_rate"]

        # ── World Bank table ──────────────────────────────────────────────────
        country_list   = [c.strip().upper() for c in countries.split(",")]
        indicator_list = [i.strip() for i in indicators.split(",")]

        try:
            global_metrics = fetch_indicators(indicator_list, country_list)
            us_inflation   = fetch_single_indicator("FP.CPI.TOTL.ZG", "USA") or 3.2
        except Exception as wb_err:
            print(f"wbgapi error: {wb_err}")
            global_metrics = [{"country": c, **{ind: None for ind in indicator_list}} for c in country_list]
            us_inflation   = 3.2

        result = {
            "yield_curve_spread": yield_curve,
            "inflation_rate":     us_inflation,
            "fed_funds_rate":     fed_funds_rate,
            "global_metrics":     global_metrics,
        }

        # FRED (daily cadence) is the binding TTL constraint
        cache_set(cache_key, result, ex=TTL_MACRO_FRED)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
