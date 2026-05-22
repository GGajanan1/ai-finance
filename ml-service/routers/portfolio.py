"""Router: POST /api/portfolio/analyze"""
import yfinance as yf
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()


class Holding(BaseModel):
    ticker:        str
    shares:        float
    avg_buy_price: float


@router.post("/api/portfolio/analyze")
def analyze_portfolio(holdings: List[Holding]):
    if not holdings:
        return {"positions": [], "total_value": 0, "total_cost": 0, "total_gain_loss": 0}

    positions = []
    total_value = 0.0
    total_cost  = 0.0

    for h in holdings:
        try:
            t    = yf.Ticker(h.ticker)
            info = t.info
            hist = t.history(period="5d", interval="1d")

            # Current price — prefer info field, fall back to last close
            current_price = (
                info.get("regularMarketPrice")
                or info.get("currentPrice")
                or (float(hist["Close"].iloc[-1]) if not hist.empty else None)
            )

            if current_price is None:
                positions.append({
                    "ticker": h.ticker, "shares": h.shares,
                    "avg_buy_price": h.avg_buy_price, "error": "Price unavailable",
                })
                continue

            current_price = round(float(current_price), 4)
            cost          = round(h.shares * h.avg_buy_price, 2)
            value         = round(h.shares * current_price, 2)
            gain_loss     = round(value - cost, 2)
            gain_loss_pct = round((gain_loss / cost) * 100, 2) if cost else 0

            # Day change %
            day_pct = None
            if len(hist) >= 2:
                prev = float(hist["Close"].iloc[-2])
                day_pct = round(((current_price - prev) / prev) * 100, 2)
            elif info.get("regularMarketChangePercent"):
                day_pct = round(float(info["regularMarketChangePercent"]), 2)

            total_value += value
            total_cost  += cost

            positions.append({
                "ticker":        h.ticker,
                "name":          info.get("longName") or info.get("shortName", h.ticker),
                "shares":        h.shares,
                "avg_buy_price": h.avg_buy_price,
                "current_price": current_price,
                "current_value": value,
                "total_cost":    cost,
                "gain_loss":     gain_loss,
                "gain_loss_pct": gain_loss_pct,
                "day_change_pct": day_pct,
            })

        except Exception as e:
            positions.append({
                "ticker": h.ticker, "shares": h.shares,
                "avg_buy_price": h.avg_buy_price, "error": str(e),
            })

    total_gain = round(total_value - total_cost, 2)

    return {
        "positions":        positions,
        "total_value":      round(total_value, 2),
        "total_cost":       round(total_cost, 2),
        "total_gain_loss":  total_gain,
        "total_gain_pct":   round((total_gain / total_cost) * 100, 2) if total_cost else 0,
    }
