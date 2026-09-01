import React from "react";
import Link from "next/link";

export default function Docs() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 mb-4 block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 space-y-8">
          {/* Architecture */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Architecture</h2>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-gray-700">
              <p>
                <strong>Frontend:</strong> Next.js + React with Tailwind CSS
              </p>
              <p>
                <strong>Backend:</strong> FastAPI (Python) with SQLAlchemy ORM
              </p>
              <p>
                <strong>PDF Viewer:</strong> PDF.js for client-side rendering
              </p>
              <p>
                <strong>Database:</strong> SQLite (easily migratable to PostgreSQL)
              </p>
              <p>
                <strong>Tracking:</strong> Client-side event tracking with smart
                active-time calculation
              </p>
            </div>
          </section>

          {/* Setup Instructions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Setup Instructions</h2>

            <div className="space-y-6">
              {/* Backend Setup */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  1. Backend Setup (FastAPI)
                </h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto space-y-2">
                  <div>cd backend</div>
                  <div>python -m venv venv</div>
                  <div className="text-gray-500"># On Windows:</div>
                  <div>venv\Scripts\activate</div>
                  <div className="text-gray-500"># On macOS/Linux:</div>
                  <div># source venv/bin/activate</div>
                  <div></div>
                  <div>pip install -r requirements.txt</div>
                  <div>python main.py</div>
                </div>
                <p className="mt-3 text-gray-600">
                  Backend will run on <code className="bg-gray-100 px-2 py-1 rounded">
                    http://localhost:8000
                  </code>
                </p>
              </div>

              {/* Frontend Setup */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  2. Frontend Setup (Next.js)
                </h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto space-y-2">
                  <div className="text-gray-500"># Open a new terminal</div>
                  <div>cd frontend</div>
                  <div>npm install</div>
                  <div>npm run dev</div>
                </div>
                <p className="mt-3 text-gray-600">
                  Frontend will run on <code className="bg-gray-100 px-2 py-1 rounded">
                    http://localhost:3000
                  </code>
                </p>
              </div>
            </div>
          </section>

          {/* Usage Guide */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage Guide</h2>

            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Step 1: Upload a PDF
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Go to Admin Dashboard</li>
                  <li>Click "Upload PDF" and select a PDF file</li>
                  <li>The PDF is saved and a tracking link is generated</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Step 2: Share the Tracking Link
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Click "Copy Link" to copy the unique tracking URL</li>
                  <li>Share this link with your audience</li>
                  <li>Each recipient gets a unique session when they open it</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Step 3: View Analytics
                </h3>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Click "Analytics" next to a PDF</li>
                  <li>View engagement metrics and page-by-page statistics</li>
                  <li>Expand individual sessions to see detailed timelines</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Tracking Details */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tracking Details</h2>

            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What Gets Tracked</h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Session start time and end time</li>
                  <li>Each page viewed and active time on each page</li>
                  <li>Total active engagement time per session</li>
                  <li>PDF downloads</li>
                  <li>Browser/user-agent information</li>
                  <li>Client IP address</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Active Time Calculation
                </h3>
                <p className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                  Active time is intelligently calculated by tracking user activity
                  (mouse movement, clicks, keyboard input). When the tab becomes
                  hidden or inactive, time is paused. This prevents inflated metrics
                  from PDFs left open in background tabs.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Unique Session IDs
                </h3>
                <p>
                  Each PDF view generates a unique session token and user cannot be
                  identified from the token alone. All tracking is anonymous.
                </p>
              </div>
            </div>
          </section>

          {/* Database Schema */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Database Schema</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tables:</h3>
                <ul className="list-disc list-inside space-y-1 ml-2 text-gray-700">
                  <li><strong>pdfs</strong> - Uploaded PDF files with tracking tokens</li>
                  <li><strong>sessions</strong> - Individual PDF viewing sessions</li>
                  <li><strong>page_views</strong> - Record of each page viewed</li>
                  <li><strong>events</strong> - Additional events (downloads, etc.)</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  The SQLite database is stored in <code className="bg-gray-100 px-2 py-1 rounded">
                    backend/tracker.db
                  </code>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  For backup, simply copy this file. To upgrade to PostgreSQL, update
                  the DATABASE_URL in .env to:
                  <code className="bg-gray-100 px-2 py-1 rounded block mt-2">
                    postgresql://user:password@localhost/tracker
                  </code>
                </p>
              </div>
            </div>
          </section>

          {/* Future Enhancements */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Future Enhancements</h2>

            <p className="text-gray-700 mb-4">
              This MVP is built to be modular and extensible:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2 text-gray-700">
              <li>Multi-user authentication and PDF ownership</li>
              <li>Website heatmaps and click tracking</li>
              <li>CRM integration (Salesforce, HubSpot)</li>
              <li>Advanced AI analytics and recommendations</li>
              <li>PostgreSQL and cloud deployment (AWS, GCP, Heroku)</li>
              <li>Real-time analytics dashboard with WebSockets</li>
              <li>Email notifications and alerts</li>
              <li>PDF annotations and comments</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
