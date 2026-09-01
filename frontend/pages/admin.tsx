import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface PDF {
  id: string;
  filename: string;
  original_filename: string;
  tracking_token: string;
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminDashboard() {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    fetchPDFs();
  }, []);

  const fetchPDFs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/admin/pdfs`);
      setPdfs(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch PDFs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".pdf")) {
      setError("Please upload a PDF file");
      return;
    }

    try {
      setUploading(true);
      setError("");
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_BASE}/api/admin/pdfs/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setPdfs([response.data, ...pdfs]);
      setSuccessMessage("PDF uploaded successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Reset input
      if (e.target) e.target.value = "";
    } catch (err: any) {
      setError(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/viewer/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const deletePDF = async (id: string) => {
    if (!confirm("Are you sure you want to delete this PDF?")) return;

    try {
      await axios.delete(`${API_BASE}/api/admin/pdfs/${id}`);
      setPdfs(pdfs.filter((p) => p.id !== id));
      setSuccessMessage("PDF deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to delete PDF");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-indigo-600 hover:text-indigo-700 mb-4">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload PDF</h2>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer"
            />
            {uploading && <span className="text-gray-500">Uploading...</span>}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-green-700">
            {successMessage}
          </div>
        )}

        {/* PDFs List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Uploaded PDFs</h2>
            <p className="text-gray-600 text-sm mt-1">
              {pdfs.length} PDF{pdfs.length !== 1 ? "s" : ""}
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Loading PDFs...
            </div>
          ) : pdfs.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No PDFs uploaded yet. Upload one to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Filename
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Tracking Link
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pdfs.map((pdf) => (
                    <tr key={pdf.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {pdf.original_filename}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(pdf.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => copyToClipboard(pdf.tracking_token)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-medium"
                        >
                          {copiedToken === pdf.tracking_token
                            ? "Copied! ✓"
                            : "Copy Link"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        <Link
                          href={`/analytics/${pdf.tracking_token}`}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-medium"
                        >
                          Analytics
                        </Link>
                        <button
                          onClick={() => deletePDF(pdf.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
