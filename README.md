# IntraViewer: Real Time Mock Interview System

**`> A full-stack platform that simulates realistic mock interviews, generates personalised AI questions from your CV and job description, transcribes your answers in real time, and analyses your emotions — all without sending your data to external APIs.`**

---

![intraviewer-3](public/intraviewer-3.gif)
<img src="public/Picture2.png" style="width:400px; height:300px; object-fit:contain;">
<img src="public/interface.png" style="width:400px; height:300px; object-fit:contain;">


---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Key Features](#key-features)
7. [Custom Hooks & Stores](#custom-hooks--stores)
8. [API Reference](#api-reference)
9. [Environment Variables](#environment-variables)
10. [Deployment](#deployment)
11. [Security](#security)
12. [Browser Support](#browser-support)
13. [Troubleshooting](#troubleshooting)
14. [Future Work](#future-work)

---

## Overview

IntraViewer helps job seekers practise interview skills through a personalized, AI-driven workflow:

1. **Sign up / Log in** — JWT-based authentication with access and refresh tokens.
2. **Upload CV + Job Description** — optional CV upload (PDF, DOCX, JPG, PNG) plus a free-text job description.
3. **AI Question Generation** — a locally hosted LLM (Phi-3 Mini via `llama_cpp`) produces 10 tailored interview questions (4 Technical, 3 Behavioural, 3 Situational) with model answers.
4. **Live Interview Session** — WebRTC-style camera/mic capture. Audio is streamed every 10 seconds to a Faster-Whisper ASR model for real-time transcription; video frames are sent every 2 seconds to a fine-tuned SmolVLM2 model for emotion detection.
5. **Results & Feedback** — transcripts, emotion analysis, and scores are displayed at the end of the session.

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│  PRESENTATION TIER — Next.js (Port 3000)            │
│  React components  |  Zustand state  |  Middleware  │
└────────────────────────┬────────────────────────────┘
                         │  HTTP/REST + WebSocket
┌────────────────────────▼────────────────────────────┐
│  APPLICATION TIER — FastAPI (Port 8000)             │
│  Routers  |  Services  |  AI Services  |  Security  │
└────────────────────────┬────────────────────────────┘
                         │  SQLAlchemy ORM
┌────────────────────────▼────────────────────────────┐
│  DATA TIER — PostgreSQL 15 (Port 5432)              │
│  users | session | questions | transcripts | ...    │
└─────────────────────────────────────────────────────┘
```

- **REST over HTTPS** — all CRUD operations (auth, questions, sessions, results).
- **WebSocket (WSS)** — live interview session, streaming base64-encoded audio and video chunks from the browser to the backend.

---

## Tech Stack

### Frontend (this repository)

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | SSR-capable React framework |
| Language | TypeScript | 5.x | Type-safe development |
| State management | Zustand (with `persist`) | 5.x | Global client state |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Animations | GSAP | 3.x | Page & element animations |
| Icons | Lucide React | Latest | SVG icon library |
| UI primitives | Radix UI Slot | 1.x | Accessible headless components |
| PDF export | jsPDF + html2canvas-pro | Latest | Interview report download |
| HTTP client | Fetch API (custom service layer) | — | REST communication |
| Real-time | Browser WebSocket API | — | Live session streaming |
| Media | MediaDevices API | — | Camera/microphone access |
| Route protection | Next.js Middleware | — | Server-side auth gating |

### Backend (separate repository)

| Layer | Technology | Purpose |
|---|---|---|
| Web framework | FastAPI 0.104 (Python) | REST API + WebSocket server |
| ORM | SQLAlchemy 2.0 | Database abstraction |
| Database | PostgreSQL 15 | Persistent relational storage |
| Container orchestration | Docker Compose | Service management |
| Authentication | Python-Jose (JWT) + Argon2 | Secure token auth & password hashing |
| Speech-to-Text | Faster-Whisper (base, int8) | Real-time audio transcription |
| LLM | Phi-3 Mini 4k Instruct GGUF Q4_K_M via llama_cpp | Local question generation |
| Emotion Detection | SmolVLM2-500M fine-tune (HuggingFace) | Vision-language emotion model |
| CV parsing | PyMuPDF, pdfplumber, pytesseract | Text extraction from PDF/images |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or yarn)
- Modern browser with WebRTC support (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Backend server running on port 8000 (see the backend repository)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (copy example and fill in values)
cp .env.example .env.local

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Compile for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
intraviewer-frontend/
├── app/                              # Next.js App Router pages
│   ├── page.tsx                      # Landing page
│   ├── layout.tsx                    # Root layout (Navbar, global CSS)
│   ├── globals.css                   # Global styles
│   ├── auth/
│   │   ├── login/page.tsx            # Login page
│   │   └── signup/page.tsx           # Registration page
│   ├── dashboard/page.tsx            # User dashboard
│   ├── interview/
│   │   ├── prepare/page.tsx          # CV + Job Description intake (3-step wizard)
│   │   ├── session/page.tsx          # Live interview session (WebSocket + media)
│   │   └── results/[id]/page.tsx     # Results & analysis
│   ├── profile/page.tsx              # User profile & password change
│   └── api/                          # Next.js API proxy routes
├── components/
│   ├── Navbar.tsx                    # Top navigation bar
│   ├── Drawer.tsx                    # Side drawer / menu
│   ├── AuthLayout.tsx                # Shared auth page wrapper
│   ├── PreviousSessionsModal.tsx     # Modal listing past interview sessions
│   ├── ChangePasswordModal.tsx       # Password change modal
│   ├── guards/
│   │   └── AuthGuard.tsx             # Client-side route protection wrapper
│   ├── features/
│   │   ├── DashboardStats.tsx        # Dashboard statistics cards
│   │   ├── DashboardQuickActions.tsx # Quick-action buttons on dashboard
│   │   └── InterviewCard.tsx         # Session card component
│   └── ui/
│       └── button.tsx                # Reusable Button (Radix + CVA variants)
├── lib/
│   ├── stores/
│   │   ├── authStore.ts              # Zustand auth state (persisted)
│   │   └── interviewStore.ts         # Zustand interview lifecycle state
│   ├── services/
│   │   ├── auth.service.ts           # API calls for authentication
│   │   └── interview.service.ts      # API calls for interview workflows
│   ├── hooks/
│   │   ├── useAuth.ts                # Auth state & operations hook
│   │   ├── useMediaStream.ts         # WebSocket + MediaRecorder hook
│   │   └── index.ts                  # Hook barrel export
│   ├── types/                        # Shared TypeScript interfaces
│   ├── constants/                    # App-wide constants (API URLs, etc.)
│   ├── config/                       # Config helpers
│   └── utils/                        # Utility functions
├── middleware.ts                     # Next.js server-side route protection
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Key Features

### Authentication

- **Signup** — full name, email, password with real-time strength indicator and confirmation match.
- **Login** — email + password with form validation and helpful error messages.
- **JWT tokens** — access token (30 min) + refresh token, stored in Zustand (`authStore`) and mirrored to a base64-encoded `auth-storage` cookie so the Next.js middleware can gate routes server-side without a session store.
- **Route protection** — `middleware.ts` redirects unauthenticated users to `/auth/login`; `AuthGuard` provides client-side protection.

### Interview Preparation (3-step Wizard)

| Step | Description |
|---|---|
| 1 — Upload CV | Drag-and-drop file upload (PDF, DOCX, JPG, PNG, max 10 MB). Optional. |
| 2 — Describe Job | Free-text job description input with character counter. |
| 3 — Review Questions | AI-generated questions with category and difficulty badges; option to regenerate. |

### Live Interview Session

- Camera + microphone access via `getUserMedia()`.
- Video preview with recording indicator, mute/unmute, and camera toggle controls.
- 90-second countdown per question with auto-advance.
- Audio captured by `MediaRecorder` every **10 seconds**, base64-encoded, and sent over WebSocket for Whisper transcription.
- Video frames captured from a `<canvas>` every **2 seconds**, base64-encoded, and sent over WebSocket for SmolVLM2 emotion analysis.
- Real-time transcription feedback displayed in the UI.

### Results & Analysis

- Overall session score (0–100).
- Transcript displayed question-by-question.
- Emotion analysis breakdown (happy, confident, nervous, confused, neutral).
- Speech metrics: words per minute, clarity, filler words.
- Question-by-question feedback with strengths and improvement areas.
- PDF report download via jsPDF.

---

## Custom Hooks & Stores

### `authStore` (`lib/stores/authStore.ts`)

Persisted Zustand store managing authentication state.

```typescript
const { accessToken, refreshToken, user, isAuthenticated, login, signup, logout, refreshAccessToken } = useAuthStore();
```

### `interviewStore` (`lib/stores/interviewStore.ts`)

Zustand store for the full interview lifecycle. CV binary objects are NOT persisted; `cv_id`, `prompt_id`, and `backendSessionId` are persisted to `localStorage`.

```typescript
const {
  uploadCV, setJobDescription, generateQuestions,
  createSession, addResponse, completeInterview,
  fetchPreviousSessions, clearCurrentSession, resetInterview
} = useInterviewStore();
```

### `useAuth` (`lib/hooks/useAuth.ts`)

Convenience hook exposing auth operations.

```typescript
const { login, signup, logout, user, isLoading } = useAuth();
```

### `useMediaStream` (`lib/hooks/useMediaStream.ts`)

Handles WebSocket connection for the live session, `MediaRecorder` audio capture, and canvas-based video frame capture.

```typescript
const { status, startRecording, stopRecording } = useMediaStream(sessionId);
```

| Method | Description |
|---|---|
| `startRecording(videoEl, canvasEl)` | Opens getUserMedia, connects WebSocket, starts capture loops |
| `stopRecording()` | Sends `session_complete`, closes WebSocket, stops tracks |

---

## API Reference

All non-public endpoints require `Authorization: Bearer <access_token>`.

| Router | Endpoint | Method | Auth | Description |
|---|---|---|---|---|
| **Auth** | `/auth/signup` | POST | No | Register new user |
| | `/auth/login` | POST | No | Login — returns access + refresh tokens |
| | `/auth/refresh` | POST | refresh token header | Issue new access token |
| **User Input** | `/userinput/data` | POST | Yes | Upload CV + Job Description → returns `cv_id`, `prompt_id` |
| **Sessions** | `/sessions/start` | POST | Yes | Create new interview session → returns `session_id` |
| | `/sessions/end/{id}` | POST | Yes | Mark session completed |
| | `/sessions/terminate/{id}` | POST | Yes | Terminate session early |
| | `/sessions/delete/{id}` | DELETE | Admin | Hard delete session |
| | `/sessions/ws/sessions/{id}` | WS | — | Live streaming WebSocket |
| | `/sessions/{id}/analysis` | GET | Yes | Fetch AI analysis + score |
| | `/sessions/{id}/transcript` | GET | Yes | Fetch transcripts |
| | `/sessions/questions/{id}` | GET | Yes | Fetch session questions |
| **Questions** | `/questions/generate/{id}` | POST | Yes | Trigger AI question generation |
| | `/questions/session/{id}` | GET | Yes | Get questions (without model answers) |
| | `/questions/session/{id}/with-answers` | GET | Yes | Get questions with model answers |
| | `/questions/all` | GET | Admin | All questions across sessions |
| | `/questions/add` | POST | Admin | Manually add a question |
| **Users** | `/users/me` | GET | Yes | Get current user profile |
| | `/users/change-password` | PUT | Yes | Update password |

### WebSocket Message Protocol

**Client → Server:**

| Type | Payload | Action |
|---|---|---|
| `"audio"` | `{type:"audio", data: base64(PCM/WAV bytes)}` | Decode, store, transcribe with Whisper |
| `"video"` | `{type:"video", data: base64(JPEG bytes)}` | Decode, store, run SmolVLM2 emotion analysis |
| `"session_complete"` | `{type:"session_complete"}` | Flush remaining audio, mark session COMPLETED |

**Server → Client:**

| Type | Payload | Trigger |
|---|---|---|
| `"transcription"` | `{type:"transcription", data:"text", chunk_number:N}` | After each audio chunk is transcribed |
| `"status"` | `{type:"status", data:"Interview Completed"}` | After session_complete acknowledged |

---

## Environment Variables

### Frontend (`.env.local`)

| Variable | Example | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend REST base URL |

### Backend (`.env`) — for reference

| Variable | Example | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql+psycopg://user:pass@localhost/intraviewer` | Full SQLAlchemy connection string |
| `SECRET_KEY` | `long-random-string` | JWT signing secret |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token lifetime |
| `PGADMIN_DEFAULT_EMAIL` | `admin@admin.com` | pgAdmin login |
| `PGADMIN_DEFAULT_PASSWORD` | `admin` | pgAdmin password |

---

## Deployment

### Local Development (with Docker backend)

```bash
# Backend
cd backend
cp .env.example .env
docker compose up --build    # Starts API (8000), DB (5432), pgAdmin (5050)

# Frontend
cd frontend
npm install
cp .env.example .env.local   # Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                  # Starts on port 3000
```

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables (Production)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Vercel (recommended for Next.js)

```bash
npm i -g vercel
vercel deploy
```

### Docker

```bash
docker build -t intraviewer-frontend .
docker run -p 3000:3000 intraviewer-frontend
```

---

## Security

| Measure | Implementation |
|---|---|
| Password hashing | Argon2 (memory-hard, timing-attack resistant) |
| Access tokens | JWT HS256, 30-minute expiry |
| Refresh tokens | JWT HS256, stateless (revocation planned — see Future Work) |
| Route protection (server-side) | Next.js middleware reads `auth-storage` cookie |
| Route protection (client-side) | `AuthGuard` component + `isAuthenticated` from `authStore` |
| Admin-only endpoints | Role check in backend service layer |
| CORS | Restricted to `http://localhost:3000` in development |
| Database | Parameterised queries via SQLAlchemy ORM (SQL injection prevention) |
| Data privacy | All AI models run locally — CV and audio are never sent to external APIs |
| WebRTC media | DTLS encryption for peer connections |
| File upload | Client + server-side type and size validation |

---

## Browser Support

| Browser | Minimum Version |
|---|---|
| Chrome / Chromium | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

Requires browser support for: WebRTC (`getUserMedia`, `RTCPeerConnection`), WebSocket, and `MediaRecorder` API.

---

## Troubleshooting

### Camera / Microphone Not Working
- Check browser permissions (address bar icon).
- HTTPS is required in production for `getUserMedia`.
- Try a different browser.
- Test your device in system settings.

### WebSocket Connection Failed
- Verify the backend server is running on port 8000.
- Check `NEXT_PUBLIC_API_URL` in `.env.local`.
- Ensure the backend supports WebSocket upgrades.
- Check firewall / proxy settings.

### LLM Question Generation Slow or Failing
- Question generation loads Phi-3 Mini (~2.5 GB). Allow 60–120 seconds on first run.
- The model is unloaded after generation completes to free RAM for Whisper.
- Check backend logs for memory errors; ensure ≥ 8 GB RAM available.

### WebRTC Debugging
- Chrome: open `chrome://webrtc-internals`.
- Firefox: open `about:webrtc`.

### Performance Issues
- Reduce video constraints in `useMediaStream`.
- Monitor network bandwidth (Network tab in DevTools).
- Profile with Chrome DevTools Performance panel.

---

## Future Work

| Feature | Priority | Description |
|---|---|---|
| Full response evaluation pipeline | High | Wire up `LLMService.evaluate_candidate_response()` to run automatically on session completion |
| Refresh token blacklist | High | Store refresh tokens in DB to support explicit logout and revocation |
| GPU acceleration | High | CUDA/MPS inference for faster transcription and LLM generation |
| Async AI processing | Medium | Move AI tasks to Celery + Redis background workers |
| Production deployment | Medium | Nginx reverse proxy, HTTPS/WSS, CI/CD pipeline |
| User progress tracking | Medium | Dashboard showing improvement over multiple sessions with skill radar charts |
| Streaming LLM output | Medium | Stream question text token-by-token for a more interactive feel |
| Multi-language support | Low | Whisper supports 99 languages — expose language selection in the UI |
| Mobile application | Low | React Native or Flutter wrapper |
| Admin analytics dashboard | Low | Aggregated session stats, question popularity, emotion trends |

---

## Contributing

### Code Style
- TypeScript for type safety throughout.
- Functional components with React hooks.
- Tailwind CSS for styling — no CSS modules.
- Zustand for global state — no Redux.

### Commit Message Format

```
type(scope): description

Examples:
feature(auth): add password reset functionality
fix(session): resolve WebSocket reconnection issue
docs(readme): update environment variable table
```

---

## License

This project is part of the IntraViewer platform — an AI-powered interview preparation system.

---

**Frontend Version:** 0.1.0 · **Status:** Production Ready (Backend Integration Required)
