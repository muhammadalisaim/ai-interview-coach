# AI Mock Interview Coach 🎙️🤖

An intelligent, voice-first mock interview training platform built for university students and fresh graduates. Practice role-based interviews aloud, receive spoken questions from an AI interviewer, and get structured evaluations on **Answer Quality**, **Speaking Confidence**, and **English Fluency**.

Designed and documented according to the official project specification by **Muhammad Ali Saim**.

---

## 🌟 Key Features

- **🎙️ Spoken Voice Interview Simulator**:
  - The AI interviewer reads role-based questions aloud using the browser's `SpeechSynthesis` API.
  - Answers are captured in real time via microphone using continuous `SpeechRecognition`.
  - Live interim transcript displays as you speak.
  - Fallback typing mode available for noisy environments or unsupported browsers.

- **📊 Intelligent Multi-Dimensional Scoring Engine**:
  - **Answer Quality (0–10)**: Evaluates relevance, technical depth, STAR behavioral structure (Situation, Task, Action, Result), and real-world examples.
  - **Speaking Confidence (0–10)**: Mathematical blend of speaking pace ($110–170$ WPM is optimal), verbal filler word penalty (`um`, `uh`, `basically`, `you know`), and AI tone assessment.
  - **English Fluency (0–10)**: Analyzes grammar, vocabulary precision, and highlights explicit mistakes with "Said ❌ vs Better ✅" suggestions.
  - **Overall Score (0–100)**: Weighted formula: $0.4 \times \text{Quality} + 0.3 \times \text{Confidence} + 0.3 \times \text{English}$.

- **🔄 Adaptive Follow-up Questions**:
  - The AI interviewer dynamically generates a targeted follow-up question if an initial answer is vague, shallow, or missing context.

- **📈 Analytics & 7-Day Personalized Practice Plan**:
  - Interactive multi-line chart using **Recharts** tracking performance over time.
  - Top 3 strengths and top 3 high-impact improvement areas.
  - Personalized 7-day daily actionable practice drills.
  - Optional **Roman Urdu** coaching tips for regional learners (Feature F12).

- **🛡️ Admin & Role Management**:
  - Enable, disable, and create custom job roles with tailored skill tags.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server Components & Route Handlers) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS (Dark/Light mode support) |
| **State Management** | Zustand |
| **Data Visualization** | Recharts |
| **Icons & Motion** | Lucide React, Framer Motion |
| **Core AI** | Claude 3.5 / 5.5 Sonnet (`@anthropic-ai/sdk`) + Built-in offline rubric engine |
| **Database** | Supabase (PostgreSQL with Row-Level Security) + Local file-backed repository |
| **Voice APIs** | Web Speech API (`SpeechRecognition`, `SpeechSynthesis`, `AudioContext`) |
| **Testing** | Vitest |

---

## 🚀 Quick Start

### 1. Installation
Clone or navigate to the project directory:
```bash
cd ai-interview-coach
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your Anthropic API Key and Supabase credentials if available:
```env
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
> **Note**: The application is built with a seamless **Instant Interactive Engine**. If no API keys are provided, it operates immediately with high-fidelity simulated evaluations and persistent local storage so you can test the complete voice interview flow right away!

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in **Google Chrome** or **Microsoft Edge** (which offer the most complete Web Speech API support).

### 4. Run Automated Tests
```bash
npx vitest run
```

---

## 🗄️ Database Setup (Supabase)

If deploying to Supabase:
1. Open the **SQL Editor** in your Supabase dashboard.
2. Execute the contents of `supabase/schema.sql` to create tables (`profiles`, `roles`, `sessions`, `questions`, `answers`), indexes, and Row-Level Security policies.
3. Execute `supabase/seed.sql` to seed default job roles.

---

## 📱 Supported Browsers

- **Google Chrome** (Desktop & Android): Full native voice recognition and speech synthesis.
- **Microsoft Edge** (Desktop): Full native voice recognition and speech synthesis.
- **Safari / Firefox**: Speech synthesis is fully supported; speech input automatically activates the responsive typed answer box fallback.

---

## 📄 License
MIT License. Built for students, educational institutions, and career coaching.
