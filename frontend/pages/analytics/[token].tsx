import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";

interface PageStats {
  views: number;
  total_active_time: number;
  average_time: number;
}

interface PageViewData {
  page_number: number;
  active_time: number;
  entered_at: string;
  exited_at: string | null;
}

interface SessionData {
  id: string;
  started_at: string;
  ended_at: string | null;
  total_active_time: number;
  downloaded: boolean;
  page_views: PageViewData[];
}

interface Analytics {
  total_opens: number;
  unique_sessions: number;
  average_engagement_time: number;
  total_downloads: number;
  pages_data: Record<string, PageStats>;
  most_viewed_page: number | null;
  most_engaged_page: number | null;
  sessions: SessionData[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Analytics() {
  const router = useRouter();
  const { token } = router.query;

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE}/api/admin/analytics/${token}`
        );
        setAnalytics(response.data);
        setError("");
      } catch (err) {
        setError("Failed to fetch analytics");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  const formatTime = (seconds: number) => {
    if (seconds === 0) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  if (!token) return <div className="text-center py-8">Loading...</div>;

  if (loading)
    return <div className="text-center py-8">Loading analytics...</div>;

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4 m-4 text-red-700">
        {error}
      </div>
    );

  if (!analytics)
    return <div className="text-center py-8">No analytics data available</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link href="/admin" className="text-indigo-600 hover:text-indigo-700">
              ← Back to Admin
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Total Opens</div>
            <div className="text-4xl font-bold text-indigo-600 mt-2">
              {analytics.total_opens}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Unique Sessions</div>
            <div className="text-4xl font-bold text-indigo-600 mt-2">
              {analytics.unique_sessions}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">
              Avg. Engagement Time
            </div>
            <div className="text-2xl font-bold text-indigo-600 mt-2">
              {formatTime(analytics.average_engagement_time)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Total Downloads</div>
            <div className="text-4xl font-bold text-indigo-600 mt-2">
              {analytics.total_downloads}
            </div>
          </div>
        </div>

        {/* Most Viewed/Engaged Pages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Most Viewed Page</h3>
            {analytics.most_viewed_page ? (
              <div>
                <div className="text-3xl font-bold text-indigo-600">
                  Page {analytics.most_viewed_page}
                </div>
                <div className="text-gray-600 mt-2">
                  Views:{" "}
                  <span className="font-semibold">
                    {analytics.pages_data[analytics.most_viewed_page]?.views || 0}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No data</div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Most Engaged Page
            </h3>
            {analytics.most_engaged_page ? (
              <div>
                <div className="text-3xl font-bold text-indigo-600">
                  Page {analytics.most_engaged_page}
                </div>
                <div className="text-gray-600 mt-2">
                  Avg Time:{" "}
                  <span className="font-semibold">
                    {formatTime(
                      analytics.pages_data[analytics.most_engaged_page]?.average_time || 0
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No data</div>
            )}
          </div>
        </div>

        {/* Page Statistics Table */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Page-by-Page Statistics
            </h2>
          </div>

          {Object.keys(analytics.pages_data).length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No page view data yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Page
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Total Time
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Avg Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(analytics.pages_data)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([pageNum, stats]) => (
                      <tr key={pageNum} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          Page {pageNum}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {stats.views}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatTime(stats.total_active_time)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatTime(stats.average_time)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Individual Sessions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Individual Sessions ({analytics.sessions.length})
            </h2>
          </div>

          {analytics.sessions.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No sessions yet
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {analytics.sessions.map((session) => (
                <div key={session.id} className="px-6 py-4">
                  <button
                    onClick={() =>
                      setExpandedSession(
                        expandedSession === session.id ? null : session.id
                      )
                    }
                    className="w-full text-left hover:bg-gray-50 p-2 rounded"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900">
                          Started:{" "}
                          {new Date(session.started_at).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Duration: {formatTime(session.total_active_time)}
                          {session.downloaded && " • Downloaded"}
                        </div>
                      </div>
                      <div className="text-indigo-600">
                        {expandedSession === session.id ? "−" : "+"}
                      </div>
                    </div>
                  </button>

                  {expandedSession === session.id && (
                    <div className="mt-4 pl-4 border-l-2 border-indigo-200">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Page Timeline
                      </h4>
                      <div className="space-y-2">
                        {session.page_views.map((pv, idx) => (
                          <div key={idx} className="text-sm text-gray-600">
                            <span className="font-medium">Page {pv.page_number}:</span>{" "}
                            {formatTime(pv.active_time)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
