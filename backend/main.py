"""
FastAPI application for PDF tracker
"""
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc
import json
from pathlib import Path

from config import (
    ALLOWED_ORIGINS, UPLOADS_DIR,
    S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
)
from database import init_db, get_db
import boto3
from models import PDF, Session as DBSession, PageView, Event
from schemas import (
    PDFResponse, 
    AnalyticsResponse, 
    PageViewCreate, 
    EventCreate,
    SessionCreateRequest,
)
from utils import save_uploaded_file, generate_tracking_token, calculate_analytics

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(title="PDF Tracker API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory
UPLOADS_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


# ==================== Health Check ====================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "PDF Tracker API is running"}


# ==================== Admin Routes ====================

@app.post("/api/admin/pdfs/upload", response_model=PDFResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a PDF and generate tracking link"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        file_path, token = save_uploaded_file(file, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Create PDF record
    pdf = PDF(
        filename=file.filename,
        original_filename=file.filename,
        file_path=file_path,
        tracking_token=token
    )
    db.add(pdf)
    db.commit()
    db.refresh(pdf)
    
    return PDFResponse.model_validate(pdf)


@app.get("/api/admin/pdfs", response_model=list[PDFResponse])
async def list_pdfs(db: Session = Depends(get_db)):
    """List all uploaded PDFs"""
    try:
        pdfs = db.query(PDF).order_by(desc(PDF.created_at)).all()
        return [PDFResponse.model_validate(pdf) for pdf in pdfs]
    except Exception as e:
        print(f"Error in list_pdfs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/admin/pdfs/{pdf_id}")
async def get_pdf(pdf_id: str, db: Session = Depends(get_db)):
    """Get PDF details"""
    pdf = db.query(PDF).filter(PDF.id == pdf_id).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")
    return PDFResponse.model_validate(pdf)


@app.delete("/api/admin/pdfs/{pdf_id}")
async def delete_pdf(pdf_id: str, db: Session = Depends(get_db)):
    """Delete a PDF"""
    pdf = db.query(PDF).filter(PDF.id == pdf_id).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")
    
    if S3_BUCKET:
        s3 = boto3.client(
            "s3",
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION
        )
        try:
            s3.delete_object(Bucket=S3_BUCKET, Key=pdf.file_path)
        except Exception as e:
            print(f"S3 Delete Error: {str(e)}")
    else:
        # Delete file
        if Path(pdf.file_path).exists():
            Path(pdf.file_path).unlink()
    
    db.delete(pdf)
    db.commit()
    
    return {"message": "PDF deleted"}


# ==================== Viewer Routes ====================

@app.get("/api/viewer/pdf/{tracking_token}")
async def get_pdf_file(tracking_token: str, db: Session = Depends(get_db)):
    """Get PDF file by tracking token"""
    pdf = db.query(PDF).filter(PDF.tracking_token == tracking_token).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")
    
    if S3_BUCKET:
        s3 = boto3.client(
            "s3",
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION,
            config=boto3.session.Config(signature_version='s3v4')
        )
        url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET, 'Key': pdf.file_path},
            ExpiresIn=3600
        )
        return RedirectResponse(url)
    else:
        if not Path(pdf.file_path).exists():
            raise HTTPException(status_code=404, detail="PDF file not found on disk")
        
        return FileResponse(pdf.file_path, media_type="application/pdf")


@app.post("/api/viewer/session")
async def create_session(
    tracking_token: str,
    request_data: SessionCreateRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create a viewing session"""
    pdf = db.query(PDF).filter(PDF.tracking_token == tracking_token).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")
    
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    session = DBSession(
        pdf_id=pdf.id,
        user_agent=user_agent,
        ip_address=client_ip,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return {
        "session_id": session.id,
        "session_token": session.session_token,
    }


@app.post("/api/viewer/page-view")
async def record_page_view(
    session_id: str,
    page_view: PageViewCreate,
    db: Session = Depends(get_db)
):
    """Record page view"""
    session = db.query(DBSession).filter(DBSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    pv = PageView(
        session_id=session_id,
        page_number=page_view.page_number,
    )
    db.add(pv)
    db.commit()
    db.refresh(pv)
    
    return {
        "page_view_id": pv.id,
    }


@app.put("/api/viewer/page-view/{page_view_id}")
async def update_page_view(
    page_view_id: str,
    active_time: float,
    db: Session = Depends(get_db)
):
    """Update page view with active time (active_time passed as query param)"""
    pv = db.query(PageView).filter(PageView.id == page_view_id).first()
    if not pv:
        raise HTTPException(status_code=404, detail="Page view not found")
    
    from datetime import datetime
    pv.exited_at = datetime.utcnow()
    pv.active_time = active_time
    db.commit()
    
    return {"success": True}


@app.post("/api/viewer/event")
async def record_event(
    session_id: str,
    event: EventCreate,
    db: Session = Depends(get_db)
):
    """Record an event"""
    session = db.query(DBSession).filter(DBSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    evt = Event(
        session_id=session_id,
        event_type=event.event_type,
        event_data=event.event_data,
    )
    db.add(evt)
    db.commit()
    
    return {"success": True}


@app.post("/api/viewer/session/{session_id}/end")
async def end_session(
    session_id: str,
    total_active_time: float,
    downloaded: bool = False,
    db: Session = Depends(get_db)
):
    """End a viewing session"""
    session = db.query(DBSession).filter(DBSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    from datetime import datetime
    session.ended_at = datetime.utcnow()
    session.total_active_time = total_active_time
    session.downloaded = downloaded
    db.commit()
    
    return {"success": True}


# ==================== Analytics Routes ====================

@app.get("/api/admin/analytics/{tracking_token}", response_model=dict)
async def get_analytics(tracking_token: str, db: Session = Depends(get_db)):
    """Get analytics for a PDF"""
    pdf = db.query(PDF).filter(PDF.tracking_token == tracking_token).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")
    
    sessions = db.query(DBSession).filter(DBSession.pdf_id == pdf.id).all()
    analytics = calculate_analytics(sessions)
    
    # Convert sessions to response format
    sessions_response = []
    for session in sessions:
        sessions_response.append({
            "id": session.id,
            "started_at": session.started_at,
            "ended_at": session.ended_at,
            "total_active_time": session.total_active_time,
            "downloaded": session.downloaded,
            "page_views": [
                {
                    "page_number": pv.page_number,
                    "active_time": pv.active_time,
                    "entered_at": pv.entered_at,
                    "exited_at": pv.exited_at,
                }
                for pv in session.page_views
            ]
        })
    
    analytics["sessions"] = sessions_response
    return analytics


# ==================== Health Check ====================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
