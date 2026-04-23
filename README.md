
# 🚀 Job Portal (Full Stack)

A simple full-stack Job Portal where:

- Candidates can browse jobs and apply
- Employers can post jobs and view applicants

Built using modern technologies like Next.js, Node.js, PostgreSQL, and Prisma.

---

# 🧠 What this project does

## 👨‍💻 Candidate
- Register & login
- Browse job listings
- View job details
- Apply to jobs (with resume upload)
- View applied jobs

## 🧑‍💼 Employer
- Register with company details
- Login
- Create job postings
- View posted jobs
- View applicants for each job

---

# 🛠️ Tech Stack

## Frontend
- Next.js (App Router)
- React
- Tailwind CSS

## Backend
- Node.js
- Express
- TypeScript

## Database
- PostgreSQL
- Prisma ORM

## Authentication
- JWT (JSON Web Tokens)
- bcrypt (password hashing)

## File Upload
- Multer (for resume upload)

---

# 📁 Project Structure


Job-Portal/
│
├── frontend/ → Next.js app
├── backend/ → Express + Prisma API
└── README.md


---

# ⚙️ Setup Instructions (Step by Step)

## 1️⃣ Clone the project

```bash
git clone <your-repo-url>
cd Job-Portal
2️⃣ Backend Setup
cd backend
npm install
Create .env file

Copy from .env.example:


Setup database
npx prisma generate
npx prisma db push
Start backend
npm run dev

Backend runs at:

http://localhost:5000
3️⃣ Frontend Setup
cd ../frontend
npm install
npm run dev

Frontend runs at:

http://localhost:3000
🔑 Main API Endpoints
Auth
POST /api/auth/register
POST /api/auth/login
Jobs
GET /api/jobs
GET /api/jobs/:id
POST /api/jobs (Employer)
Applications
POST /api/jobs/:jobId/apply (Candidate)
GET /api/jobs/my-applications (Candidate)
GET /api/jobs/:jobId/applicants (Employer)
🔐 Authentication

After login, you receive a token.

Use it in requests:

Authorization: Bearer <token>
📄 Resume Upload
Supported: PDF, DOC, DOCX
Stored locally in:
backend/uploads/resumes
🧪 How to Test
Candidate Flow
Register as Candidate
Login
Browse jobs
Apply to job
View "My Applications"
Employer Flow
Register as Employer (with company)
Login
Create job
View "My Jobs"
View applicants
⚠️ Important Notes
Do NOT commit .env file
Uploaded resumes are stored locally (dev only)
Database must be running before backend
🚀 Deployment Plan (Simple)
Frontend
Deploy to Vercel
Backend
Deploy to Render / Railway
Database
Use Neon / Supabase Postgres
🔮 Future Improvements
Cloud storage for resumes (S3)
Better UI design
Pagination for jobs
Advanced search filters
Email notifications
👏 Author

Built as a full-stack project to demonstrate:

Backend architecture
API design
Authentication
Real-world workflows
💡 Tip for beginners

If something doesn’t work:

Check .env
Check database connection
Restart backend
Look at terminal errors
🎯 Status

✅ Phase 1 (MVP) Completed