from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import FocusSession
from ..schemas import FocusIn, FocusOut

router = APIRouter(tags=["focus"])


@router.post("/focus", response_model=FocusOut)
def add_focus(payload: FocusIn, db: Session = Depends(get_db)):
    session = FocusSession(
        user_id=payload.user_id,
        duration_min=payload.duration_min,
        completed=payload.completed,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/focus/{user_id}", response_model=List[FocusOut])
def get_focus(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(FocusSession)
        .filter(FocusSession.user_id == user_id)
        .order_by(FocusSession.created_at.desc())
        .all()
    )
