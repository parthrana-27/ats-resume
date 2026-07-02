# ATS Resume Intelligence Platform
### AI-Powered Resume Screening & Candidate Intelligence Platform

ATS Resume Intelligence is a production-ready Applicant Tracking System (ATS) enhanced with Retrieval-Augmented Generation (RAG) and LLM-based multi-agent screening pipelines. Instead of basic keyword scanning, it parses resume text, computes semantic similarities, checks educational hierarchies, detects skill gaps, recommends learning paths, and supports real-time candidate mock interviews.

---

## 🏗️ High-Level System Architecture

The platform runs as a modular system connecting a Next.js App Router UI with a FastAPI API gateway:

```
                    Recruiter / Candidate
                             │
                     Next.js Frontend
                             │
                        API Gateway
                             │
     ┌───────────────┬───────────────┬───────────────┐
     │               │               │
 Resume Service   Job Service   Candidate Service
     │               │               │
 SQLite DB       SQLite DB       SQLite DB
     │               │
     └───────────────┴───────────────┐
                                     │
                             AI Matching Engine
                                     │
             ┌───────────────────────┼──────────────────────┐
             │                       │                      │
        Resume Parser          Hybrid Retrieval       Ranking Engine
             │                       │                      │
       Embeddings             Vector Database        AI Evaluation
             │                       │                      │
             └───────────────LLM + LangGraph───────────────┘
                                     │
                            Recommendations
```

---

## ⚡ Key Features

*   **Resume Upload & Parsing**: Supports PDF, DOCX, and TXT files. Extracts skills, years of experience, education, projects, and credentials.
*   **Job Description Management**: Formulate job opening parameters and automatically detect experience levels and required skills.
*   **Candidate Ranking Engine**: Implements the official ranking formula to match applicants.
*   **Vector Similarity Emulation**: Stores document embeddings inside SQLite and runs Python-based cosine similarity matching. (Falls back to multi-hot skill vocabulary vector computations in local offline mode).
*   **AI Skill Gap Analysis**: Lists missing skills with priorities and outlines upgrade roadmap courses.
*   **Resume Upgrade Suggestions**: Compiles quantified before-and-after bullet point rewrite recommendations.
*   **AI Mock Interview Simulator**: Generates custom behavioral, technical, coding, and project questions. Lets recruiters click on questions to inspect simulated candidate answers with AI diagnostic reviews.
*   **Candidate Comparison Matrix**: Displays matching statistics side-by-side.
*   **Recruiter Copilot**: Text prompt box providing RAG-powered comparisons and ranking explanations.

---

## 📈 Candidate Ranking Formula

The ranking score of a candidate is computed based on the following weighted model:

$$\text{Overall Score} = (0.40 \times \text{Semantic}) + (0.20 \times \text{Skills}) + (0.15 \times \text{Experience}) + (0.10 \times \text{Education}) + (0.10 \times \text{Projects}) + (0.05 \times \text{Certifications})$$

1.  **Semantic Match (40%)**: Cosine similarity between candidate and job embedding vectors.
2.  **Skills Match (20%)**: Ratios of required skills matched, with a 10% bonus for preferred qualifications.
3.  **Experience Match (15%)**: Assesses years of experience relative to the job requirements.
4.  **Education Match (10%)**: Degree level alignment checks (Bachelor's, Master's, Ph.D.).
5.  **Projects Score (10%)**: Points awarded based on quantity and relevance of projects.
6.  **Certifications Score (5%)**: Check for professional credentials.

---

## 📂 Project Directory Structure

```
ats-resume/
├── backend/                  # FastAPI Web Server Router
│   └── main.py
├── frontend/                 # Next.js App Router Client App
│   ├── src/app/
│   │   ├── page.tsx          # Single-Page Dashboard & Simulator Portal
│   │   ├── layout.tsx
│   │   └── globals.css       # Glassmorphism dark-theme styling
│   └── package.json
├── services/                 # Business Logic Core Services
│   ├── resume_service.py     # PDF, DOCX, TXT text extraction
│   ├── job_service.py        # JD metadata parsing
│   ├── matching_service.py   # Overall scores and fallback calculations
│   └── analytics_service.py  # Dashboard statistics compile
├── ai/                       # AI Agent & Database Config
│   ├── database.py           # SQLite connection and Cosine similarity math
│   └── agents/
│       └── graph.py          # Stateful LangGraph matching pipeline
├── shared/                   # Shared Schemas and Configs
│   ├── config.py             # Environment configurations
│   └── schemas.py            # Pydantic schemas
├── tests/                    # Unit and Integration test suite
│   ├── test_matching.py
│   └── test_e2e_api.py
├── requirements.txt          # Python dependencies
└── README.md
```

---

## 🚀 Installation & Getting Started

### Prerequisites
*   Python 3.10+
*   Node.js 18+ & npm

### 1. Setup Backend Server

Clone the project and set up a virtual environment:

```bash
# Create virtualenv
python -m venv venv

# Activate virtualenv (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt
```

*(Optional)* Configure API Keys in a `.env` file at the root:
```env
GEMINI_API_KEY=your_gemini_api_key
```
*Note: If no API keys are provided, the platform automatically enters **Local/Offline Mode**, running robust rules, regex parsers, and custom local vector embeddings.*

Start the FastAPI application:
```bash
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
You can view the Swagger API documentation at: `http://127.0.0.1:8000/docs`

### 2. Setup Next.js Frontend

Navigate to the frontend directory and start the client:

```bash
cd frontend

# Install Node modules
npm install

# Start development server (Turbopack enabled)
npm run dev
```
Open your browser and visit: `http://localhost:3000`

---

## 🧪 Testing

### Backend Unit Tests
To run Pytest tests verifying cosine similarity, skill ratings, education mappings, and the ranking formulas:
```bash
python -m pytest tests/test_matching.py
```

### End-to-End API Integration
To execute the complete E2E api workflow (simulating uploads, matching algorithms, stands, comparisons, and logs):
```bash
python tests/test_e2e_api.py
```
