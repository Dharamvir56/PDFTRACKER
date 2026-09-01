"""
Pydantic schemas for API requests and responses
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class PDFBase(BaseModel):
    filename: str


class PDFCreate(PDFBase):
    pass


class PDFResponse(PDFBase):
    id: str
    tracking_token: str
    original_filename: str
    created_at: datetime

    class Config:
        from_attributes = True


class PageViewResponse(BaseModel):
    page_number: int
    entered_at: datetime
    exited_at: Optional[datetime]
    active_time: float

    class Config:
        from_attributes = True


class SessionResponse(BaseModel):
    id: str
    session_token: str
    started_at: datetime
    ended_at: Optional[datetime]
    total_active_time: float
    downloaded: bool
    page_views: List[PageViewResponse]

    class Config:
        from_attributes = True


class AnalyticsResponse(BaseModel):
    total_opens: int
    unique_sessions: int
    average_engagement_time: float
    total_downloads: int
    pages_data: dict  # page number -> stats
    most_viewed_page: Optional[int]
    most_engaged_page: Optional[int]
    sessions: List[SessionResponse]


class PageViewCreate(BaseModel):
    page_number: int


class EventCreate(BaseModel):
    event_type: str
    event_data: str


class SessionCreateRequest(BaseModel):
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
