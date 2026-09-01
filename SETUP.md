# Complete Setup Guide - PDF Tracker

This guide will walk you through setting up the PDF Tracker application locally on Windows, macOS, or Linux.

## Prerequisites

Before you start, ensure you have:

1. **Python 3.8 or higher**
   - Download from: https://www.python.org/downloads/
   - ✅ Check: Open terminal/cmd and run `python --version`

2. **Node.js 16 or higher**
   - Download from: https://nodejs.org/
   - ✅ Check: Open terminal/cmd and run `node --version`

3. **Git** (optional but recommended)
   - Download from: https://git-scm.com/

## Step-by-Step Setup

### Step 1: Open Two Terminal Windows

You'll need one terminal for the backend and one for the frontend. Open them now!

---

### Step 2: Backend Setup (Python + FastAPI)

In your **first terminal**:

```bash
# Navigate to the project directory
cd path/to/tracker

# Go into the backend directory
cd backend
```

#### On Windows:

```bash
# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

#### On macOS/Linux:

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

**✅ Success:** You should see output like:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**🔗 Backend is now running at: http://localhost:8000**

---

### Step 3: Frontend Setup (Next.js + React)

In your **second terminal** (keep the first one running!):

```bash
# Navigate to the project directory
cd path/to/tracker

# Go into the frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**✅ Success:** You should see output like:
```
> pdf-tracker-frontend@1.0.0 dev
> next dev

  ▲ Next.js 14.0.3
  - Local:        http://localhost:3000
  - Environments: .env.local
```

**🔗 Frontend is now running at: http://localhost:3000**

---

### Step 4: Access the Application

Open your web browser and go to: **http://localhost:3000**

You should see the PDF Tracker home page with a link to the Admin Dashboard.

---

## First Test: Upload and View PDF

### 1. Upload a PDF

1. Click **"Admin Dashboard"** on the home page
2. Scroll down to "Upload PDF"
3. Click the file input and select a PDF from your computer
4. Wait for upload to complete
5. You should see your PDF listed in the "Uploaded PDFs" table

### 2. Generate Tracking Link

1. In the PDFs list, find your uploaded PDF
2. Click **"Copy Link"** button
3. The tracking URL is copied to your clipboard

### 3. Open PDF in Viewer

1. Paste the tracking link in a new browser tab
2. You should see the PDF in the built-in viewer
3. Try these features:
   - Navigate pages with "Previous" / "Next" buttons
   - Change page using the page input box
   - Zoom in/out with +/- buttons
   - Click "Fullscreen" for fullscreen mode
   - Click "Download" to download the PDF

### 4. Check Analytics

1. Go back to Admin Dashboard
2. Click **"Analytics"** next to your PDF
3. You should see:
   - **Total Opens: 1**
   - **Unique Sessions: 1**
   - **Avg. Engagement Time:** (shows your viewing time)
   - **Page-by-Page Statistics:** Shows time spent on each page
   - **Individual Sessions:** Lists your session with page timeline

---

## Tracking Verification

The system tracked:
- ✅ Session started when you opened the PDF
- ✅ Each page you viewed
- ✅ Time spent on each page
- ✅ Total active engagement time
- ✅ Session ended when you navigated away

---

## Multiple Views Test

To test engagement tracking across multiple views:

1. **View 1:** Copy the tracking link and open it again
2. Spend different amounts of time on different pages
3. Download the PDF
4. Go to Analytics
5. You'll see:
   - `Total Opens: 2`
   - `Average Engagement Time: (average of both sessions)`
   - Individual session timelines

---

## Useful Commands

### Stop Backend
Press `CTRL + C` in the backend terminal

### Stop Frontend
Press `CTRL + C` in the frontend terminal

### Restart Backend
```bash
# Terminal 1
python main.py
```

### Restart Frontend
```bash
# Terminal 2
npm run dev
```

### Reset Database (Delete All Data)
```bash
# Terminal 1 (backend)
# Delete the database file:
# Windows: del backend\tracker.db
# macOS/Linux: rm backend/tracker.db

# Then restart the backend
python main.py
```

---

