import os
import tempfile
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import ApneaResult
from ..schemas import ApneaHistoryItem, ApneaOut
from ..services.apnea import run_apnea

router = APIRouter(tags=["apnea"])


@router.post("/apnea/analyze", response_model=ApneaOut)
async def analyze(
    file: UploadFile = File(...),
    user_id: Optional[int] = Form(None),
    mode: str = Form("browser"),
    db: Session = Depends(get_db),
):
    suffix = os.path.splitext(file.filename or "audio.wav")[1] or ".wav"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        tmp.write(await file.read())
        tmp.close()
        has, conf, used_model = run_apnea(tmp.name)
    finally:
        os.unlink(tmp.name)
    if user_id is not None:
        db.add(ApneaResult(user_id=user_id, has_apnea=has, confidence=conf, mode=mode))
        db.commit()
    return ApneaOut(has_apnea=has, confidence=conf, mode=mode, used_model=used_model)


@router.get("/apnea/history/{user_id}", response_model=List[ApneaHistoryItem])
def history(user_id: int, db: Session = Depends(get_db)):
    return (
        db.query(ApneaResult)
        .filter(ApneaResult.user_id == user_id)
        .order_by(ApneaResult.created_at.desc())
        .all()
    )
