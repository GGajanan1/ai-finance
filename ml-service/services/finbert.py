"""Lazy FinBERT sentiment pipeline loader."""

_pipeline = None

def get_sentiment_pipeline():
    """Load ProsusAI/finbert on first call; subsequent calls return the cached instance."""
    global _pipeline
    if _pipeline is None:
        from transformers import pipeline
        _pipeline = pipeline("sentiment-analysis", model="ProsusAI/finbert")
    return _pipeline