## Common Issues & Solutions

### Issue: "Address already in use" on port 8000

Backend port is already in use.

**Solution:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID [PID] /F

# macOS/Linux
lsof -i :8000
kill -9 [PID]
```

### Issue: "Address already in use" on port 3000

Frontend port is already in use.

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# macOS/Linux
lsof -i :3000
kill -9 [PID]
```

### Issue: "Module not found" or "pip not found"

Virtual environment not activated or Python not installed.

**Solution:**
```bash
# Verify Python installation
python --version

# Make sure you're in the backend directory
cd backend

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install again
pip install -r requirements.txt
```

### Issue: "npm not found"

Node.js not installed or not in PATH.

**Solution:**
```bash
# Check Node.js installation
node --version
npm --version

# If not found, download and install from https://nodejs.org/
```

### Issue: "CORS error" in browser console

Frontend can't connect to backend.

**Solution:**
1. Make sure backend is running on `http://localhost:8000`
2. Check that no firewall is blocking port 8000
3. Restart both backend and frontend

### Issue: PDFs not uploading

**Possible causes:**
1. File size exceeds 50MB
2. File is not actually a PDF
3. Disk space issue
4. Backend crashed

**Solution:**
1. Check backend terminal for error messages
2. Try with a smaller PDF
3. Restart backend

---

## Next Steps

Once everything is working:

1. **Share Tracking Links:** Copy PDF tracking URLs and share with others
2. **Monitor Analytics:** Check analytics dashboard for engagement metrics
3. **Explore Code:** The code is modular and easy to customize
4. **Customization Ideas:**
   - Change colors in `frontend/tailwind.config.js`
   - Modify tracking logic in `frontend/pages/viewer/[token].tsx`
   - Add user authentication in backend

---

## Database Information

- **Database File:** `backend/tracker.db` (SQLite)
- **Location:** Inside the backend folder
- **Data Stored:**
  - PDFs metadata
  - Viewing sessions
  - Page views
  - Events (downloads, etc.)

### Backup Your Data

```bash
# Copy the database file
cp backend/tracker.db backend/tracker.db.backup

# Restore from backup
cp backend/tracker.db.backup backend/tracker.db
```

---

## Environment Variables

Both applications use default configurations that work out-of-the-box.

### Backend `.env` (optional customization):

```
DATABASE_URL=sqlite:///./tracker.db
SECRET_KEY=your-secret-key-change-in-production
```

### Frontend (no .env needed for local dev)

Frontend connects to `http://localhost:8000` by default.

---

## API Documentation

### Admin Endpoints

```
POST   /api/admin/pdfs/upload           - Upload PDF
GET    /api/admin/pdfs                  - List PDFs
GET    /api/admin/pdfs/{pdf_id}         - Get PDF details
DELETE /api/admin/pdfs/{pdf_id}         - Delete PDF
GET    /api/admin/analytics/{token}     - Get analytics
```

### Viewer Endpoints

```
GET    /api/viewer/pdf/{token}          - Get PDF file
POST   /api/viewer/session              - Create session
POST   /api/viewer/page-view            - Record page view
PUT    /api/viewer/page-view/{id}       - Update page view
POST   /api/viewer/event                - Record event
POST   /api/viewer/session/{id}/end     - End session
```

---

## Production Deployment

For small production deployments:

1. **Use PostgreSQL instead of SQLite:**
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/tracker
   ```

2. **Use Gunicorn for backend:**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:8000 main:app
   ```

3. **Build frontend for production:**
   ```bash
   npm run build
   npm run start
   ```

4. **Use Docker (optional):**
   ```bash
   docker-compose up
   ```

---

## Getting Help

If you encounter issues:

1. **Check the documentation:** See `Documentation` link in the app
2. **Check terminal output:** Look for error messages
3. **Browser console:** Press F12 and check Console tab for JavaScript errors
4. **Restart everything:** Sometimes a fresh start helps

---

## You're All Set! 🎉

Your PDF Tracker is now running locally. Start uploading PDFs and tracking engagement!

**Questions?** Check the in-app documentation or review the source code - it's well-commented and easy to understand.
