from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class Onboarding(BaseModel):
    sleep_hours: float = 7.0
    sleep_latency_min: float = 20.0
    wake_feeling: int = 3
    bedtime_regularity: int = 3
    stress_freq: int = 3
    thoughts_racing: int = 3
    overload: int = 3
    focus_difficulty: int = 3
    distraction: int = 3


class UserUpsert(BaseModel):
    name: Optional[str] = None
    onboarding: Optional[Onboarding] = None


class UserOut(BaseModel):
    id: int
    tg_id: Optional[str]
    name: Optional[str]
    sleep_index: float
    stress_index: float
    focus_index: float
    created_at: datetime

    class Config:
        from_attributes = True


class DiaryIn(BaseModel):
    user_id: int
    mood: int
    energy: int
    stress: int
    sleep_quality: int
    note: Optional[str] = None


class DiaryOut(BaseModel):
    id: int
    user_id: int
    mood: int
    energy: int
    stress: int
    sleep_quality: int
    note: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class StatsOut(BaseModel):
    entries: int
    avg_sleep_quality_7d: Optional[float]
    avg_mood_7d: Optional[float]
    avg_stress_7d: Optional[float]
    focus_minutes_7d: int
    apnea_checks: int


class ApneaOut(BaseModel):
    has_apnea: bool
    confidence: float
    mode: str
    used_model: bool


class ApneaHistoryItem(BaseModel):
    id: int
    has_apnea: bool
    confidence: float
    mode: str
    created_at: datetime

    class Config:
        from_attributes = True


class FocusIn(BaseModel):
    user_id: int
    duration_min: int
    completed: bool = True


class FocusOut(BaseModel):
    id: int
    user_id: int
    duration_min: int
    completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatIn(BaseModel):
    user_id: Optional[int] = None
    message: str
    history: List[ChatMessage] = []


class LeaderboardItem(BaseModel):
    user_id: int
    name: Optional[str]
    score: float


class ArticleOut(BaseModel):
    id: str
    title: str
    summary: str
    body: str
    sources: List[str]
