from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from .db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    tg_id = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, nullable=True)
    sleep_index = Column(Float, default=0.0)
    stress_index = Column(Float, default=0.0)
    focus_index = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    diary = relationship("DiaryEntry", back_populates="user", cascade="all, delete-orphan")
    apnea = relationship("ApneaResult", back_populates="user", cascade="all, delete-orphan")
    focus = relationship("FocusSession", back_populates="user", cascade="all, delete-orphan")


class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    mood = Column(Integer, nullable=False)
    energy = Column(Integer, nullable=False)
    stress = Column(Integer, nullable=False)
    sleep_quality = Column(Integer, nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="diary")


class ApneaResult(Base):
    __tablename__ = "apnea_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    has_apnea = Column(Boolean, nullable=False)
    confidence = Column(Float, nullable=False)
    mode = Column(String, default="browser")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="apnea")


class FocusSession(Base):
    __tablename__ = "focus_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    duration_min = Column(Integer, nullable=False)
    completed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="focus")
