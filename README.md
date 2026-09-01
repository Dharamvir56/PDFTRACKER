# PDF Tracker - Free Self-Hosted PDF Tracking Application

A completely open-source, self-hosted PDF tracking system. Upload PDFs, generate unique shareable links, and track engagement in real-time. No paid services, no vendor lock-in.

## Features

✅ **PDF Upload & Management**
- Simple one-click PDF upload
- Unique tracking links generated automatically
- File management dashboard

✅ **PDF Viewer**
- Built-in PDF.js viewer
- Page navigation, zoom, fullscreen
- Smooth and responsive

✅ **Smart Engagement Tracking**
- Page-level tracking with active time calculation
- Intelligent pause detection (ignores inactive tabs)
- Session-based analytics
- Download tracking

✅ **Analytics Dashboard**
- Total PDF opens and unique sessions
- Average engagement time
- Page-by-page statistics
- Most viewed/engaged pages
- Individual session timelines
- Download metrics

✅ **Fully Self-Hosted**
- FastAPI backend
- Next.js frontend
- SQLite database (easily upgradeable to PostgreSQL)
- No external APIs or services required
- No tracking code injections or privacy concerns

## Tech Stack

- **Frontend**: Next.js 14 + React 18 + Tailwind CSS
- **Backend**: FastAPI (Python 3.8+)
- **PDF Viewer**: PDF.js
- **Database**: SQLite (PostgreSQL ready)
- **Styling**: Tailwind CSS
- **Storage**: Local file system

## Project Structure

```
tracker/
├── backend/                    # FastAPI application
│   ├── main.py                # Main FastAPI app
│   ├── models.py              # SQLAlchemy models
│   ├── schemas.py             # Pydantic schemas
│   ├── database.py            # Database configuration
│   ├── utils.py               # Utility functions
│   ├── config.py              # Configuration
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables
│   ├── .gitignore
│   └── uploads/               # Uploaded PDFs (created on first run)
│
├── frontend/                  # Next.js application
│   ├── pages/
│   │   ├── index.tsx         # Home page
│   │   ├── admin.tsx         # Admin dashboard
│   │   ├── docs.tsx          # Documentation
│   │   ├── _app.tsx          # Next.js app wrapper
│   │   ├── _document.tsx     # Next.js document
│   │   ├── viewer/
│   │   │   └── [token].tsx   # PDF viewer page
│   │   └── analytics/
│   │       └── [token].tsx   # Analytics page
│   ├── styles/
│   │   └── globals.css       # Global styles
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── tsconfig.json
│
└── README.md                  # This file
```

## Quick Start

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher (for frontend)
- npm or yarn

### 1. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

Backend will be available at `http://localhost:8000`

### 2. Frontend Setup (Next.js)

Open a new terminal and run:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Usage

### 1. Upload a PDF

1. Go to http://localhost:3000
2. Click "Admin Dashboard"
3. Click the file input and select a PDF
4. The PDF is uploaded and saved

### 2. Generate Tracking Link

1. In the admin dashboard, find your uploaded PDF
2. Click "Copy Link" to copy the unique tracking URL
3. Share this link: `http://localhost:3000/viewer/[unique-token]`

### 3. Share with Users

Share the tracking link with your audience. Each person who opens it will:
- See the PDF in the built-in viewer
- Have their engagement tracked automatically
- Not see any tracking UI or invasive analytics

### 4. View Analytics

1. Go to Admin Dashboard
2. Click "Analytics" next to a PDF
3. View:
   - Total opens and unique sessions
   - Average engagement time
   - Page-by-page statistics
   - Individual session timelines with page-level breakdown

## Tracking Details

### What Gets Tracked

✅ Session information:
- Start and end time
- Total active engagement time
- Device/browser information
- Client IP address

✅ Page-level data:
- Page number
- Entry and exit time
- Active time on page
- Page view count

✅ Additional events:
- PDF downloads
- Zoom interactions
- Fullscreen mode

### How Active Time Works

The system intelligently calculates active time by:

