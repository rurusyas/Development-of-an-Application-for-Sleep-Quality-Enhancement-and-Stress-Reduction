from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import User
from ..schemas import UserOut, UserUpsert
from ..services.indices import compute_all

router = APIRouter(tags=["user"])


@router.get("/user/{tg_id}", response_model=UserOut)
def get_user(tg_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.tg_id == tg_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="user not found")
    return user


@router.post("/user/{tg_id}", response_model=UserOut)
def upsert_user(tg_id: str, payload: UserUpsert, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.tg_id == tg_id).first()
    if not user:
        user = User(tg_id=tg_id)
        db.add(user)
    if payload.name is not None:
        user.name = payload.name
    if payload.onboarding is not None:
        idx = compute_all(payload.onboarding)
        user.sleep_index = idx["sleep_index"]
        user.stress_index = idx["stress_index"]
        user.focus_index = idx["focus_index"]
    db.commit()
    db.refresh(user)
    return user
