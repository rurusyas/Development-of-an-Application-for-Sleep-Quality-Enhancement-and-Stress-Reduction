import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import init_db
from .routes import apnea, chat, content, diary, focus, leaderboard, stats, user

app = FastAPI(title="Orca API", version="0.1.0")

_origins_env = os.getenv("CORS_ORIGINS", "*")
origins = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False if origins == ["*"] else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(diary.router)
app.include_router(stats.router)
app.include_router(content.router)
app.include_router(apnea.router)
app.include_router(chat.router)
app.include_router(leaderboard.router)
app.include_router(focus.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}
