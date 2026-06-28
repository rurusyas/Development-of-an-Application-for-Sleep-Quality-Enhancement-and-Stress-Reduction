from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import DiaryEntry
from ..schemas import DiaryIn, DiaryOut

router = APIRouter(tags=["diary"])


@router.post("/diary", response_model=DiaryOut)
def add_diary(payload: DiaryIn, db: Session = Depends(get_db)):
    entry = DiaryEntry(
        user_id=payload.user_id,
        mood=payload.mood,
        energy=payload.energy,
        stress=payload.stress,
        sleep_quality=payload.sleep_quality,
        note=payload.note,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/diary/{user_id}", response_model=List[DiaryOut])
def get_diary(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(DiaryEntry)
        .filter(DiaryEntry.user_id == user_id)
        .order_by(DiaryEntry.created_at.desc())
        .all()
    )
