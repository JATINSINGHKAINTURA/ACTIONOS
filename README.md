# ⚡ ActionOS — The Mindful Productivity System & Autonomous Action Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?logo=vite)](https://vitejs.org/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-3.8_Flash-8e75ff?logo=google-gemini)](https://ai.google.dev/)

> **ActionOS** is a serene, local-first operating workspace designed for thinkers, researchers, students, and software engineers. It bridges unstructured brain dumps, meeting notes, and study blueprints into verified, executable action plans backed by human-in-the-loop approval.

---

## 🌟 Overview

Modern productivity tools suffer from fragmentation and context switching. **ActionOS** unifies your work into a single, intelligent operating surface with 4 specialized workspaces (**Personal**, **Work**, **College**, **Development**).

It pairs server-side **Google Gemini AI** intelligence with a **100% zero-network offline fallback engine** so you can plan, schedule, and execute your day whether connected to cloud AI or completely offline.

---

## 🚀 Key Features

### 🏢 1. Universal Multi-Workspace Hub
- **Personal Space**: Daily routines, wellness tracking, personal goals, and quick captures.
- **Work Space**: Client deliverables, executive project trackers, meeting action item extractors.
- **College (Student) Space**: Exam study planner, subject attendance calculator, assignment countdowns.
- **Development (Engineering) Space**: Developer portfolio showcase, GitHub activity integrations, system architecture logs.

### 🧠 2. Intelligent AI & Offline Task Extraction
- **Unstructured Ingestion**: Paste raw text, emails, or meeting transcripts.
- **Explainable Priority Signals**: Automatically classifies items into `URGENT`, `HIGH`, `MEDIUM`, or `LOW` priority with transparent, human-readable reasons quoting the exact source triggers.
- **Dual Processing Engine**: Uses **Google Gemini 3.8 Flash** when an API key is available, and seamlessly falls back to a deterministic heuristic NLP parser offline.

### ⏱️ 3. Executable Timetable & Time-Blocking Studio
- **Algorithmic Schedule Generation**: Converts long-term goals into structured time blocks (Pomodoro 25/5, Deep Work 50/10, Ultra Focus 90/20).
- **Energy Profile Alignment**: Optimizes schedule blocks against your natural circadian rhythm (Morning Peak, Evening Focus, Balanced).
- **Cognitive Load Analytics**: Calculates real-time mental fatigue scores and alerts you to schedule bottlenecks.

### 💬 4. ActionBot Copilot with Cross-Workspace Intelligence
- Floating, context-aware AI assistant capable of reading active tasks across all enabled workspaces.
- Ask ActionBot to *"Plan my day"*, *"Break down task #1 into subtasks"*, *"Draft team update email"*, or *"Audit plan risks"*.

### 🛡️ 5. Human-in-the-Loop Verification & Audit Trail
- **Strict Side-Effect Boundary**: Computation (task extraction & scheduling) is separated from mutation (sending emails, calendar sync).
- **Cryptographic Audit Signature**: Every approved action batch generates an immutable SHA-256 execution proof hash logged to local session history.

### 📅 6. Interoperability & Export
- **RFC 5545 `.ICS` Calendar Export**: Single-click export of approved action items to Apple Calendar, Google Calendar, or Outlook.
- **Markdown Status Reports**: Generate clean executive status updates ready to copy into Slack or email.

### ⌨️ 7. Command Palette (`⌘K` / `Ctrl+K`)
- Instant keyboard-driven command menu for power users to navigate workspaces, trigger focus timers, approve action plans, and export schedules.

---

## 📐 Architecture & Tech Stack

```text
ActionOS Core Architecture
├── Client Surface (SPA)
│   ├── React 19 (Component Hierarchy)
│   ├── Framer Motion (Micro-interactions & Smooth Transitions)
│   ├── Tailwind CSS v4 (Design System & Dark Theme Styling)
│   └── Lucide React (System Icons)
├── Development & Build System
│   ├── Vite 6 (HMR & Module Bundling)
│   ├── TypeScript 5.7 (Type Safety & Strict Schemas)
│   └── ESBuild (Server Packaging)
└── Backend Runtime (Node.js + Express)
    ├── Google GenAI SDK (@google/genai — Gemini 3.8 Flash)
    ├── Express REST API (Task Parsing, Study Planner, Chat Copilot)
    └── Heuristic NLP Fallback (Offline Execution Engine)
```

---

## 📁 Repository Structure

```text
ACTIONOS/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI build & lint check
├── src/
│   ├── components/              # Workspace views, modals, command palette, navigation
│   │   ├── ActionBotDrawer.tsx
│      ├── AnalyticsView.tsx
│      ├── CalendarView.tsx
│      ├── CommandPalette.tsx
│      ├── DeveloperWorkspaceView.tsx
│      ├── FocusModeView.tsx
│      ├── GoalsManager.tsx
│      ├── MeetingActionsModal.tsx
│      ├── MotionGraphics.tsx
│      ├── Navbar.tsx
│      ├── OverviewShowcase.tsx
│      ├── QuickCaptureModal.tsx
│      ├── SmartTaskManager.tsx
│      ├── StudentWorkspaceView.tsx
│      ├── TimetableStudioModal.tsx
│      ├── UniversalDashboard.tsx
│      └── WorkWorkspaceView.tsx
│   ├── utils/                   # Audio synthesize helpers & initial state data
│   │   ├── audio.ts
│      └── initialData.ts
│   ├── types.ts                 # Centralized TypeScript definitions
│   ├── App.tsx                  # Main workspace router and state hub
│   └── main.tsx                 # React DOM root entry point
├── server.ts                    # Express API server with Gemini AI + Offline Heuristics
├── index.html                   # Main application SPA container
├── analysis.html                # Task analysis & breakdown view
├── action.html                  # Verification & action approval view
├── workspace.html               # Quick workspace redirect page
├── vite.config.ts               # Vite bundler & alias configuration
├── tsconfig.json                # TypeScript compiler configuration
├── package.json                 # Dependencies & build scripts
├── metadata.json                # Workspace application metadata
├── .env.example                 # Environment variables template
└── README.md                    # Project documentation
```

---

## 🚦 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### 1. Clone the Repository
```bash
git clone https://github.com/JATINSINGHKAINTURA/ACTIONOS.git
cd ACTIONOS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables (Optional)
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Add your Google Gemini API key if you want cloud AI features (if omitted, ActionOS will automatically run using its built-in offline engine):
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🛠️ API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health check endpoint returning service status. |
| `/api/extract` | `POST` | Ingests raw text and returns structured tasks with priorities and reasons. |
| `/api/quick-parse` | `POST` | Parses single-line quick capture inputs into title, deadline, workspace, and priority. |
| `/api/breakdown-task` | `POST` | Decomposes large goals/tasks into 5-7 micro subtasks. |
| `/api/study-planner` | `POST` | Generates exam revision stages and daily study targets. |
| `/api/meeting-actions`| `POST` | Extracts discrete action items, assignees, and deadlines from meeting notes. |
| `/api/generate-timetable` | `POST` | Generates structured time-blocked schedules & energy curves. |
| `/api/chat` | `POST` | Context-aware chat completions for ActionBot Copilot. |
| `/api/audit-risks` | `POST` | Evaluates plan for urgency saturation, cognitive load, and bottlenecks. |

---

## 🛡️ License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👤 Author

**Jatin Singh Kaintura**
- GitHub: [@JATINSINGHKAINTURA](https://github.com/JATINSINGHKAINTURA)
