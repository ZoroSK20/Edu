# Education Management Portal — Master Project Brief

> **How to use this file:** If a conversation with Claude runs out of context/tokens, start a new chat, attach this file plus `architecture.md` (the original spec doc) and the current codebase/zip if one exists, and paste:
> "Read MASTER_PROMPT.md and architecture.md. This is the current state of my Education Management Portal project. Continue from the last completed phase listed under 'Build Phases' below — do not re-ask questions already answered in this doc."

---

## 1. What this project is

An AI-powered Education Management Portal with three portals — **Student**, **Teacher**, **Admin** — plus a public marketing/info site. It replaces manual academic admin work (attendance, grading, OD approval, exam prep) with a connected system where every activity feeds an AI layer that gives students focused feedback, teachers class-level insight, and admins oversight.

This is a **rebuild**. A previous fragmented attempt exists (5+ separate module builds: `mod1`, `mod2`, `mod3 and 4`, `Mod5`, `backend/`, `gateway/` — different stacks, duplicated auth/schemas, inconsistent UI). It's being discarded in favor of one clean, unified build. The original `architecture.md` (attached separately) is the authoritative deep-dive spec — this file is the working summary plus every decision made on top of it.

**Design direction:** neat, minimalist UI, high-quality real implementation (not a prototype). Use the `frontend-design` skill/mindset — deliberate, non-templated visual identity, not generic AI-default styling.

---

## 2. Portal-by-portal workflow (confirmed with the user)

### Public Pages (unauthenticated "pamphlet")
Home, Courses (search/filter/listing), Course Details (syllabus, teacher info, schedule, Enroll/Access CTA), Contact. Read-only, no private data ever. Hands off to Auth at "Enroll/Access."

### Student
- Dashboard: profile, my courses, assignments, attendance, grades, AI recommendations, progress overview
- View grades/marks, track own performance, see where to improve (weak topics)
- **Add-on — Notes tied to topics:** teachers announce topics ahead of time; students view upcoming topics and keep their own notes against each topic to prep
- **Add-on — Timetable shift awareness:** when a teacher shifts/reschedules a class, the student is notified and can see/update notes for the (possibly reordered) upcoming topic
- **Add-on — OD (on-duty) requests:** student submits a request (reason, event, dates, supporting document) instead of manually explaining to the teacher in class
- Paper upload + AI feedback (see AI Engine below)
- AI Insights: weak/focus topics, improvement tips, performance graphs

### Teacher
- Post syllabus, course sheet, assignments
- **Add-on — Timetable management:** update/shift classes; this is what triggers the student notification + notes flow above; conflict-checked before saving
- **Add-on — Announce topics ahead of time:** the data source that makes student prep/notes possible
- **Add-on — OD review:** review student OD requests (with AI pre-check annotation alongside the raw document) and approve/reject — replaces manual in-class verification
- Attendance marking, marks entry (manual — see AI Engine note below)
- Class analytics: individual student performance, common errors, weak topics, at-risk students
- AI teaching recommendations + intervention logging + improvement/before-after graphs
- Reports

### Admin
- Manage students, teachers, courses/classes, assignments, exams/grades (structural/oversight role)
- Creates courses and assigns teachers; teachers own their course content (syllabus/topics/assignments) day-to-day once assigned
- System-wide reports & analytics, AI insights/monitoring
- Read-only oversight on marks/attendance/OD (per architecture.md Section 2 table)

---

## 3. Key decisions locked in (resolves ambiguity in architecture.md)

| Question | Decision |
|---|---|
| Marks entry method | **Manual** — teacher enters marks as usual (architecture.md's "Exam & Marks Module" as spec'd) |
| Paper Upload + OCR + NLP + Topic Mapping pipeline (architecture.md §8–11) | **In scope, full pipeline** — this is confirmed as required, not deferred |
| OD request flow | Text form + document upload; **AI pre-checks the document** (OCR-read + consistency check) before it reaches the teacher for approve/reject. AI annotation sits alongside human decision, never replaces it (per architecture.md §7 — `ai_status`/`ai_confidence` never auto-approve) |
| AI Engine "reality" for v1 | **Real LLM-based analysis from day one** (Claude API), not stubbed, not purely rule-based |
| Infra / stack | **One deployable app**, not the doc's multi-service topology — see §4 below for full reasoning. All module boundaries from architecture.md are preserved as internal code boundaries, just not separate processes |

---

## 4. Tech stack & infra (final)

