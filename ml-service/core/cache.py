"""Redis client, cache helpers, and TTL constants."""
import json
import redis
from core.config import settings

# ── TTL Constants ─────────────────────────────────────────────────────────────
# Centralised so expiry policy is easy to reason about and tune in one place.

TTL_EQUITY           = 60        # 1 min  — equity prices tick every second
TTL_SENTIMENT        = 900       # 15 min — yfinance news + FinBERT is CPU-heavy
TTL_MACRO_FRED       = 3_600     # 1 hr   — FRED publishes daily
TTL_MACRO_WORLD_BANK = 86_400    # 24 hrs — World Bank updates annually/quarterly
TTL_SEARCH           = 86_400    # 24 hrs — company names rarely change
TTL_AGENT            = 14_400    # 4 hrs  — Groq calls are rate-limited

# ── Redis client (lazy singleton) ─────────────────────────────────────────────
_redis_client = None

def get_redis():
    global _redis_client
    if _redis_client is None:
        if settings.REDIS_HOST and settings.REDIS_HOST != "YOUR_REDIS_HOST_HERE":
            try:
                _redis_client = redis.Redis(
                    host=settings.REDIS_HOST,
                    port=settings.REDIS_PORT,
                    password=settings.REDIS_PASSWORD,
                    decode_responses=True,
                )
                _redis_client.ping()
                print("✅ Connected to Redis")
            except Exception as e:
                print(f"⚠️  Redis connection failed: {e}")
                _redis_client = None
    return _redis_client

def cache_get(key: str):
    r = get_redis()
    if r:
        try:
            val = r.get(key)
            if val:
                return json.loads(val)
        except Exception:
            pass
    return None

def cache_set(key: str, value, ex: int = 300):
    r = get_redis()
    if r:
        try:
            r.set(key, json.dumps(value), ex=ex)
        except Exception:
            pass
