# Job Portal — Senior Project Analysis (Full-Stack Audit)

This document is a code-grounded analysis of the current Job Portal workspace (frontend + backend + database). It focuses on architecture, patterns, correctness, security, maintainability, and a prioritized roadmap.

## Executive summary

### What’s strong

- Clear feature modularization on the backend (auth + jobs) with route → controller → service layering.
- Prisma schema is clean and appropriately indexed for common access patterns.
- Auth design uses access + refresh tokens, stored in HTTP-only cookies (good baseline for browser apps).
- Upload pipeline uses multer memory storage + Cloudinary, plus signed URLs for resume access.
- Centralized response/error helpers reduce repeated boilerplate.

### Main gaps (highest impact)

1. Backend/Frontend contract mismatches cause real UX breakage (logout, /auth/me shape, application list response parsing, job filters not applied).
2. Data leakage risk: applicants endpoint returns full User records for candidates (includes hashed password + refresh token fields).
3. Backend bootstrap duplication / middleware ordering: duplicated cookie parsing + duplicated auth route mounting; /api/protected cannot read cookie auth due to middleware order.
4. Production readiness: hardcoded localhost URLs, CORS origin, cookie flags (secure: false), and email provider set to Ethereal test accounts.

If you address only one theme: make API contracts consistent (response shapes + routes + DTOs) and lock down candidate data exposure.

## Workspace overview

- Backend: Express 5 + TypeScript + Prisma + PostgreSQL
  - Entry: [backend/src/server.ts](backend/src/server.ts), app wiring: [backend/src/app.ts](backend/src/app.ts)
- Frontend: Next.js App Router + React 19 + Tailwind
  - Root layout/provider: [frontend/app/layout.tsx](frontend/app/layout.tsx)
