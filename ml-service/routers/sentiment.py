"""Router: GET /api/sentiment  |  POST /api/sentiment/analyze-custom"""
import yfinance as yf
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.cache import cache_get, cache_set, TTL_SENTIMENT
from services.finbert import get_sentiment_pipeline

router = APIRouter()

# ── GET /api/sentiment ────────────────────────────────────────────────────────
@router.get("/api/sentiment")
def get_sentiment(query: str = "general", limit: int = 5, refresh: bool = False):
    cache_key = f"sentiment_{query}_{limit}"
    if not refresh:
        cached = cache_get(cache_key)
        if cached:
            return cached

    try:
        target = query if query != "general" else "SPY"
        news   = yf.Ticker(target).news or []

        headlines = (
            [item["content"]["title"] for item in news[:limit]]
            if news
            else [
                "Market remains flat ahead of economic data",
                "Tech stocks show resilience amid rate hike fears",
            ]
        )

        nlp     = get_sentiment_pipeline()
        results = []
        for h in headlines:
            res       = nlp(h)[0]
            label     = res["label"]
            score_val = res["score"]
            num_score = score_val if label == "positive" else (-score_val if label == "negative" else 0.0)
            results.append({"headline": h, "score": num_score, "label": label})

        avg_score = sum(r["score"] for r in results) / len(results) if results else 0
        result    = {"query": query, "articles": results, "average_score": avg_score}

        cache_set(cache_key, result, ex=TTL_SENTIMENT)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── POST /api/sentiment/analyze-custom ───────────────────────────────────────
class CustomNewsRequest(BaseModel):
    text: str

@router.post("/api/sentiment/analyze-custom")
def analyze_custom_news(req: CustomNewsRequest):
    """Runs FinBERT + Groq LLM on user-provided news text."""
    if not req.text or len(req.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text too short to analyze.")

    try:
        nlp         = get_sentiment_pipeline()
        bert_result = nlp(req.text[:512])[0]
        label       = bert_result["label"]
        score_val   = bert_result["score"]
        num_score   = score_val if label == "positive" else (-score_val if label == "negative" else 0.0)

        finbert_output = {
            "label":      label,
            "confidence": round(score_val * 100, 2),
            "score":      round(num_score, 4),
        }

        from langchain_groq import ChatGroq
        llm    = ChatGroq(model="llama-3.1-8b-instant", temperature=0.2)
        prompt = f"""You are a financial analyst assistant.

A user has submitted the following news/text for analysis:
\"\"\"{req.text}\"\"\"

FinBERT has classified this as: {label.upper()} with {score_val*100:.1f}% confidence.

Provide a concise professional response in Markdown with:
## Summary
A 2-3 sentence plain summary of what the news says.

## Market Implications
Briefly explain potential impact on markets or related stocks.

## Agent Feedback on FinBERT Classification
Do you agree with the FinBERT sentiment? Explain your reasoning briefly."""

        agent_summary = llm.invoke(prompt).content

        return {"text": req.text, "finbert": finbert_output, "agent_summary": agent_summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
