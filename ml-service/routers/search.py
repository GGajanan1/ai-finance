"""Router: GET /api/search  |  GET /api/agent/analyze/{ticker}"""
import httpx
from fastapi import APIRouter, HTTPException
from core.cache import cache_get, cache_set, TTL_SEARCH, TTL_AGENT

router = APIRouter()

# ── GET /api/search ───────────────────────────────────────────────────────────
@router.get("/api/search")
async def search_ticker(query: str = ""):
    if not query:
        return {"results": []}

    cache_key = f"search_{query.lower()}"
    cached    = cache_get(cache_key)
    if cached:
        return cached

    try:
        url     = f"https://query2.finance.yahoo.com/v1/finance/search?q={query}"
        headers = {"User-Agent": "Mozilla/5.0"}

        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers)

        results = []
        if resp.status_code == 200:
            for q in resp.json().get("quotes", []):
                if q.get("quoteType") in ("EQUITY", "ETF"):
                    results.append({
                        "symbol":    q.get("symbol"),
                        "shortname": q.get("shortname"),
                        "exchange":  q.get("exchDisp"),
                    })

        payload = {"results": results}
        cache_set(cache_key, payload, ex=TTL_SEARCH)
        return payload
    except Exception as e:
        print(f"Search API error: {e}")
        return {"results": []}


# ── GET /api/agent/analyze/{ticker} ──────────────────────────────────────────
@router.get("/api/agent/analyze/{ticker}")
def analyze_stock_agent(ticker: str, period: str = "1W"):
    cache_key = f"agent_analysis_{ticker}_{period.upper()}"
    cached    = cache_get(cache_key)
    if cached:
        return {"analysis": cached}

    try:
        from agent import run_analyst_agent
        analysis = run_analyst_agent(ticker, period)
        cache_set(cache_key, analysis, ex=TTL_AGENT)
        return {"analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

