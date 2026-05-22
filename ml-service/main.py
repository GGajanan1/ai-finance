"""
HMS ML Service — entry point.

All business logic lives in:
  core/       — config, cache, TTL constants
  services/   — FinBERT, FRED, World Bank
  routers/    — one file per domain (equity, sentiment, macro, search)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import equity, sentiment, macro, search, chart, portfolio, chat

app = FastAPI(title="HMS AI Finance ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(equity.router)
app.include_router(sentiment.router)
app.include_router(macro.router)
app.include_router(search.router)
app.include_router(chart.router)
app.include_router(portfolio.router)
app.include_router(chat.router)

# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/")
def read_root():
    return {"status": "ok", "service": "HMS ML Service"}