1. Tracking user interactions (mouse, keyboard, clicks)
2. Pausing time tracking when:
   - Browser tab becomes hidden
   - Browser window loses focus
   - No user activity for 30 seconds
3. Resuming when user activity is detected

This prevents inflated metrics from PDFs left open in background tabs.

### Privacy & Data

- All tracking is local to your server
- No third-party analytics services
- No data sent to external APIs
- Users are identified only by anonymous session tokens
- You have full control over all data

## Database

### SQLite (Default)

Database file: `backend/tracker.db`

To backup:
```bash
cp backend/tracker.db backend/tracker.db.backup
```

### Upgrade to PostgreSQL

1. Install PostgreSQL
2. Create a database: `createdb tracker`
3. Update `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost/tracker
   ```
4. Install psycopg2:
   ```bash
   pip install psycopg2-binary
   ```
5. Restart backend

## API Endpoints

### Admin Endpoints

- `POST /api/admin/pdfs/upload` - Upload a PDF
- `GET /api/admin/pdfs` - List all PDFs
- `GET /api/admin/pdfs/{pdf_id}` - Get PDF details
- `DELETE /api/admin/pdfs/{pdf_id}` - Delete a PDF
- `GET /api/admin/analytics/{tracking_token}` - Get analytics

### Viewer Endpoints

- `GET /api/viewer/pdf/{tracking_token}` - Get PDF file
- `POST /api/viewer/session` - Create a session
- `POST /api/viewer/page-view` - Record page view
- `PUT /api/viewer/page-view/{page_view_id}` - Update page view
- `POST /api/viewer/event` - Record event
- `POST /api/viewer/session/{session_id}/end` - End session

## Configuration

### Backend Configuration

Edit `backend/config.py`:

```python
DATABASE_URL = "sqlite:///./tracker.db"  # Change to PostgreSQL if needed
UPLOADS_DIR = Path("uploads")
MAX_PDF_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_ORIGINS = ["http://localhost:3000", ...]
```

### Frontend Configuration

Edit `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development

### Enable Hot Reload

Both frontend and backend support hot reload:

**Backend**: Just save changes to `.py` files and the server will restart

**Frontend**: Changes to `.tsx` files are automatically reflected

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
npm run start
```

**Backend:**
```bash
cd backend
python main.py
# Or use gunicorn for production:
# pip install gunicorn
# gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

## Future Enhancements

The codebase is designed to be modular and easy to extend:

- [ ] User authentication and PDF ownership
- [ ] Multiple PDFs per user/team
- [ ] Website heatmaps and click tracking
- [ ] CRM integration (Salesforce, HubSpot, Pipedrive)
- [ ] Advanced AI analytics
- [ ] PostgreSQL and Redis support
- [ ] Cloud deployment (AWS, GCP, Heroku)
- [ ] Real-time analytics with WebSockets
- [ ] Email notifications and alerts
- [ ] PDF annotations and commenting
- [ ] Bulk analytics export (CSV, PDF)

## Troubleshooting

### Backend won't start

```bash
# Make sure you've activated the virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Check Python version
python --version  # Should be 3.8+

# Try installing dependencies again
pip install -r requirements.txt
```

### Frontend won't connect to backend

1. Make sure backend is running on `http://localhost:8000`
2. Check CORS settings in `backend/config.py`
3. Browser console may show CORS errors - they're okay for local development
4. Make sure port 8000 isn't already in use

### PDFs not uploading

1. Check backend terminal for error messages
2. Ensure PDF file size is under 50MB
3. Verify file is actually a PDF (not renamed)
4. Check disk space in `backend/` directory

## Support

For issues, questions, or suggestions:

1. Check the Documentation page in the app
2. Review API endpoints in `backend/main.py`
3. Check browser console for errors
4. Check backend terminal for server logs

## License

This project is free and open-source. Use it however you like!

## Contributing

Feel free to fork, modify, and improve this project for your needs.

---

**Built with ❤️ for privacy-conscious teams who want complete control over their data.**
