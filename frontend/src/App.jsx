import { useState } from "react";
import { templates, previewStyles, templateStyles } from "./templates";
import AtsScanPanel from "./AtsScanPanel";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const emptyData = {
  name: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  education: "",
  experience: "",
  skills: "",
  projects: "",
};

function Field({ field, value, onChange, label, placeholder, textarea, aiEnhance, loading, onEnhance }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold tracking-wide uppercase text-stone-500">
          {label}
        </label>
        {aiEnhance && (
          <button
            onClick={() => onEnhance(field, label)}
            disabled={loading || !value.trim()}
            className="text-xs px-2.5 py-1 rounded-full border border-stone-300 text-stone-600 hover:border-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Enhancing…" : "✦ AI Enhance"}
          </button>
        )}
      </div>
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className="w-full border border-stone-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
        />
      ) : (
        <input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full border border-stone-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      )}
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [template, setTemplate] = useState("classic");

  const update = (field) => (e) =>
    setData((d) => ({ ...d, [field]: e.target.value }));

  async function enhanceWithAI(field, label) {
    if (!data[field].trim()) return;
    setLoading(true);
    setError("");
    try {
      const resp = await fetch(`${API_BASE}/api/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field_label: label, text: data[field] }),
      });
      if (!resp.ok) throw new Error("Enhance failed");
      const json = await resp.json();
      setData((d) => ({ ...d, [field]: json.result }));
    } catch (e) {
      setError("Could not reach AI service. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  function downloadResume() {
    const html = document.getElementById("resume-preview").innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>${data.name || "Resume"}</title>
          <style>${templateStyles[template]}</style>
        </head>
        <body>${html}</body>
      </html>
    `);
    win.document.close();
    win.print();
  }

  const ps = previewStyles[template];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight">Resume Builder</h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Fill in your details, polish with AI, choose a template, scan for ATS, then download.
        </p>
      </header>

      {error && (
        <div className="mx-6 mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 p-6 max-w-6xl mx-auto">
        {/* Left column: form + ATS scan */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-stone-200 p-5">
            <div className="mb-5">
              <label className="text-xs font-semibold tracking-wide uppercase text-stone-500 block mb-1.5">
                Template
              </label>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`text-left px-3 py-2 rounded-md border transition-colors ${
                      template === t.id
                        ? "bg-stone-900 text-white border-stone-900"
                        : "border-stone-200 text-stone-700 hover:border-stone-400"
                    }`}
                  >
                    <div className="text-sm font-medium">{t.name}</div>
                    <div
                      className={`text-xs ${
                        template === t.id ? "text-stone-300" : "text-stone-400"
                      }`}
                    >
                      {t.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field field="name" value={data.name} onChange={update("name")} label="Full Name" placeholder="Jane Doe" />
              <Field field="email" value={data.email} onChange={update("email")} label="Email" placeholder="jane@email.com" />
              <Field field="phone" value={data.phone} onChange={update("phone")} label="Phone" placeholder="+91 98765 43210" />
              <Field field="location" value={data.location} onChange={update("location")} label="Location" placeholder="Bengaluru, India" />
            </div>
            <Field
              field="summary"
              value={data.summary}
              onChange={update("summary")}
              label="Professional Summary"
              placeholder="Brief overview of your goals and strengths..."
              textarea
              aiEnhance
              loading={loading}
              onEnhance={enhanceWithAI}
            />
            <Field
              field="education"
              value={data.education}
              onChange={update("education")}
              label="Education"
              placeholder="B.Tech in CSE, XYZ University, 2022–2026"
              textarea
              aiEnhance
              loading={loading}
              onEnhance={enhanceWithAI}
            />
            <Field
              field="experience"
              value={data.experience}
              onChange={update("experience")}
              label="Experience"
              placeholder={"Role, Company, Duration\n- Responsibility / achievement"}
              textarea
              aiEnhance
              loading={loading}
              onEnhance={enhanceWithAI}
            />
            <Field
              field="skills"
              value={data.skills}
              onChange={update("skills")}
              label="Skills"
              placeholder="Python, React, Machine Learning, SQL..."
            />
            <Field
              field="projects"
              value={data.projects}
              onChange={update("projects")}
              label="Projects"
              placeholder="Project Name — short description and tech used"
              textarea
              aiEnhance
              loading={loading}
              onEnhance={enhanceWithAI}
            />

            <button
              onClick={downloadResume}
              className="w-full mt-2 bg-stone-900 text-white text-sm font-medium py-2.5 rounded-md hover:bg-stone-800 transition-colors"
            >
              Download as PDF
            </button>
          </div>

          <AtsScanPanel resumeData={data} />
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg border border-stone-200 p-8 h-fit sticky top-6">
          <div id="resume-preview" className={ps.font}>
            <h1 className={ps.h1}>{data.name || "Your Name"}</h1>
            <div className={`contact ${ps.contact}`}>
              {[data.email, data.phone, data.location].filter(Boolean).join("  •  ")}
            </div>

            {data.summary && (
              <>
                <h2 className={ps.h2}>Summary</h2>
                <div className={`section ${ps.body}`}>{data.summary}</div>
              </>
            )}
            {data.education && (
              <>
                <h2 className={ps.h2}>Education</h2>
                <div className={`section ${ps.body}`}>{data.education}</div>
              </>
            )}
            {data.experience && (
              <>
                <h2 className={ps.h2}>Experience</h2>
                <div className={`section ${ps.body}`}>{data.experience}</div>
              </>
            )}
            {data.skills && (
              <>
                <h2 className={ps.h2}>Skills</h2>
                <div className={`section ${ps.body}`}>{data.skills}</div>
              </>
            )}
            {data.projects && (
              <>
                <h2 className={ps.h2}>Projects</h2>
                <div className={`section ${ps.body}`}>{data.projects}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
