# AI Resume Builder (Full-Stack, No Auth)

A full-stack resume builder for ATS-friendly resumes, with AI-assisted content
enhancement and an ATS scan/scoring feature.

## Project Structure

```
resume-builder/
├── backend/          FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/         React + Vite + Tailwind frontend
    ├── src/
    │   ├── App.jsx
    │   ├── AtsScanPanel.jsx
    │   ├── templates.js
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── .env.example
```

## Features

- **No login required** — fully open, single-session use.
- **4 ATS-friendly resume templates**: Classic, Modern, Minimal, Compact —
  all single-column, semantic markup (no tables/images) so ATS parsers can
  read them correctly.
- **Live preview** that updates as you type.
- **AI Enhance**: rewrites summary/education/experience/projects sections into
  concise, action-verb-driven, ATS-friendly text using Claude via a backend
  proxy (keeps your API key off the client).
- **ATS Scan**:
  - General ATS-friendliness checklist (required sections, contact info,
    action verbs, quantified results, length).
  - Optional job-description match: paste a JD and get a keyword overlap
    score + list of missing keywords to add.
- **Download as PDF** via the browser print dialog, styled per template.

## Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env and set ANTHROPIC_API_KEY=sk-ant-...

uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`.
Health check: `GET /api/health`

## Frontend Setup

```bash
cd frontend
npm install

cp .env.example .env
# VITE_API_BASE=http://localhost:8000  (default, change for production)

npm run dev
```

Frontend runs at `http://localhost:5173`.

## API Endpoints

### `POST /api/enhance`
Rewrites a resume section using AI.

```json
{ "field_label": "Experience", "text": "worked on backend stuff at company" }
```
→ `{ "result": "Developed and maintained backend services..." }`

### `POST /api/scan`
Runs the ATS scan.

```json
{
  "resume": { "name": "...", "summary": "...", "experience": "...", "skills": "...", ... },
  "job_description": "optional pasted JD text"
}
```
→
```json
{
  "overall_score": 75,
  "checks": [{ "type": "pass", "message": "Name present." }, ...],
  "jd_match_score": 62,
  "jd_matched_keywords": ["python", "react", ...],
  "jd_missing_keywords": ["docker", "kubernetes", ...]
}
```

## Deployment Notes

- **Backend**: Deploy to Render / Railway / Fly.io. Set `ANTHROPIC_API_KEY`
  as an environment variable in the platform's dashboard — never commit it.
- **Frontend**: Deploy to Vercel / Netlify. Set `VITE_API_BASE` to your
  deployed backend URL.
- Restrict CORS `allow_origins` in `backend/main.py` to your frontend's
  domain before going live.

## Resume / Report Notes

- **ML/NLP component**: the AI Enhance feature uses an LLM (Claude) to
  rewrite resume text for clarity, impact, and ATS-friendliness.
- **Information retrieval component**: the ATS scan's job-description match
  uses keyword extraction and set-overlap scoring (a simplified TF/IDF-style
  relevance measure) to compute a match percentage between resume content
  and a job description.
- **Full-stack**: React/Vite/Tailwind frontend, FastAPI backend, REST API,
  no authentication — emphasizes clean architecture and API design.
