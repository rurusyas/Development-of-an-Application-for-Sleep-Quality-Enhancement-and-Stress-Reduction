from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import DiaryEntry, User
from ..schemas import LeaderboardItem

router = APIRouter(tags=["leaderboard"])


@router.get("/leaderboard", response_model=List[LeaderboardItem])
def leaderboard(db: Session = Depends(get_db)):
    since = datetime.utcnow() - timedelta(days=7)
    rows = []
    for user in db.query(User).all():
        quals = [
            e.sleep_quality
            for e in user.diary
            if e.created_at and e.created_at >= since
        ]
        if not quals:
            continue
        rows.append(
            LeaderboardItem(
                user_id=user.id,
                name=user.name,
                score=round(sum(quals) / len(quals), 2),
            )
        )
    rows.sort(key=lambda r: r.score, reverse=True)
    return rows
