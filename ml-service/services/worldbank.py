"""World Bank data fetching via wbgapi.

Why wb.data.fetch() instead of wb.data.DataFrame():
  DataFrame() returns a MultiIndex whose orientation varies with the number of
  series/economies, making dict-key access error-prone and causing FastAPI
  serialisation failures (unhashable tuple keys).
  fetch() yields plain dicts:
    {'economy': 'IND', 'series': 'NY.GDP.MKTP.KD.ZG', 'time': 'YR2023', 'value': 8.2}
  Records arrive most-recent first (mrv order), so we take the first non-None
  value per (economy, series) pair — this handles the 1-2 year WB data lag.
"""
import wbgapi as wb

def fetch_indicators(
    indicator_list: list[str],
    country_list:   list[str],
    mrv: int = 5,
) -> list[dict]:
    """
    Returns a list of dicts:
      [{'country': 'IND', 'NY.GDP.MKTP.KD.ZG': 6.49, 'FP.CPI.TOTL.ZG': 4.95}, ...]
    Missing values are None (frontend renders N/A).
    """
    raw: dict[str, dict[str, float | None]] = {
        c: {ind: None for ind in indicator_list} for c in country_list
    }

    for rec in wb.data.fetch(indicator_list, country_list, mrv=mrv):
        economy = rec.get("economy")
        series  = rec.get("series")
        value   = rec.get("value")
        if (
            economy in raw
            and series in raw[economy]
            and raw[economy][series] is None   # keep only most-recent non-None
            and value is not None
        ):
            raw[economy][series] = round(float(value), 2)

    return [{"country": c, **raw[c]} for c in country_list]


def fetch_single_indicator(indicator: str, economy: str, mrv: int = 5) -> float | None:
    """Returns the most recent non-None value for a single indicator + economy."""
    for rec in wb.data.fetch(indicator, economy, mrv=mrv):
        if rec.get("value") is not None:
            return round(float(rec["value"]), 2)
    return None
