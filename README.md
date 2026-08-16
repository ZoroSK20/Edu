# Edu Portal: AI-Powered Education Management System

An advanced, production-ready educational management platform built to bridge the gap between administrative overhead and student success through AI automation.

## 🚀 Architectural Overview
This system is architected for high performance, scalability, and asynchronous processing, entirely bypassing monolithic bottlenecks.

- **Framework**: Next.js 14 (App Router) for hybrid Server-Side Rendering (SSR) and seamless client hydration.
- **Database**: PostgreSQL (Cloud-hosted via Supabase) mapped with **Prisma ORM** for strict type safety and relational integrity.
- **Storage**: **AWS S3** object storage handles all document (PDF/Image) uploads securely.
- **AI Integration**: The **Anthropic Claude 3.5 Sonnet Vision API** is deeply integrated into the platform for automated grading, Insight generation, and OCR extraction.
- **Queueing Engine**: A custom, database-backed background `Job` queue system (`src/worker/run.ts`) replaces the need for heavy Redis/BullMQ infrastructure while ensuring robust asynchronous AI processing.
- **Infrastructure**: Fully Dockerized (`Dockerfile` & `docker-compose.yml`) utilizing Next.js `standalone` output for minimal container footprints.

## ✨ Core Features

### 1. Asynchronous AI Exam Analysis (The OCR Pipeline)
Teachers can upload scanned exam papers directly to the portal (piped to AWS S3). To prevent blocking the main server thread, this pushes an `OCR_EXTRACTION` task to the background `Job` queue. The daemon worker polls the database, streams the document to the Anthropic API, extracts the answers, evaluates correctness, and maps specific errors directly to the `CourseTopic` syllabus tree.

### 2. Intelligent Skill Gap Generation (`AIInsights`)
Rather than generic advice, the AI engine correlates a student's graded assignments against the exact syllabus node (`CourseTopic`). It generates granular `AIInsight` records (e.g., `WEAK_TOPIC` or `FOCUS_TOPIC`) that are displayed on both the Student's Dashboard and the Teacher's Class Overview.

### 3. Smart On-Duty (OD) Request Workflows
Students upload event certificates (medical/sports) to request official absences. The upload routes asynchronously invoke the Anthropic Vision API to cross-reference the dates and text on the physical document with the requested dates in the database, automatically generating a `RECOMMEND_APPROVE` or `FLAGGED` annotation for the reviewing teacher.

### 4. Atomic Batch Attendance & Timetable Shifting
- **Batch Attendance**: Teachers can mark an entire class (dozens of students) in a single, atomic Prisma transaction, drastically reducing database connection overhead.
- **Timetable Shift Engine**: Teachers can generate a `TimetableUpdate` to override a recurring `TimetableSlot`. This triggers an instant fan-out `SCHEDULE_UPDATE` notification to all enrolled students.

## 🛡️ Security & Access Control
- **Authentication**: Powered by `NextAuth.js` utilizing bcrypt-hashed credentials and secure JWT sessions.
- **Role-Based Access Control (RBAC)**: Deep middleware protection sandboxes users into their specific domains:
  - `/admin`: Global system configuration, Job Queue monitoring, and User management.
  - `/teacher`: Course command centers, attendance processing, and student profiling.
  - `/student`: Personal insight dashboards and gradebooks.
- **Graceful Degradation**: If AI API limits are exceeded (or the `ANTHROPIC_API_KEY` is missing), the system automatically detects the failure and falls back to a simulated mock pipeline, ensuring zero downtime.

## 💻 Local Testing & Setup

```bash
# 1. Install Dependencies
npm install

# 2. Environment Variables
# Create a .env file and inject your Supabase DATABASE_URL, NextAuth secrets, AWS Keys, and Anthropic API Key.

# 3. Synchronize Schema & Seed Data
npx prisma db push
npx prisma db seed

# 4. Spin up the Development Server & AI Worker
npm run dev
npm run worker
```

### Seeded Test Accounts (Password: `password123`)
- **Admin**: `admin@portal.edu`
- **Teacher**: `prof.smith@portal.edu`
- **Student**: `jane.doe@portal.edu`
