# Circles

> **"Too big to ignore, too small for therapy."**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/Google_Gemini_API-2.5%20%2F%203.5-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

---

## Table of Contents

- [About the Project](#about-the-project)
  - [The Core Philosophy](#the-core-philosophy)
  - [The Emotional Gap](#the-emotional-gap)
- [Key Features](#key-features)
  - [1. Orbit — AI Emotional Support Companion](#1-orbit--ai-emotional-support-companion)
  - [2. Guardian Mode — Deterministic Safety Engine](#2-guardian-mode--deterministic-safety-engine)
  - [3. Community — Peer Support Sanctuary](#3-community--peer-support-sanctuary)
  - [4. My Profile — Identity & Reflection Hub](#4-my-profile--identity--reflection-hub)
  - [5. Wellness Tools — Box Breathing & Mood Check-in](#5-wellness-tools--box-breathing--mood-check-in)
  - [6. Thoughtful Visual Design](#6-thoughtful-visual-design)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
  - [High-Level System Flow](#high-level-system-flow)
  - [Safety-First Conversational Pipeline](#safety-first-conversational-pipeline)
  - [Moderation Engine Flow](#moderation-engine-flow)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
  - [Prerequisites](#prerequisites)
  - [Step 1: Clone the Repository](#step-1-clone-the-repository)
  - [Step 2: Install Dependencies](#step-2-install-dependencies)
  - [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
  - [Step 4: Launch the Development Server](#step-4-launch-the-development-server)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Implemented vs. Planned Features](#implemented-vs-planned-features)
- [Future Enhancements](#future-enhancements)
- [Important Disclaimer](#important-disclaimer)
- [License](#license)

---

## About the Project

**Circles** is an independently developed, AI-powered emotional support platform engineered to bridge a vital gap in modern mental wellbeing: the everyday emotional struggles that feel **"too big to ignore, yet too small for clinical therapy."**

### The Core Philosophy

Most mental health solutions exist at polar extremes:
1. **Clinical Healthcare & Therapy:** Essential and irreplaceable for acute psychiatric conditions and severe mental health disorders, but often associated with high costs, scheduling barriers, and social stigma.
2. **Casual Social Media or Generic Productivity Apps:** Often loud, addictive, performative, and occasionally invalidating or toxic.

Between these two extremes lies a vast spectrum of everyday human strain: academic exhaustion, imposter syndrome, career burnout, relational anxiety, quiet loneliness, and the simple need to be heard without judgment. 

Circles offers a calm digital sanctuary designed for these moments. It unites empathetic conversational AI, deterministic crisis detection, peer community discussions, and somatic calming exercises in a warm, respectful environment.

---

## Key Features

### 1. Orbit — AI Emotional Support Companion

**Orbit** is a dedicated conversational companion engineered specifically for active listening, validation, and emotional reflection:

- **Empathetic Context Awareness:** Integrated with Google's Gemini models (`gemini-2.5-flash`, `gemini-3.5-flash-lite`, and `gemini-3.5-flash`), Orbit delivers grounded, compassionate, and non-generic replies.
- **Active Listening First:** Strict system instructions prioritize concise responses (2 to 4 sentences), direct reflection of the user's specific feelings, and a maximum of one reflective question. It consciously avoids unsolicited advice or patronizing lectures when users simply need to be heard.
- **Conversational Memory:** Maintains a rolling window of recent dialogue context while enforcing strict privacy and boundary safeguards.
- **New Conversation Control:** Allows users to reset conversation context anytime with a single click and confirmation modal without reloading the page.
- **Medical Boundary Enforcement:** Never issues clinical diagnoses, prescriptions, or psychiatric advice.

---

### 2. Guardian Mode — Deterministic Safety Engine

A central engineering principle in Circles is that **safety decisions are made in plain, deterministic code before any generative AI model is called.** Generative models are never permitted to decide self-harm risk levels or author crisis response cards.

```
                  ┌──────────────────────────────┐
                  │       Incoming Message       │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │ Text Normalization & Denials │
                  │      (Straighten, Strip)     │
                  └──────────────┬───────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
        [Severe Risk (L2/L3)]           [Normal Dialogue (L1)]
                 │                               │
                 ▼                               ▼
  ┌──────────────────────────────┐ ┌───────────────────────────┐
  │  BLOCK AI Model Invocation   │ │ Call Gemini API           │
  │  Return Structured Crisis    │ │ Warm, reflective          │
  │  Card & Emergency Helplines  │ │ supportive response       │
  └──────────────────────────────┘ └───────────────────────────┘
```

- **Three-Tiered Risk Classification:**
  - **Level 1 (Standard):** Everyday distress, historical mentions (e.g., *"years ago"*), or academic/hypothetical inquiries. Passed through to Orbit with compassionate guidelines.
  - **Level 2 (Emerging Urges / Distress):** Expressions of suicidal ideation or active urges (e.g., *"i just have an urge to do it"*, *"i want to die"*). Immediately displays a curated crisis resource card and halts generative AI calls for that turn.
  - **Level 3 (Imminent Crisis / Lethal Means):** Specific plans, timings, or means (e.g., *"tonight"*, *"pills"*, *"rope"*). Immediately surfaces highest-priority emergency contacts with direct crisis actions.
- **Robust Text Normalization:** Expands informal contractions (`im` $\rightarrow$ `i am`, `dont` $\rightarrow$ `do not`, `cant` $\rightarrow$ `cannot`), normalizes typography, and cleans punctuation.
- **Explicit Denial Protection:** Strips negated phrases first (e.g., *"i have no urge to do it"*, *"i do not want to die"*) so negated thoughts never trigger false crisis cards.
- **Verified Helpline Directory:** Out-of-the-box verified crisis helplines for India:
  - **National Emergency Number:** `112` (Immediate emergency response across India)
  - **Tele-MANAS:** `14416` (24/7 toll-free mental health service, Ministry of Health and Family Welfare)
  - **Vandrevala Foundation:** `+91 9999 666 555` or `7304599837` (24/7 free counseling & crisis intervention)
  - **KIRAN Helpline:** `1800-599-0019` (24/7 mental health rehabilitation helpline)

---

### 3. Community — Peer Support Sanctuary

A Reddit-inspired yet gentler community forum where individuals can exchange lived experiences and receive peer support:

- **Structured Post Creation:** Compose posts with title, rich body content, and targeted category tagging:
  - *Small Wins*
  - *Need Someone to Talk To*
  - *Self Reflection*
  - *College & Life*
  - *Just Sharing*
- **Anonymous Identity Protection:** Users can post either with their display profile or as **"Anonymous Friend"**. Authorship IDs are secured on the server, ensuring anonymity is preserved in public payloads while allowing owners to delete their own content.
- **Supportive Reaction Palette:** Replaces vanity metrics with four supportive intentions:
  - 💜 **Warmth**
  - 🤝 **I'm Here**
  - ✨ **You Matter**
  - 🌱 **Proud of You**
- **Threaded Discussions:** Supports community comments and nested replies.
- **Author-Only Deletion:** Users can delete their own posts and comments with a confirmation modal, instantly updating the feed and persisting to the database.
- **Automated Anti-Abuse Shield:** Both client and backend analyze submissions against harassment, insults, degrading slurs, and leetspeak bypasses (`$lut`, `b!tch`, spaced tokens). Violating posts trigger a gentle educational modal (*"Let's keep Circles a safe space 💜"*), while self-referential distress (*"I feel like a loser"*) remains fully permitted.

---

### 4. My Profile — Identity & Reflection Hub

- **Profile Customization:** Edit and save display name, personal bio, contact email, and pastel gradient avatar presets.
- **Activity Feed:** Transparently review all authored posts (distinguishing anonymous contributions from public ones), authored comments, and supportive reactions given across the community.
- **Reflections Status:** Features an honest reflection hub that communicates backend capabilities truthfully rather than manufacturing synthetic statistics.

---

### 5. Wellness Tools — Box Breathing & Mood Check-in

- **Box Breathing (4-4-4-4 Rhythm):**
  - Accessible directly from the Orbit chat header.
  - Guided 4-stage cycle: **Inhale (4s)** $\rightarrow$ **Hold (4s)** $\rightarrow$ **Exhale (4s)** $\rightarrow$ **Hold (4s)**.
  - Smoothly expanding and contracting visual animations synchronized with phase countdowns.
  - Interactive controls to **Start**, **Pause**, **Resume**, and **End Exercise**.
  - Thoughtful closing reflection screen: *"Well done. Take your time before continuing."*
  - Independent modal operation that never pollutes the chat history.
- **Daily Mood Check-in:**
  - Integrated on the Home dashboard.
  - 5 expressive states: *Great*, *Calm*, *Okay*, *Stressed*, *Down*.
  - Displays instant, non-judgmental grounding affirmations tailored to the selected state.

---

### 6. Thoughtful Visual Design

Circles implements a soft pastel palette inspired by modern wellness design principles:
- **Canvas / Background:** Warm off-white / ivory (`#FAF9F6`)
- **Secondary Surfaces:** Light lavender tint (`#F3F0FA`)
- **Primary Accents:** Soft lavender purple (`#A78BFA`) and muted violet (`#8B70D6`)
- **Secondary Accents:** Calming sage green (`#B8D8C8`) and pale lilac (`#EDE7FA`)
- **Cards & Surfaces:** Clean white (`#FFFFFF`) with subtle lavender borders (`#E8E4F0`)
- **Typography:** Deep charcoal navy (`#25243A`) with muted slate secondary text (`#77758A`)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19 (`react`, `react-dom`) | Declarative, component-based user interface |
| **Language** | TypeScript 5.x / 7.x | End-to-end type safety across client and server |
| **Styling & Design** | Tailwind CSS v4 (`@tailwindcss/vite`) | Utility-first, responsive, custom pastel theme |
| **Build & Tooling** | Vite 8 (`vite`, `@vitejs/plugin-react`) | Rapid build pipeline and HMR dev server |
| **Icons & UI** | Lucide React (`lucide-react`) | Clean, accessible vector iconography |
| **Motion & Dynamics** | Motion (`motion`) | Fluid transitions and modal presentation |
| **Backend Framework** | Express 4 (`express`) | RESTful API routing, JSON payloads, middleware |
| **Runtime & Execution**| Node.js with `tsx` | Direct TypeScript execution for Express server |
| **AI SDK** | `@google/genai` (v2.4.0) | Official SDK for Gemini model integration |
| **Data Storage** | Local JSON Store (`fs/promises`) | Atomic file persistence for posts and profiles |
| **Configuration** | Dotenv (`dotenv`) | Environment variable management |

---

## Project Architecture

### High-Level System Flow

```
┌────────────────────────────────────────────────────────┐
│                   Circles Frontend                     │
│  (React 19 SPA · Tailwind CSS v4 · Lucide React)       │
├─────────────┬─────────────┬──────────────┬─────────────┤
│  Home Page  │ Orbit Chat  │  Community   │ My Profile  │
│ Mood & Nav  │ & Breathing │ Feed & Posts │ & Activity  │
└──────┬──────┴──────┬──────┴──────┬───────┴──────┬──────┘
       │             │             │              │
       │ HTTP / JSON │             │              │
       ▼             ▼             ▼              ▼
┌────────────────────────────────────────────────────────┐
│                   Express API Server                   │
│                    (Node.js + tsx)                     │
├────────────────────┬─────────────────────┬─────────────┤
│   /api/community   │     /api/orbit      │ /api/profile│
│   Posts, Comments, │  Guardian Check &   │   User Bio, │
│   Reactions, Mod   │  Gemini Integration │   Activity  │
└─────────┬──────────┴──────────┬──────────┴──────┬──────┘
          │                     │                 │
          ▼                     ▼                 ▼
   ┌─────────────┐       ┌─────────────┐   ┌─────────────┐
   │ Local Data  │       │ Google      │   │ Guardian    │
   │ Store (JSON)│       │ Gemini API  │   │ Rule Engine │
   │ `data/*.json│       │ 2.5 / 3.5   │   │ Plain Code  │
   └─────────────┘       └─────────────┘   └─────────────┘
```

### Safety-First Conversational Pipeline

1. **Client Request:** `OrbitChat` sends the prompt, recent message history (last 6 turns), and existing session state to `POST /api/orbit/chat`.
2. **Guardian Check Execution:** The server executes `guardianCheck()` in `src/backend/guardian/guardianCheck.ts`.
3. **Branching Logic:**
   - **Critical / Crisis:** If risk level is 3 or an unacknowledged level 2, the pipeline returns a predetermined compassionate statement and the structured crisis resource card. Gemini API is **never contacted**.
   - **Standard Conversation:** If risk level is 1 (or safe level 2), sanitised history is passed to `@google/genai`.
4. **AI Generation with Fallbacks:** The server requests completion with strict temperature (`0.7`) and max tokens (`300`), racing against a 15-second timeout and failing over between Gemini models if necessary.

### Moderation Engine Flow

1. User submits a new post, comment, or reply.
2. `checkAbusiveContent()` in `src/shared/moderation/abuseDetector.ts` executes:
   - Contraction and leetspeak deobfuscation (`@` $\rightarrow$ `a`, `$` $\rightarrow$ `s`, etc.).
   - Punctuation-collapse checks (`s.l.u.t`, `b-i-t-c-h`).
   - Targeted insult detection without flagging benign expressions or self-talk.
3. If flagged: Request is rejected with a `400 Bad Request` and a structured `isAbusive: true` payload, triggering the supportive warning dialog.
4. If clear: Content is sanitized, assigned an internal author ID, and saved.

---

## Project Structure

```
circles/
├── data/                               # Persistent local JSON data storage
│   ├── community.json                  # Community posts, comments, and reactions
│   └── profiles.json                   # User profile accounts and settings
├── src/
│   ├── backend/                        # Server-side business logic
│   │   ├── guardian/
│   │   │   └── guardianCheck.ts        # Deterministic safety & crisis detection engine
│   │   └── routes/
│   │       ├── community.routes.ts     # Post, comment, reaction, and moderation endpoints
│   │       ├── index.ts                # Express API router aggregator (/api/*)
│   │       ├── orbit.routes.ts         # Orbit chat API integrating Gemini & Guardian
│   │       └── profile.routes.ts       # Profile management and activity aggregations
│   ├── components/                     # Frontend React UI components
│   │   ├── BoxBreathingModal.tsx       # 4-4-4-4 somatic box breathing exercise modal
│   │   ├── CommunityPage.tsx           # Peer community feed, composer, and discussions
│   │   ├── HomePage.tsx                # Welcome dashboard, mood tracker, affirmations
│   │   ├── OrbitChat.tsx               # Orbit chat view, new-chat reset, crisis cards
│   │   └── ProfilePage.tsx             # User profile, activity feed, reflections tab
│   ├── shared/                         # Code shared across client and server
│   │   ├── constants/
│   │   │   └── orbitResources.ts       # Verified national emergency & crisis helplines
│   │   └── moderation/
│   │       └── abuseDetector.ts        # Content moderation & anti-abuse regex algorithms
│   ├── App.tsx                         # Core layout, sidebar navigation, responsive frame
│   ├── index.css                       # Global styles & Tailwind CSS v4 import
│   └── main.tsx                        # React application mounting point
├── .env.example                        # Template for environment variables
├── .gitignore                          # Git file exclusion rules
├── index.html                          # Single Page Application entry HTML
├── package.json                        # Project metadata, dependencies, and npm scripts
├── server.ts                           # Unified Express + Vite development and production server
├── tsconfig.json                       # TypeScript compiler options
└── vite.config.ts                      # Vite configuration with React & Tailwind plugins
```

---

## Installation and Setup

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v20.0.0` or higher (recommended: LTS Node 22+)
- **npm**: `v10.0.0` or higher
- A valid **Google Gemini API Key** (obtainable from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/circles.git
cd circles
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Open `.env` in your editor and provide your Gemini API key:

```env
GEMINI_API_KEY="your-actual-gemini-api-key"
PORT=3000
```

### Step 4: Launch the Development Server

```bash
npm run dev
```

The unified development server will compile TypeScript files, mount Vite middleware, and start Express on:

```
http://localhost:3000
```

---

## Environment Variables

Circles uses dotenv to load configurations at server startup. The following variables are supported:

| Variable | Required | Description | Default |
|---|---|---|---|
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key used by Orbit for empathetic chat responses | `""` |
| `PORT` | No | Port on which the Express server listens | `3000` |
| `APP_URL` | No | Base URL of the hosted application (for callbacks or webhooks) | `http://localhost:3000` |
| `NODE_ENV` | No | Environment mode (`development` or `production`) | `development` |

### `.env.example` Template

```env
# Google Gemini API key (Required for Orbit Chat companion)
# Obtain your key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY="your_api_key_here"

# Application hosting URL
APP_URL="http://localhost:3000"

# Optional server port
PORT=3000
```

---

## Running the Application

The following npm scripts are defined in `package.json`:

| Command | Description |
|---|---|
| `npm run dev` | Starts the Express backend with live Vite middleware via `tsx server.ts` |
| `npm run build` | Compiles frontend assets into the optimized production directory `dist/` |
| `npm run start` | Runs the full-stack application using the production static bundle |
| `npm run lint` | Runs the TypeScript compiler (`tsc --noEmit`) to validate type integrity |
| `npm run clean` | Cleans build artifacts (`dist` folder and temporary files) |
| `npm run preview`| Localy previews the production build using Vite |

---

## API Endpoints

### Orbit Conversational Companion
- `POST /api/orbit/chat`
  - **Body:** `{ text: string, history: Array<{ role: string, text: string }>, session: GuardianSession | null }`
  - **Response:** `{ success: boolean, data: { text: string, card: CrisisCard | null, guardianSession: GuardianSession, riskLevel: number } }`

### Community Platform
- `GET /api/community/posts?userId=<optional>` — Retrieves all community posts, comments, reaction tallies, and computed user ownership flags.
- `POST /api/community/posts` — Creates a new post after running anti-abuse checks. Supports anonymous publication.
- `DELETE /api/community/posts/:id` — Deletes a post (author-only check).
- `POST /api/community/posts/:id/comments` — Adds a top-level or threaded comment after moderation.
- `DELETE /api/community/posts/:id/comments/:commentId` — Deletes an author-owned comment.
- `POST /api/community/posts/:id/react` — Toggles one of four supportive reactions (`warmth`, `here`, `matter`, `proud`).

### User Profile
- `GET /api/profile?userId=<id>` — Retrieves user profile information (or initializes a default profile).
- `PUT /api/profile` — Updates user display name, bio, email, and avatar preset.
- `GET /api/profile/activity?userId=<id>` — Aggregates user's authored posts, comments, and given reactions.
- `GET /api/profile/reflections?userId=<id>` — Reflection history endpoint (currently denotes planned storage).

---

## Implemented vs. Planned Features

| Feature | Current Status | Notes |
|---|:---:|---|
| Orbit Conversational Companion | ✅ Implemented | Powered by Gemini 2.5/3.5 with emotional prompts |
| Deterministic Guardian Safety Check | ✅ Implemented | Plain TypeScript regex & normalization engine |
| Indian Crisis Helplines Card | ✅ Implemented | 112, Tele-MANAS, Vandrevala Foundation, KIRAN |
| Box Breathing Somatic Exercise | ✅ Implemented | 4-4-4-4 rhythm with visual expansion animation |
| Daily Mood Tracker & Affirmations | ✅ Implemented | 5 distinct mood states with custom reflections |
| Community Posts & Categories | ✅ Implemented | 5 categories, anonymous or identified posting |
| Supportive Reactions & Comments | ✅ Implemented | 4 thoughtful reactions, threaded replies |
| Anti-Abuse Content Moderation | ✅ Implemented | Leetspeak & token analysis with safe self-talk |
| Post & Comment Self-Deletion | ✅ Implemented | Immediate feed update and JSON persistence |
| User Profile & Activity Tracking | ✅ Implemented | Edits persisted to `profiles.json` |
| Persistent Journal Reflections | ⏳ Planned | Endpoint active; structured storage in progress |
| User Authentication (OAuth / JWT) | ⏳ Planned | Current session relies on browser/profile ID |
| Audio / Voice Guided Orbit Chat | ⏳ Planned | Exploration of Web Audio and speech models |

---

## Future Enhancements

- [ ] **Encrypted Personal Journaling:** Add end-to-end encrypted personal reflections with mood correlation analytics.
- [ ] **Multi-Regional Crisis Helplines:** Dynamically surface local emergency resources based on client locale (e.g., US 988, UK 111, Canada 988).
- [ ] **Real-Time Peer Discussions:** Implement WebSockets for instant community notifications and live peer chat circles.
- [ ] **Progressive Web App (PWA):** Enable offline breathing exercises and homescreen installability on iOS and Android.
- [ ] **Authentication & Security:** Integrate OAuth 2.0 (Google, GitHub) or passkeys for multi-device sync.

---

## Important Disclaimer

> ### ⚠️ Mental Health & Medical Disclaimer
> 
> **Circles is not a healthcare provider, clinical diagnostic tool, or emergency dispatch service.**
> 
> - Orbit is an artificial intelligence companion built for emotional validation and active listening. It cannot diagnose psychological conditions, prescribe medications, or replace psychotherapy.
> - If you are in immediate physical danger, experiencing acute suicidal thoughts, or dealing with a medical emergency, **please contact emergency services or reach out to a certified professional immediately.**

### Emergency Contacts (India)
- **National Emergency Helpline:** **`112`**
- **Tele-MANAS (Mental Health):** **`14416`** (Toll-Free, 24/7)
- **Vandrevala Foundation Helpline:** **`+91 9999 666 555`** or **`7304599837`** (24/7 Free Support)
- **KIRAN Rehabilitation Helpline:** **`1800-599-0019`** (Toll-Free, 24/7)

---

## License

The license for Circles is currently **to be determined (All Rights Reserved)**. An open-source license may be designated in future releases.
