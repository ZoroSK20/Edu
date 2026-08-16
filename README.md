# Veritas — Education Management Portal

Phase 1 of the rebuild: full schema, auth + role-based routing, public pages.
See `MASTER_PROMPT.md` (project root, one level up) for the full plan, all
locked decisions, and the phase tracker.

## Setup

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL, NEXTAUTH_SECRET, ANTHROPIC_API_KEY
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Visit `http://localhost:3000`. Seeded logins (password `password123`):

- `teacher@veritas.edu`
- `student@veritas.edu`
- `admin@veritas.edu`

## What's built (Phase 1)

- Full Prisma schema — every entity from `architecture.md` Section 14, plus
  `Note` (student notes-on-topic add-on) and `Job` (DB-backed async queue)
- Auth: NextAuth credentials provider, JWT session with role claim
- Role-based route guards (`/student/*`, `/teacher/*`, `/admin/*`) via middleware
- Public pages: Home, Courses, Course Details, Contact — all real Prisma
  queries, graceful empty states
- Design system: bone/ink/maroon tokens in `tailwind.config.ts`, shared
  `Button`/`Card`/`Badge` primitives in `src/components/ui/`
- Dashboard route stubs for all three roles (confirms auth + guard flow
  end-to-end; real content is Phase 2+)

## What's next

Phase 2 onward per `MASTER_PROMPT.md` — dashboard shells, courses/topics,
timetable + shift logic, assignments/attendance/marks, OD workflow, paper
upload + AI pipeline, insights, admin portal.
