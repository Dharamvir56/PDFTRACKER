"""
Utility functions for file handling and analytics
"""
import secrets
import os
import boto3
from config import (
    UPLOADS_DIR, ALLOWED_EXTENSIONS, MAX_PDF_SIZE,
    S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
)
from pathlib import Path


def generate_tracking_token(length: int = 16) -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(length)


def save_uploaded_file(file, filename: str) -> tuple[str, str]:
    """
    Save uploaded file to disk
    Returns: (file_path, token)
    """
    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to start
    
    if file_size > MAX_PDF_SIZE:
        raise ValueError(f"File size exceeds {MAX_PDF_SIZE / (1024*1024):.0f}MB limit")
    
    # Check file extension
    file_ext = Path(filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"File type not allowed. Allowed types: {ALLOWED_EXTENSIONS}")
    
    # Generate secure filename
    token = generate_tracking_token()
    file_path = f"{token}.pdf"
    
    if S3_BUCKET:
        # Upload to S3
        s3 = boto3.client(
            "s3",
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION
        )
        s3.upload_fileobj(
            file.file,
            S3_BUCKET,
            file_path,
            ExtraArgs={"ContentType": "application/pdf"}
        )
        return file_path, token
    else:
        # Save locally
        local_path = UPLOADS_DIR / file_path
        with open(local_path, "wb") as f:
            content = file.file.read()
            f.write(content)
        return str(local_path), token


def get_pdf_page_count(file_path: str) -> int:
    """Get number of pages in PDF"""
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(file_path)
        return len(reader.pages)
    except Exception:
        return 0


def calculate_analytics(sessions: list, pdfs_dict: dict = None) -> dict:
    """
    Calculate analytics from sessions
    """
    if not sessions:
        return {
            "total_opens": 0,
            "unique_sessions": 0,
            "average_engagement_time": 0,
            "total_downloads": 0,
            "pages_data": {},
            "most_viewed_page": None,
            "most_engaged_page": None,
        }
    
    total_active_time = sum(s.total_active_time for s in sessions)
    average_time = total_active_time / len(sessions) if sessions else 0
    total_downloads = sum(1 for s in sessions if s.downloaded)
    
    # Calculate page statistics
    pages_data = {}
    for session in sessions:
        for page_view in session.page_views:
            page_num = page_view.page_number
            if page_num not in pages_data:
                pages_data[page_num] = {
                    "views": 0,
                    "total_active_time": 0,
                    "average_time": 0,
                }
            pages_data[page_num]["views"] += 1
            pages_data[page_num]["total_active_time"] += page_view.active_time
    
    # Calculate averages
    for page_num in pages_data:
        if pages_data[page_num]["views"] > 0:
            pages_data[page_num]["average_time"] = (
                pages_data[page_num]["total_active_time"] / pages_data[page_num]["views"]
            )
    
    # Find most viewed and most engaged pages
    most_viewed_page = None
    most_engaged_page = None
    
    if pages_data:
        most_viewed_page = max(pages_data.keys(), key=lambda p: pages_data[p]["views"])
        most_engaged_page = max(pages_data.keys(), key=lambda p: pages_data[p]["total_active_time"])
    
    return {
        "total_opens": len(sessions),
        "unique_sessions": len(sessions),
        "average_engagement_time": average_time,
        "total_downloads": total_downloads,
        "pages_data": pages_data,
        "most_viewed_page": most_viewed_page,
        "most_engaged_page": most_engaged_page,
    }