- Database schema: [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

## System architecture (how requests flow)

### Browser session model

- On login, backend sets cookies accessToken (15m) and refreshToken (7d) in [backend/src/modules/auth/auth.controller.ts](backend/src/modules/auth/auth.controller.ts).
- Frontend sends `credentials: "include"` on most requests.
- If a request returns 401, the frontend wrapper retries after calling `/api/auth/refresh` (see [frontend/lib/api.ts](frontend/lib/api.ts)).

### Backend layering & patterns

Routes → controllers → services

- Auth routes: [backend/src/modules/auth/auth.routes.ts](backend/src/modules/auth/auth.routes.ts)
- Jobs routes: [backend/src/modules/jobs/jobs.routes.ts](backend/src/modules/jobs/jobs.routes.ts)

Cross-cutting middleware

- Auth extraction (cookie-first, bearer fallback): [backend/src/middleware/auth.middleware.ts](backend/src/middleware/auth.middleware.ts)
- Role authorization: [backend/src/middleware/authorize.middleware.ts](backend/src/middleware/authorize.middleware.ts) and [backend/src/middleware/role.middleware.ts](backend/src/middleware/role.middleware.ts)
- Zod request validation: [backend/src/middleware/validate.middleware.ts](backend/src/middleware/validate.middleware.ts)
- Error handling: [backend/src/middleware/error.middleware.ts](backend/src/middleware/error.middleware.ts)
- Rate limiting (login): [backend/src/middleware/rateLimit.middleware.ts](backend/src/middleware/rateLimit.middleware.ts)

Response standardization

- Success responses via [backend/src/utils/ApiResponse.ts](backend/src/utils/ApiResponse.ts)
- Async error wrapper: [backend/src/utils/asyncHandler.ts](backend/src/utils/asyncHandler.ts)
- Typed-ish application errors: [backend/src/utils/AppError.ts](backend/src/utils/AppError.ts)

## Backend analysis

### Bootstrapping & middleware order

- App config: [backend/src/app.ts](backend/src/app.ts)
- Server start: [backend/src/server.ts](backend/src/server.ts)

What’s happening now

- cookieParser() is registered in both files.
- /api/auth routes are mounted in both files.
- Error middleware is mounted only in server.ts.
- /api/protected route is registered before any cookie parser middleware, so cookie-based auth won’t work there (only bearer auth).

Recommendation

- Keep all middleware and route mounting inside app.ts only.
- Keep server.ts for dotenv.config() + listen() only.

### Authentication module (register/login/refresh/verify/reset)

Key files

- Routes: [backend/src/modules/auth/auth.routes.ts](backend/src/modules/auth/auth.routes.ts)
- Controller: [backend/src/modules/auth/auth.controller.ts](backend/src/modules/auth/auth.controller.ts)
- Service: [backend/src/modules/auth/auth.service.ts](backend/src/modules/auth/auth.service.ts)
- JWT helpers: [backend/src/lib/jwt.ts](backend/src/lib/jwt.ts)
- Constants (cookie names + expiries): [backend/src/constants/index.ts](backend/src/constants/index.ts)

Implemented endpoints

- POST /api/auth/register
- POST /api/auth/login (rate-limited)
- POST /api/auth/forgot-password
- POST /api/auth/reset-password/:token
- POST /api/auth/verify-email/:token
- POST /api/auth/resend-verification
- POST /api/auth/refresh
- GET /api/auth/me (requires auth + role)

Not implemented (but frontend calls it)

- POST /api/auth/logout is called from [frontend/lib/auth.ts](frontend/lib/auth.ts) but has no route/controller in the backend.
  - There is a logoutUserService() in [backend/src/modules/auth/auth.service.ts](backend/src/modules/auth/auth.service.ts), but it is not wired.

Token & session behavior

- Refresh tokens are stored in the database (User.refreshToken) and verified against the incoming cookie. This is a solid pattern for revocation.
- refresh currently only sets a new access token cookie.

Contract mismatch: /auth/me

- Backend GET /api/auth/me returns req.user from JWT payload (typically { userId, role, iat, exp }).
- Frontend expects AuthUser (id/name/email/role/emailVerified) in [frontend/types/auth.ts](frontend/types/auth.ts) and uses user.name in multiple places (Navbar, Create Job).

Recommended fix: make /auth/me query the database and return a safe user DTO:

- id, name, email, role, emailVerified, companyId (and optionally company name)
- never return password, refreshToken, reset/verify tokens, etc.

### Jobs module (jobs + applications + resumes)

Key files

- Routes: [backend/src/modules/jobs/jobs.routes.ts](backend/src/modules/jobs/jobs.routes.ts)
- Controller: [backend/src/modules/jobs/jobs.controller.ts](backend/src/modules/jobs/jobs.controller.ts)
- Service: [backend/src/modules/jobs/jobs.service.ts](backend/src/modules/jobs/jobs.service.ts)
- Upload middleware: [backend/src/middleware/upload.middleware.ts](backend/src/middleware/upload.middleware.ts)
- Cloudinary helpers: [backend/src/utils/cloudinary.ts](backend/src/utils/cloudinary.ts)
- Admin cleanup endpoints: [backend/src/modules/jobs/file-cleanup.controller.ts](backend/src/modules/jobs/file-cleanup.controller.ts)

Implemented endpoints (high level)

- GET /api/jobs (paginated)
- GET /api/jobs/:id
- POST /api/jobs (EMPLOYER)
- GET /api/jobs/my-jobs (EMPLOYER)
- POST /api/jobs/:jobId/apply (CANDIDATE, multipart + resume)
- GET /api/jobs/my-applications (CANDIDATE)
- GET /api/jobs/:jobId/applicants (EMPLOYER)
- PATCH /api/jobs/:jobId/applications/:applicationId/status (EMPLOYER)
- GET /api/jobs/:jobId/applications/:applicationId/resume (EMPLOYER, signed URL)
- Admin storage:
  - GET /api/jobs/storage/stats (ADMIN)
  - GET /api/jobs/storage/orphans (ADMIN)
  - DELETE /api/jobs/storage/orphans (ADMIN)

Correctness gaps

1. Filtering logic exists but is not used
   - There is filtering logic in getAllJobsService() in [backend/src/modules/jobs/jobs.service.ts](backend/src/modules/jobs/jobs.service.ts)
   - But the actual handler getAllJobs in [backend/src/modules/jobs/jobs.controller.ts](backend/src/modules/jobs/jobs.controller.ts) bypasses it and returns all jobs without applying keyword/location/jobType/salary filters.

2. Inconsistent error semantics
   - Several service functions throw plain Error (job not found, unauthorized, duplicate apply). These typically become 500s instead of 4xx.
   - Prefer throwing AppError with clear status codes.

Security gap (P0)

- GET /api/jobs/:jobId/applicants includes candidate: true in Prisma include via [backend/src/modules/jobs/jobs.service.ts](backend/src/modules/jobs/jobs.service.ts).
- This likely returns sensitive fields from User (including hashed password and refresh token fields), which should never leave the server.

Recommendation: in applicants responses, return only a safe candidate projection:

- candidate: { id, name, email } and optionally candidateProfile fields you want the employer to see.

## Database design (Prisma)

Schema: [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

### Entities and relationships

- User
  - role: CANDIDATE | EMPLOYER | ADMIN
  - optional companyId relationship for employers
  - auth fields: email verification tokens, password reset tokens, refresh token
- Company
  - has many users + jobs
- Job
  - belongs to company
  - createdBy: user relation (PostedJobs)
  - has many applications
- Application
  - join entity between job and candidate user
  - unique constraint: (jobId, candidateId) prevents duplicate applications
  - stores resume metadata and resumePublicId
- CandidateProfile
  - one-to-one with User

### Indexes

Indexes are generally aligned with common queries:

- Jobs: createdById, companyId, status, createdAt, location, jobType, composite (status, createdAt)
- Applications: jobId, candidateId, status, appliedAt, composite (candidateId, appliedAt) and (jobId, appliedAt)
- Users: email unique, role, companyId, token lookup indexes

## Frontend analysis (Next.js App Router)

### High-level structure

- Root layout provides AuthProvider and global nav: [frontend/app/layout.tsx](frontend/app/layout.tsx)
- Auth state:
  - Provider: [frontend/components/AuthProvider.tsx](frontend/components/AuthProvider.tsx)
  - Route guard: [frontend/components/ProtectedRoute.tsx](frontend/components/ProtectedRoute.tsx)
- API access:
  - Auth helpers: [frontend/lib/auth.ts](frontend/lib/auth.ts)
  - Fetch wrapper with refresh-on-401: [frontend/lib/api.ts](frontend/lib/api.ts)

### Current pages & flows

- Public
  - Home: [frontend/app/page.tsx](frontend/app/page.tsx)
  - Job list + filters UI: [frontend/app/jobs/page.tsx](frontend/app/jobs/page.tsx)
  - Job details: [frontend/app/jobs/[id]/page.tsx](frontend/app/jobs/[id]/page.tsx)
  - Register: [frontend/app/register/page.tsx](frontend/app/register/page.tsx)
  - Login: [frontend/app/login/page.tsx](frontend/app/login/page.tsx)
  - Forgot/reset password: [frontend/app/forgot-password/page.tsx](frontend/app/forgot-password/page.tsx), [frontend/app/reset-password/[token]/page.tsx](frontend/app/reset-password/[token]/page.tsx)
  - Verify/resend email: [frontend/app/verify-email/[token]/page.tsx](frontend/app/verify-email/[token]/page.tsx), [frontend/app/resend-verification/page.tsx](frontend/app/resend-verification/page.tsx)

- Candidate
  - Apply to job: [frontend/app/jobs/[id]/apply/page.tsx](frontend/app/jobs/[id]/apply/page.tsx)
  - My applications: [frontend/app/my-applications/page.tsx](frontend/app/my-applications/page.tsx)

- Employer
  - Create job: [frontend/app/create-job/page.tsx](frontend/app/create-job/page.tsx)
  - My jobs: [frontend/app/my-jobs/page.tsx](frontend/app/my-jobs/page.tsx)
  - Applicants: [frontend/app/jobs/[id]/applicants/page.tsx](frontend/app/jobs/[id]/applicants/page.tsx)

### Strengths

- AuthProvider is a good direction: a single place to check session on app load.
- ProtectedRoute provides a simple RBAC gate for client routes.
- Central apiFetch() wrapper is a good place for standardized headers, cookie credentials, and refresh retry.

### Correctness / integration issues (most important)

1. Hardcoded API base URL
   - Both [frontend/lib/auth.ts](frontend/lib/auth.ts) and [frontend/lib/api.ts](frontend/lib/api.ts) hardcode http://localhost:5000/api.
   - This blocks deployment to any other environment.

2. Logout mismatch
   - Frontend calls POST /api/auth/logout in [frontend/lib/auth.ts](frontend/lib/auth.ts)
   - Backend does not expose that route.

3. Job filters UI not wired end-to-end
   - UI builds query params in [frontend/app/jobs/page.tsx](frontend/app/jobs/page.tsx) but the actual fetch() call ignores them and always hits /api/jobs without query params.
   - Backend currently does not apply keyword/location/jobType filters in the controller anyway.

4. My Applications response parsing bug
   - [frontend/app/my-applications/page.tsx](frontend/app/my-applications/page.tsx) reads data.applications, but backend returns data.data.applications via sendSuccess().

5. Auth “source of truth” is inconsistent
   - Home page uses localStorage.getItem("role"): [frontend/app/page.tsx](frontend/app/page.tsx)
   - But the current source login flow (AuthProvider) does not set that localStorage value.
   - Result: Home navigation can be wrong even when logged in.

6. /auth/me shape mismatch (critical for UX)
   - Frontend expects a full AuthUser and displays user.name (Navbar + Create Job)
   - Backend /auth/me returns a JWT payload, not a user record.

### Recommendation: standardize frontend API access

- Use apiFetch() everywhere (including job list, apply, applicants, register if desired).
- Move API base URL to NEXT_PUBLIC_API_URL.
- Align response parsing: always read result.data from backend sendSuccess().

## Security & privacy review

### Cookie auth & CSRF

You are using cookies for auth, which is fine, but note:

- Cookies automatically attach to requests → you should treat the app as potentially needing CSRF protections.
- Current cookies are httpOnly: true and sameSite: "lax" (good baseline).
- For production over HTTPS, set secure: true and consider sameSite strategy.

### Data exposure (P0)

- Applicants endpoint should not return full candidate user rows.

### Email system is test-only

- [backend/src/utils/email.ts](backend/src/utils/email.ts) uses nodemailer.createTestAccount() (Ethereal).
- Good for local testing, not for production.

### Password reset / verify tokens

- Tokens are stored directly in DB (not hashed). That’s acceptable for a demo, but for production consider hashing tokens at rest.

## Developer experience & ops

### Scripts

- Backend: [backend/package.json](backend/package.json)
  - npm run dev uses tsx watch
  - npm run seed seeds the database
- Frontend: [frontend/package.json](frontend/package.json)
  - npm run dev runs Next.js

### Environment configuration

Back end expects at least:

- DATABASE_URL
- JWT_SECRET
- Cloudinary env vars (as used in [backend/src/utils/cloudinary.ts](backend/src/utils/cloudinary.ts))
- optionally FRONTEND_URL (auth email links)

Front end should ideally use:

- NEXT_PUBLIC_API_URL

### Repo hygiene

- Build output folder frontend/.next exists in the workspace; it should stay untracked (it is ignored by the frontend gitignore).

## Prioritized roadmap

### P0 (fix immediately)

1. Add POST /api/auth/logout backend route/controller
   - Clears cookies and nulls DB refresh token (using logoutUserService).
2. Fix applicants data exposure
   - Return only safe candidate fields (select projection).
3. Fix /api/auth/me response shape
   - Return safe user DTO from DB (not token payload).
4. Fix frontend response parsing for my applications
   - Read result.data.applications.

### P1 (stability + product correctness)

1. Unify API base URL and request wrapper
   - Replace hardcoded localhost with env var.
2. Wire job filtering end-to-end
   - Frontend should pass query params.
   - Backend should apply filtering logic (either use existing service or move filters into controller).
3. Replace plain Error throws in services with AppError
   - Correct 400/401/404 handling.
4. Remove duplicate validation approach
   - Choose one: route-level Zod middleware or controller-level validateBody.

### P2 (production readiness)

1. CORS origin + cookie flags via env
2. Email provider swap (SendGrid/Mailgun/SES) + templates
3. Consider CSRF strategy if using cookies in production
4. Improve README formatting and align docs with reality (Cloudinary vs local uploads)

## Optional improvements (nice-to-have)

- Define explicit DTO types for API responses on both sides.
- Add e2e smoke tests for the critical flows (register → verify → login → apply → view applicants).
- Add pagination UI on job list and my pages.

If you want, I can implement the P0 fixes (logout endpoint + safe applicants projection + /me DTO + frontend parsing fixes) in code as a follow-up.