Chosen to satisfy every functional requirement in `architecture.md` without operational overhead that adds no user-facing value at this project's scale. Every piece is a drop-in swap later if real scale demands it.

- **App:** Single Next.js (App Router) app — replaces the doc's separate student-portal/teacher-portal/admin-portal frontends + separate NestJS backend + gateway/BFF. Role-based route groups (`/student/*`, `/teacher/*`, `/admin/*`, public routes) + middleware role guards achieve the same isolation the doc wants from separate apps.
- **Database:** PostgreSQL via Prisma. Schema follows architecture.md §14 ER diagram in full (Users, Courses, CourseTopics [self-referencing tree], Enrollments, Timetable, TimetableUpdates, Assignments, Submissions, Attendance, ODRequests, Exams, Marks, Papers, PaperAnalysis, AIInsights, ClassInsights, TeachingInterventions, ImprovementMetrics, Notifications) plus `Note` (student notes-on-topic add-on) and `Job` (see below).
- **Async jobs (replaces Redis/BullMQ):** A DB-backed `Job` table (`status: QUEUED | PROCESSING | COMPLETE | FAILED`) + a worker loop. Same non-blocking behavior the doc requires (paper upload returns immediately, client polls/subscribes for completion) without standing up Redis infrastructure.
- **File storage (replaces S3 upfront):** Storage service behind a swappable interface — local disk for now, S3-compatible drop-in later. Papers and OD documents stored here, never as DB blobs.
- **AI Engine:** Claude API (Anthropic) end-to-end — OCR/document reading (vision-capable model), Q&A segmentation, correctness/missing-concept analysis, topic mapping (constrained to real `CourseTopic` rows per architecture.md §10's core rule — never free-associated), class-level aggregation, recommendations. Structured JSON outputs per analysis type, versioned prompts (not inline strings), provenance fields (`source_data_ref`, `confidence`, `created_at`, `human_review_status`) on every AI-written record per architecture.md §20/27.
- **Auth:** JWT access + refresh, role claim, bcrypt/argon2 — as spec'd in architecture.md §5.
- **Notifications:** in-app + email minimum for v1 (push/SMS optional later).

**Non-negotiable architectural rules carried over from architecture.md regardless of infra simplification:**
- AI recommendations are always advisory — final authority on marks, OD approval, and academic decisions stays human (§20, §27)
- No before/after improvement claim without a logged `TeachingIntervention` row (§13)
- Every AI-generated topic reference must resolve to a real `CourseTopics` row — never invented (§10)
- Class-level insight only computed after full-batch aggregation, not per-upload (§11)
- Timetable AI role is bounded to conflict-detection + read-only prep suggestions — never auto-applies schedule changes (§6)

---

## 5. Build Phases (status tracker — update as work progresses)

1. ✅ Foundation — full schema, auth + role routing, public pages
2. ⬜ Student + Teacher dashboard shells
3. ⬜ Courses + Course Topics (tree structure)
4. ⬜ Timetable + shift/conflict logic + student notification + notes-on-topic add-on
5. ⬜ Assignments + Attendance + Marks (manual entry)
6. ⬜ OD workflow — submit, document upload, AI pre-check, teacher review/approve
7. ⬜ Paper upload + OCR pipeline (extraction only)
8. ⬜ AI paper analysis (correctness, missing concepts, per-question)
9. ⬜ Topic mapping (question → CourseTopic)
10. ⬜ Individual student insights (weak/focus topics, tips)
11. ⬜ Class-level common-error aggregation
12. ⬜ Teacher teaching recommendations + intervention logging
13. ⬜ Improvement/before-after graphs
14. ⬜ Reports (student + teacher + admin) + Admin portal + final UI polish pass

*(Mark phases ⬜ → ✅ as completed, in whatever copy of this file travels with the project.)*

---

## 6. Design direction

Minimalist, deliberate, not-generic. When building UI: pin down a real token system (4–6 named colors, 2+ typefaces with clear roles, one signature element) before writing code — avoid the default "cream + terracotta," "near-black + acid accent," or "broadsheet hairline" looks unless a real reason grounds it in this subject. Consistent design system across all three portals + public site. Accessible (keyboard focus, responsive, reduced-motion respected) without announcing it.

---

## 7. Source documents this brief depends on

- `architecture.md` — full original system spec (32-section source spec, referenced throughout as "the doc"). Authoritative for anything not explicitly overridden in §3/§4 above.
- Original zip (`Education-Management-Portal.zip`) — old fragmented implementation, reference only, not being extended.
