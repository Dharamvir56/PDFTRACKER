"""
Database models for PDF tracker
"""
from sqlalchemy import Column, String, Integer, DateTime, Float, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()


class PDF(Base):
    __tablename__ = "pdfs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, index=True)
    original_filename = Column(String)
    file_path = Column(String)
    tracking_token = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sessions = relationship("Session", back_populates="pdf", cascade="all, delete-orphan")
    
    class Config:
        from_attributes = True


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pdf_id = Column(String, ForeignKey("pdfs.id"), index=True)
    session_token = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))
    user_agent = Column(String)
    ip_address = Column(String)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    total_active_time = Column(Float, default=0)  # in seconds
    downloaded = Column(Boolean, default=False)
    
    pdf = relationship("PDF", back_populates="sessions")
    page_views = relationship("PageView", back_populates="session", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="session", cascade="all, delete-orphan")
    
    class Config:
        from_attributes = True


class PageView(Base):
    __tablename__ = "page_views"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id"), index=True)
    page_number = Column(Integer)
    entered_at = Column(DateTime, default=datetime.utcnow)
    exited_at = Column(DateTime, nullable=True)
    active_time = Column(Float, default=0)  # in seconds (excluding inactive time)
    
    session = relationship("Session", back_populates="page_views")
    
    class Config:
        from_attributes = True


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("sessions.id"), index=True)
    event_type = Column(String)  # "page_change", "zoom", "fullscreen", "download", etc.
    event_data = Column(Text)  # JSON string with event details
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("Session", back_populates="events")
    
    class Config:
        from_attributes = True
