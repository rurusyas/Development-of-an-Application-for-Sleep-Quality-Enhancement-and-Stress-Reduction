from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import ApneaResult, DiaryEntry, FocusSession
from ..schemas import StatsOut

router = APIRouter(tags=["stats"])


def _avg(values):
    return round(sum(values) / len(values), 2) if values else None


@router.get("/stats/{user_id}", response_model=StatsOut)
def get_stats(user_id: int, db: Session = Depends(get_db)):
    since = datetime.utcnow() - timedelta(days=7)
    entries = db.query(DiaryEntry).filter(DiaryEntry.user_id == user_id).all()
    recent = [e for e in entries if e.created_at and e.created_at >= since]
    focus = (
        db.query(FocusSession)
        .filter(FocusSession.user_id == user_id, FocusSession.created_at >= since)
        .all()
    )
    apnea_count = db.query(ApneaResult).filter(ApneaResult.user_id == user_id).count()
    return StatsOut(
        entries=len(entries),
        avg_sleep_quality_7d=_avg([e.sleep_quality for e in recent]),
        avg_mood_7d=_avg([e.mood for e in recent]),
        avg_stress_7d=_avg([e.stress for e in recent]),
        focus_minutes_7d=sum(f.duration_min for f in focus if f.completed),
        apnea_checks=apnea_count,
    )
