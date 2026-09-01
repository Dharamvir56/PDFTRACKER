# Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PDF Tracker System                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐              ┌──────────────────────┐ │
│  │   Frontend       │              │   Backend            │ │
│  │   (Next.js)      │◄────API────►│   (FastAPI)          │ │
│  │                  │   http://    │                      │ │
│  │ - Home Page      │   localhost: │ - PDF Upload         │ │
│  │ - Admin Panel    │   8000       │ - Session Mgmt       │ │
│  │ - PDF Viewer     │              │ - Analytics API      │ │
│  │ - Analytics      │              │ - File Storage       │ │
│  │   Dashboard      │              │                      │ │
│  │                  │              │ ┌──────────────────┐ │ │
│  └──────────────────┘              │ │   SQLite DB      │ │ │
│   localhost:3000                   │ │ - PDFs table     │ │ │
│                                    │ │ - Sessions table │ │ │
│                                    │ │ - PageViews      │ │ │
│                                    │ │ - Events         │ │ │
│                                    │ └──────────────────┘ │ │
│                                    │                      │ │
│                                    │ ┌──────────────────┐ │ │
│                                    │ │   File Storage   │ │ │
│                                    │ │   /uploads/      │ │ │
│                                    │ │   *.pdf files    │ │ │
│                                    │ └──────────────────┘ │ │
│                                    │                      │ │
│                                    │   localhost:8000     │ │
│                                    └──────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## User Flow

```
┌─────────────┐
│   Admin     │
│   User      │
└──────┬──────┘
       │
       ├─────────────────────────────┐
       │                             │
       ▼                             ▼
  ┌─────────────┐           ┌──────────────────┐
  │   Upload    │           │  Copy Tracking   │
  │    PDF      │           │      Link        │
  │  (Admin)    │           │    (Admin)       │
  └──────┬──────┘           └──────┬───────────┘
         │                         │
         │ POST /api/admin/        │
         │     pdfs/upload         │ GET /api/admin/pdfs
         │                         │
         ▼                         ▼
  ┌─────────────┐           ┌──────────────────────┐
  │  Backend    │           │   Generate Token     │
  │  Saves PDF  │           │   Return URL with    │
  │             │           │   unique token       │
  └──────┬──────┘           └──────┬───────────────┘
         │                         │
         │ Stored in:              │ Share with:
         │ uploads/                │
         │ [token].pdf             │ Viewers via link
         │                         │
         ▼                         ▼
  ┌─────────────────────┐  ┌──────────────────────┐
  │   Database          │  │   PDF Viewer Page    │
  │   PDFs table        │  │   (New Session)      │
  │   Records metadata  │  │   /viewer/[token]    │
  └─────────────────────┘  └──────┬───────────────┘
                                   │
                                   ├──────────────────────┐
                                   │                      │
                                   ▼                      ▼
                            ┌─────────────┐      ┌──────────────┐
                            │   Tracking  │      │   PDF.js     │
                            │   Session   │      │   Viewer     │
                            │   Starts    │      │   Renders    │
                            │             │      │   PDF        │
                            └──────┬──────┘      └──────┬───────┘
                                   │                    │
                                   ▼                    ▼
                            ┌──────────────────────────────────┐
                            │  User Views PDF & Interacts      │
                            │ - Page navigation                │
                            │ - Zoom in/out                    │
                            │ - Download                       │
                            │ - Time tracked per page          │
                            └──────┬───────────────────────────┘
                                   │
                                   │ POST /api/viewer/session
                                   │ POST /api/viewer/page-view
                                   │ PUT /api/viewer/page-view/{id}
                                   │
                                   ▼
                            ┌──────────────────────────────────┐
                            │   Backend Records Engagement     │
                            │ - Sessions table                 │
                            │ - PageViews table                │
                            │ - Calculates active time         │
                            └──────┬───────────────────────────┘
                                   │
                                   ▼
                            ┌──────────────────────────────────┐
                            │   Admin Views Analytics          │
                            │ /analytics/[token]               │
                            │ - Total opens                    │
                            │ - Page statistics                │
                            │ - Session timelines              │
                            └──────────────────────────────────┘
```

## Tracking Flow (Client-Side)

```
┌─────────────────────────────────────────────────────────┐
│         PDF Viewer Page - Tracking Process              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
                ┌─────────────────────┐
                │  User Opens Link    │
                │ /viewer/[token]     │
                └────────┬────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │   Create Session (POST)            │
        │   - Session ID: uuid               │
        │   - User-Agent: browser info       │
        │   - IP: client IP                  │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │   User Navigates Pages             │
        │   PDF.js renders current page      │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────────┐
        │   For Each Page View:                      │
        │   1. POST /page-view (start tracking)      │
        │   2. Track user activity:                  │
        │      - Mouse moves                         │
        │      - Clicks                              │
        │      - Keyboard input                      │
        │   3. Detect inactivity:                    │
        │      - Tab hidden event                    │
        │      - No activity for 30s                 │
        │      - Pause time tracking                 │
        │   4. PUT /page-view (save active time)     │
        └────────────┬───────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │   Repeat for Each Page             │
        │   Build Timeline:                  │
        │   - Page 1: 45s                    │
        │   - Page 2: 2m 15s                 │
        │   - Page 3: 1m 30s                 │
        │   - ...                            │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │   User Closes Tab / Leaves         │
        │                                    │
        │   POST /session/{id}/end           │
        │   - Total active time: sum of all  │
        │   - Downloaded: boolean            │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │   Session Saved in Database        │
        │   Admin can view analytics         │
        │   and detailed session timeline    │
        └────────────────────────────────────┘
```

