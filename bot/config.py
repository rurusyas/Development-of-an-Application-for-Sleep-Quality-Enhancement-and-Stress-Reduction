import os
BOT_TOKEN = os.getenv("BOT_TOKEN")
API_BASE = os.getenv("API_BASE", "http://localhost:8000").rstrip("/")
MINIAPP_URL = os.getenv("MINIAPP_URL", "")
if not BOT_TOKEN:
    raise RuntimeError("Не задан BOT_TOKEN. Добавь его в переменные окружения или .env")
