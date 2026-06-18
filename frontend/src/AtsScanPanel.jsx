import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function AtsScanPanel({ resumeData }) {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  async function runScan() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const resp = await fetch(`${API_BASE}/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: resumeData,
          job_description: jobDescription,
        }),
      });
      if (!resp.ok) throw new Error("Scan failed");
      const data = await resp.json();
      setResult(data);
    } catch (e) {
      setError("Could not run ATS scan. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const ringColor = (score) => {
    if (score >= 80) return "stroke-green-500";
    if (score >= 50) return "stroke-amber-500";
    return "stroke-red-500";
  };

  function ScoreRing({ score }) {
    const r = 36;
    const c = 2 * Math.PI * r;
    const offset = c - (score / 100) * c;
    return (
      <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="45"
          cy="45"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={ringColor(score)}
        />
        <text
          x="45"
          y="45"
          textAnchor="middle"
          dominantBaseline="middle"
          className="rotate-90"
          style={{ transform: "rotate(90deg)", transformOrigin: "45px 45px" }}
          fontSize="20"
          fontWeight="700"
          fill="#1f2937"
        >
          {score}
        </text>
      </svg>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-5">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <h2 className="text-sm font-semibold text-stone-900">ATS Scan</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Check formatting and match against a job description.
          </p>
        </div>
        <span className="text-stone-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-semibold tracking-wide uppercase text-stone-500 mb-1.5 block">
              Job Description (optional)
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to check keyword match..."
              rows={4}
              className="w-full border border-stone-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
            />
          </div>

          <button
            onClick={runScan}
            disabled={loading}
            className="w-full bg-stone-900 text-white text-sm font-medium py-2.5 rounded-md hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Scanning…" : "Run ATS Scan"}
          </button>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <ScoreRing score={result.overall_score} />
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    Overall ATS Score
                  </p>
                  <p className={`text-2xl font-bold ${scoreColor(result.overall_score)}`}>
                    {result.overall_score}/100
                  </p>
                </div>
              </div>

              {result.jd_match_score !== null && result.jd_match_score !== undefined && (
                <div className="border-t border-stone-100 pt-3">
                  <p className="text-sm font-semibold text-stone-900 mb-1">
                    Job Description Match
                  </p>
                  <p className={`text-xl font-bold ${scoreColor(result.jd_match_score)}`}>
                    {result.jd_match_score}%
                  </p>
                  {result.jd_missing_keywords?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-stone-500 uppercase mb-1">
                        Missing Keywords
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.jd_missing_keywords.map((kw) => (
                          <span
                            key={kw}
                            className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-stone-100 pt-3 space-y-1.5">
                <p className="text-sm font-semibold text-stone-900 mb-1">
                  Formatting Checklist
                </p>
                {result.checks.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className={c.type === "pass" ? "text-green-600" : "text-red-500"}>
                      {c.type === "pass" ? "✓" : "✗"}
                    </span>
                    <span className="text-stone-700">{c.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