## Database Schema

```
┌──────────────────────────────────────────────────────────┐
│                      Database (SQLite)                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐        ┌──────────────────────┐    │
│  │      PDFs       │        │     Sessions         │    │
│  ├─────────────────┤        ├──────────────────────┤    │
│  │ id (PK)         │◄───┐   │ id (PK)              │    │
│  │ filename        │    │   │ pdf_id (FK) ────────┐│   │
│  │ file_path       │    │   │ session_token       ││   │
│  │ tracking_token  │    │   │ user_agent          ││   │
│  │ created_at      │    │   │ ip_address          ││   │
│  └─────────────────┘    │   │ started_at          ││   │
│                         │   │ ended_at            ││   │
│                         │   │ total_active_time   ││   │
│                         │   │ downloaded          ││   │
│                         │   └──────────────────────┘│   │
│                         │         │ 1:N            │   │
│                         └─────────┼────────────────┘   │
│                                   │                    │
│                    ┌──────────────┴──────────────┐    │
│                    │                             │    │
│  ┌─────────────────────────┐    ┌──────────────────┐ │
│  │     Page_Views          │    │     Events       │ │
│  ├─────────────────────────┤    ├──────────────────┤ │
│  │ id (PK)                 │    │ id (PK)          │ │
│  │ session_id (FK) ────────┼────│ session_id (FK) ─┼─┤
│  │ page_number             │    │ event_type       │ │
│  │ entered_at              │    │ event_data       │ │
│  │ exited_at               │    │ timestamp        │ │
│  │ active_time             │    └──────────────────┘ │
│  └─────────────────────────┘                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## API Endpoint Flow

```
Admin Dashboard                PDF Viewer Page
      │                              │
      ├─ POST /admin/pdfs/upload ──►│
      │  (Upload PDF)                │
      │                              │
      ├─ GET /admin/pdfs ◄──────────│
      │  (List all)                  │
      │                              │
      ├─ POST /viewer/session ◄─────┤
      │  (Create session)            │
      │                              │
      ├─ POST /viewer/page-view ◄───┤
      │  (Record page view)          │
      │                              │
      ├─ PUT /viewer/page-view ◄────┤
      │  (Update page view time)     │
      │                              │
      ├─ POST /viewer/event ◄───────┤
      │  (Track events)              │
      │                              │
      ├─ POST /viewer/session/end ◄─┤
      │  (End session)               │
      │                              │
      ├─ GET /admin/analytics/[token]
      │  (View analytics)
      │
      └─ DELETE /admin/pdfs/[id]
         (Delete PDF)
```

## Data Flow Example

```
1. Admin uploads "presentation.pdf"
   │
   ├─ File saved to: uploads/a1b2c3d4.pdf
   ├─ Record created in pdfs table:
   │  - id: abc-123
   │  - filename: presentation.pdf
   │  - tracking_token: a1b2c3d4
   │  - created_at: 2024-01-15 10:30:00
   │
   └─ URL generated: http://localhost:3000/viewer/a1b2c3d4

2. Admin copies and shares link

3. First user opens link
   │
   ├─ Session created:
   │  - id: session-001
   │  - pdf_id: abc-123
   │  - started_at: 2024-01-15 14:00:00
   │
   ├─ Page view: Page 1
   │  - entered_at: 14:00:05
   │  - exited_at: 14:00:25
   │  - active_time: 20s (from user activity tracking)
   │
   ├─ Page view: Page 2
   │  - entered_at: 14:00:26
   │  - exited_at: 14:01:32
   │  - active_time: 60s
   │
   └─ Session ended:
      - ended_at: 14:01:33
      - total_active_time: 80s

4. Admin views analytics
   │
   ├─ Total Opens: 1
   ├─ Unique Sessions: 1
   ├─ Average Engagement Time: 80s
   │
   └─ Page Stats:
      - Page 1: 1 view, 20s avg
      - Page 2: 1 view, 60s avg
```

## Technology Stack Interaction

```
User's Browser
    │
    ├─► Next.js Frontend (port 3000)
    │    ├─ React components
    │    ├─ Tailwind CSS styling
    │    └─ PDF.js viewer
    │
    └─► Browser JavaScript (Tracking)
         ├─ Detect activity (mouse, click, keys)
         ├─ Detect tab visibility
         └─ Calculate active time

         │
         └──► HTTP Requests
              │
              └─► FastAPI Backend (port 8000)
                   │
                   ├─ Handle requests
                   ├─ SQLAlchemy ORM
                   └─ Save to database
                       │
                       └─► SQLite Database
                            ├─ pdfs.db
                            ├─ sessions
                            ├─ page_views
                            └─ events
```

---

This architecture ensures:
- ✅ Scalability (easy to upgrade components)
- ✅ Modularity (each part can be modified independently)
- ✅ Performance (fast queries, efficient tracking)
- ✅ Privacy (all data stays local)
- ✅ User Experience (seamless tracking without UI)
