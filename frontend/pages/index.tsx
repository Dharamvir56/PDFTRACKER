import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            PDF Tracker
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Upload PDFs, track engagement, and analyze user behavior with real-time analytics.
            No paid services. Everything hosted locally.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/admin"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Admin Dashboard
            </Link>
            <Link
              href="/docs"
              className="px-8 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Documentation
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-indigo-600 mr-3">✓</span>
                <span>Upload PDFs and generate unique tracking links</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-3">✓</span>
                <span>Built-in PDF viewer with PDF.js</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-3">✓</span>
                <span>Track engagement time on each page</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-3">✓</span>
                <span>Smart active time tracking (ignores inactive periods)</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-3">✓</span>
                <span>Comprehensive analytics dashboard</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-600 mr-3">✓</span>
                <span>SQLite database (easy to backup and deploy)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
