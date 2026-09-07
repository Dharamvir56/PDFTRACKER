import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const PDFViewer = () => {
  const router = useRouter();
  const { token } = router.query;

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  // Refs for all tracking state — using refs instead of state to avoid stale closures
  // ─── Tracking state ───
  const sessionIdRef = useRef<string>("");

  type PageVisit = {
    pageNumber: number;
    pageViewId: string;
    accumulatedTime: number;
    activeStart: number | null;
  };

  const currentVisitRef = useRef<PageVisit | null>(null);

  const sessionTotalTimeRef = useRef<number>(0);

  const isTabActiveRef = useRef<boolean>(true);

  // ─── Helper: flush accumulated time for the current page view to backend ───
  const flushPageView = async (
    pageViewId: string,
    accumulatedSeconds: number
  ) => {
    if (!pageViewId || accumulatedSeconds <= 0) return;

    try {
      await axios.put(
        `${API_BASE}/api/viewer/page-view/${pageViewId}?active_time=${accumulatedSeconds}`
      );
    } catch (e) {
      console.error("Failed to update page view", e);
    }
  };

  // ─── Helper: end the session reliably using sendBeacon ───
  // sendBeacon is fire-and-forget and guaranteed to fire even on page close
  const endSessionBeacon = (sessionId: string, totalTime: number) => {
    const url = `${API_BASE}/api/viewer/session/${sessionId}/end?total_active_time=${totalTime}&downloaded=false`;
    navigator.sendBeacon(url);
  };

  // ─── Pause timing (tab hidden or page switch) ───
  const pauseTiming = () => {
    const visit = currentVisitRef.current;

    if (!visit) return;

    if (visit.activeStart !== null) {
      const elapsed = (Date.now() - visit.activeStart) / 1000;

      visit.accumulatedTime += elapsed;
      sessionTotalTimeRef.current += elapsed;

      visit.activeStart = null;
    }
  };

  // ─── Resume timing (tab becomes visible again) ───
  const resumeTiming = () => {
    const visit = currentVisitRef.current;

    if (!visit) return;

    if (visit.activeStart === null && !document.hidden) {
      visit.activeStart = Date.now();
    }
  };

  const savePageVisit = async (visit: PageVisit) => {
    if (!visit.pageViewId || visit.accumulatedTime <= 0) return;

    const timeToSave = visit.accumulatedTime;

    // Reset local amount so the same time is not saved twice
    visit.accumulatedTime = 0;

    try {
      await flushPageView(visit.pageViewId, timeToSave);
    } catch (error) {
      console.error(
        `Failed to save page ${visit.pageNumber} time:`,
        error
      );
    }
  };


  // ─── Initialize session + load PDF ───
  useEffect(() => {
    if (!token) return;

    const initializeSession = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          `${API_BASE}/api/viewer/session?tracking_token=${token}`,
          {}
        );
        sessionIdRef.current = response.data.session_id;

        // Load PDF bytes
        const pdfResponse = await axios.get(`${API_BASE}/api/viewer/pdf/${token}`, {
          responseType: "arraybuffer",
        });
        const pdf = await pdfjsLib.getDocument({ data: pdfResponse.data }).promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (err) {
        setError("Failed to load PDF or initialize session");
        console.error(err);
        setLoading(false);
      }
    };

    initializeSession();
  }, [token]);

  // ─── Tab visibility tracking ───
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isTabActiveRef.current = false;
        pauseTiming();
      } else {
        isTabActiveRef.current = true;
        resumeTiming();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // ─── Session end on tab/window close ───
  // ─── Session end on tab/window close ───
  useEffect(() => {
    const handleBeforeUnload = () => {
      pauseTiming();

      const visit = currentVisitRef.current;

      // Save current page using sendBeacon if its backend ID exists
      if (visit?.pageViewId && visit.accumulatedTime > 0) {
        const url =
          `${API_BASE}/api/viewer/page-view/${visit.pageViewId}/beacon` +
          `?active_time=${visit.accumulatedTime}`;
        navigator.sendBeacon(url);
      }

      // End session
      if (sessionIdRef.current) {
        const url =
          `${API_BASE}/api/viewer/session/${sessionIdRef.current}/end` +
          `?total_active_time=${sessionTotalTimeRef.current}` +
          `&downloaded=false`;

        navigator.sendBeacon(url);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  // ─── Track page view when page changes ───
  useEffect(() => {
    if (!sessionIdRef.current || !pdfDoc) return;

    const pageNumber = currentPage;

    // 1. Stop the previous page immediately
    pauseTiming();

    // 2. Save the previous page locally
    const previousVisit = currentVisitRef.current;

    if (previousVisit) {
      // If backend ID already exists, save immediately.
      // If it does NOT exist yet, the backend response
      // will save the accumulated time later.
      if (previousVisit.pageViewId) {
        savePageVisit(previousVisit);
      }
    }

    // 3. Create a completely independent visit object
    const newVisit: PageVisit = {
      pageNumber,
      pageViewId: "",
      accumulatedTime: 0,
      activeStart: !document.hidden ? Date.now() : null,
    };

    // 4. Make this the current page immediately
    currentVisitRef.current = newVisit;

    isTabActiveRef.current = !document.hidden;

    // 5. Ask backend to create the page-view record
    // WITHOUT waiting for it before starting the timer.
    axios
      .post(
        `${API_BASE}/api/viewer/page-view?session_id=${sessionIdRef.current}`,
        {
          page_number: pageNumber,
        }
      )
      .then((response) => {
        const pageViewId = response.data.page_view_id;

        // Attach the backend ID to THIS specific visit.
        newVisit.pageViewId = pageViewId;

        // IMPORTANT:
        // The user may already have moved to another page.
        // That is okay.
        //
        // If the user already spent time on this page,
        // save that time now.
        if (newVisit.accumulatedTime > 0) {
          savePageVisit(newVisit);
        }
      })
      .catch((err) => {
        console.error(
          `Failed to create page view for page ${pageNumber}:`,
          err
        );
      });
  }, [currentPage, pdfDoc]);

  // ─── Render PDF page ───
  // ─── Render PDF page ───
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let cancelled = false;

    const renderPage = async () => {
      try {
        // Cancel previous PDF.js render
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (e) {
            // Ignore cancellation errors
          }

          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(currentPage);

        if (cancelled) return;

        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;

        if (!canvas) return;

        const context = canvas.getContext("2d");

        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderTask = page.render({
          canvasContext: context,
          viewport,
        });

        renderTaskRef.current = renderTask;

        try {
          await renderTask.promise;
        } catch (error: any) {
          // PDF.js throws this when we intentionally cancel
          // a previous render operation.
          if (error?.name !== "RenderingCancelledException") {
            console.error("PDF render error:", error);
          }
        }

        if (renderTaskRef.current === renderTask) {
          renderTaskRef.current = null;
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to render PDF page:", error);
        }
      }
    };

    renderPage();

    return () => {
      cancelled = true;

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // Ignore cancellation errors
        }

        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, currentPage, scale]);

  // ─── Handlers ───
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < numPages) setCurrentPage(currentPage + 1);
  };

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.15, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.5));

  const handleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!isFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/viewer/pdf/${token}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `document.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      if (sessionIdRef.current) {
        await axios.post(
          `${API_BASE}/api/viewer/event?session_id=${sessionIdRef.current}`,
          { event_type: "download", event_data: JSON.stringify({ page: currentPage }) }
        );
      }
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  // ─── Render ───
  if (!token) return <div className="text-center py-8 text-white">Loading...</div>;
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <div className="text-4xl mb-4">📄</div>
        <p className="text-lg">Loading PDF...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-red-900 border border-red-700 rounded-lg p-6 m-4 text-red-200 max-w-md text-center">
        <div className="text-3xl mb-2">⚠️</div>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-900" ref={containerRef}>
      {/* Toolbar */}
      <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between gap-4 flex-wrap shadow-lg border-b border-gray-700">
        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            ← Prev
          </button>

          <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg text-sm">
            <span className="text-gray-400">Page</span>
            <input
              type="number"
              value={currentPage}
              min={1}
              max={numPages}
              onChange={(e) => {
                const page = Math.max(1, Math.min(numPages, parseInt(e.target.value) || 1));
                setCurrentPage(page);
              }}
              className="w-10 bg-gray-600 text-white text-center rounded px-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-gray-400">/ {numPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === numPages}
            className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Next →
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <button onClick={handleZoomOut} className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded hover:bg-gray-600 transition-colors font-bold">−</button>
          <span className="w-14 text-center text-sm text-gray-300">{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn} className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded hover:bg-gray-600 transition-colors font-bold">+</button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFullscreen}
            className="px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            {isFullscreen ? "⊡ Exit" : "⛶ Fullscreen"}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            ↓ Download
          </button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-6 bg-gray-900">
        <canvas ref={canvasRef} className="shadow-2xl rounded" />
      </div>
    </div>
  );
};

export default PDFViewer;
