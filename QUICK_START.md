# Quick Start Guide (2 Minutes)

## TL;DR - Run These Commands

### Terminal 1 (Backend):
```bash
cd tracker/backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

### Terminal 2 (Frontend):
```bash
cd tracker/frontend
npm install
npm run dev
```

### Then Open:
**http://localhost:3000**

---

## What Just Happened?

✅ Backend (FastAPI) running on `http://localhost:8000`
✅ Frontend (Next.js) running on `http://localhost:3000`
✅ Database (SQLite) created at `backend/tracker.db`

---

## Test It (5 Minutes)

1. Click **Admin Dashboard**
2. Upload a PDF
3. Click **Copy Link**
4. Open the link in a new tab
5. View the PDF and spend time on each page
6. Go back to Admin and click **Analytics**
7. See your engagement metrics!

---

## Stop the App

Press `CTRL + C` in both terminals.

---

## Need Help?

- Full setup guide: `SETUP.md`
- Documentation: In-app "Documentation" link
- API docs: `backend/main.py`

---

**That's it! You're running PDF Tracker locally! 🎉**
