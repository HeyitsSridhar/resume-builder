import os
import re
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Resume Builder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict to your frontend domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class EnhanceRequest(BaseModel):
    field_label: str
    text: str


class ResumeData(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    summary: str = ""
    education: str = ""
    experience: str = ""
    skills: str = ""
    projects: str = ""


class ScanRequest(BaseModel):
    resume: ResumeData
    job_description: Optional[str] = ""


# ---------------------------------------------------------------------------
# AI Enhance proxy (keeps Gemini API key on the server)
# ---------------------------------------------------------------------------

def enhance_with_gemini(prompt: str) -> str:
    """Try to enhance text using Gemini API."""
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY not configured")
    
    model = genai.GenerativeModel('gemini-1.5-pro')
    response = model.generate_content(prompt)
    
    if not response.text:
        raise Exception("Gemini returned no content")
    
    return response.text.strip()

def enhance_with_openrouter(prompt: str) -> str:
    """Try to enhance text using OpenRouter API."""
    if not OPENROUTER_API_KEY:
        raise Exception("OPENROUTER_API_KEY not configured")
    
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "openai/gpt-3.5-turbo",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    
    response = requests.post(url, headers=headers, json=data, timeout=30)
    response.raise_for_status()
    
    result = response.json()
    if not result.get("choices") or not result["choices"][0].get("message", {}).get("content"):
        raise Exception("OpenRouter returned no content")
    
    return result["choices"][0]["message"]["content"].strip()

def enhance_with_fallback(prompt: str) -> tuple[str, str]:
    """Try Gemini first, fallback to OpenRouter if it fails."""
    # Try Gemini first
    try:
        result = enhance_with_gemini(prompt)
        return result, "gemini"
    except Exception as e:
        print(f"Gemini API failed: {str(e)}")
    
    # Fallback to OpenRouter
    try:
        result = enhance_with_openrouter(prompt)
        return result, "openrouter"
    except Exception as e:
        print(f"OpenRouter API failed: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Both AI services failed. Gemini error: {str(e)}. OpenRouter error: {str(e)}")

@app.post("/api/enhance")
def enhance(req: EnhanceRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text is empty")

    if not GEMINI_API_KEY and not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="Server missing both GEMINI_API_KEY and OPENROUTER_API_KEY")

    prompt = (
        f'Rewrite the following resume "{req.field_label}" section to be concise, '
        f"professional, ATS-friendly, and impact-driven. Use strong action verbs and "
        f"quantify where plausible. Return ONLY the rewritten text, no preamble, no markdown.\n\n"
        f"{req.text}"
    )

    try:
        result, provider = enhance_with_fallback(prompt)
        return {"result": result, "provider": provider}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")


# ---------------------------------------------------------------------------
# ATS Scan
# ---------------------------------------------------------------------------

STOPWORDS = {
    "the", "and", "for", "with", "that", "this", "from", "your", "you", "are",
    "will", "have", "has", "our", "their", "a", "an", "in", "on", "of", "to",
    "as", "is", "or", "be", "by", "we", "at", "it", "into", "able", "must",
    "any", "all", "etc", "such", "can", "role", "team", "work", "working",
}

ACTION_VERBS = {
    "led", "built", "created", "developed", "designed", "managed", "improved",
    "increased", "reduced", "implemented", "launched", "optimized", "achieved",
    "delivered", "drove", "spearheaded", "automated", "analyzed", "streamlined",
    "coordinated", "established", "executed", "generated", "negotiated",
}


def tokenize(text: str) -> list[str]:
    words = re.findall(r"[a-zA-Z][a-zA-Z+#./-]{1,}", text.lower())
    return [w.strip(".,/-") for w in words if w not in STOPWORDS and len(w) > 2]


def resume_full_text(r: ResumeData) -> str:
    return " ".join([
        r.summary, r.education, r.experience, r.skills, r.projects
    ])


@app.post("/api/scan")
def ats_scan(req: ScanRequest):
    r = req.resume
    full_text = resume_full_text(r)
    tokens = tokenize(full_text)
    token_set = set(tokens)

    findings = []
    score = 0
    max_score = 0

    # --- Formatting / completeness checks (general ATS-friendliness) ---

    def check(condition, points, ok_msg, fail_msg):
        nonlocal score, max_score
        max_score += points
        if condition:
            score += points
            findings.append({"type": "pass", "message": ok_msg})
        else:
            findings.append({"type": "fail", "message": fail_msg})

    check(bool(r.name.strip()), 5, "Name present.", "Add your full name.")
    check(bool(r.email.strip() and "@" in r.email), 5,
          "Valid email present.", "Add a valid email address.")
    check(bool(r.phone.strip()), 5, "Phone number present.", "Add a phone number.")
    check(bool(r.summary.strip()) and len(r.summary.split()) >= 15, 10,
          "Professional summary is present and substantial.",
          "Add a summary of at least ~15 words.")
    check(bool(r.education.strip()), 10, "Education section present.",
          "Add an education section.")
    check(bool(r.experience.strip()), 15, "Experience section present.",
          "Add an experience section.")
    check(bool(r.skills.strip()) and len(r.skills.split(",")) >= 3, 10,
          "Skills section lists multiple distinct skills.",
          "List at least 3 comma-separated skills.")
    check(bool(r.projects.strip()), 5, "Projects section present.",
          "Add a projects section (recommended for internships).")

    used_action_verbs = [v for v in ACTION_VERBS if v in token_set]
    check(len(used_action_verbs) >= 2, 10,
          f"Uses strong action verbs ({', '.join(used_action_verbs[:5])}).",
          "Use more action verbs (e.g. built, led, improved, optimized).")

    has_numbers = bool(re.search(r"\d", r.experience + r.projects))
    check(has_numbers, 5,
          "Experience/Projects include quantified results (numbers).",
          "Add numbers/metrics to show measurable impact (e.g. 'reduced load time by 30%').")

    word_count = len(full_text.split())
    check(80 <= word_count <= 1200, 5,
          f"Resume content length looks reasonable ({word_count} words).",
          f"Resume content length ({word_count} words) is too short or too long.")

    # --- Job description match (keyword overlap) ---
    jd_score = None
    jd_matched = []
    jd_missing = []
    if req.job_description and req.job_description.strip():
        jd_tokens = tokenize(req.job_description)
        jd_set = set(jd_tokens)
        if jd_set:
            matched = jd_set & token_set
            missing = jd_set - token_set
            jd_matched = sorted(matched)
            jd_missing = sorted(missing)[:20]
            jd_score = round(len(matched) / len(jd_set) * 100)

    overall = round(score / max_score * 100) if max_score else 0

    return {
        "overall_score": overall,
        "checks": findings,
        "jd_match_score": jd_score,
        "jd_matched_keywords": jd_matched,
        "jd_missing_keywords": jd_missing,
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}
