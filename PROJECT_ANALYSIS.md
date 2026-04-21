# Job Portal - Complete Project Analysis

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Frontend Application](#frontend-application)
4. [Backend Application](#backend-application)
5. [Database Design](#database-design)
6. [How the Application Works](#how-the-application-works)
7. [Key Features](#key-features)
8. [Technology Stack](#technology-stack)
9. [Getting Started](#getting-started)

---

## Project Overview

**Job Portal** is a web application that connects job seekers (Candidates) with employers. It is a full-stack application built with modern web technologies.

### What Does It Do?

- **For Candidates**: People looking for jobs can register, create profiles, search for job listings, and apply to jobs they are interested in.
- **For Employers**: Companies can register, post job openings, manage applications, and review candidate profiles.
- **For Admins**: Site administrators can manage users and content (future feature).

Think of it like **LinkedIn or Indeed** - a platform where employers post jobs and job seekers apply for them.

---

## Project Structure

```
Job-Portal/
├── backend/                 # Server-side code (Node.js + Express)
│   ├── src/
│   │   ├── app.ts          # Main app setup
│   │   ├── server.ts       # Server startup
│   │   ├── controllers/    # API request handlers
│   │   ├── lib/            # Helper functions (JWT, database)
│   │   ├── middleware/     # Request processing (auth, roles)
│   │   ├── modules/        # Features (auth, jobs)
│   │   └── routes/         # URL endpoints
│   ├── prisma/
│   │   └── schema.prisma   # Database structure
│   ├── package.json        # Dependencies list
│   └── tsconfig.json       # TypeScript configuration
│
└── frontend/               # Client-side code (React + Next.js)
    ├── app/
    │   ├── page.tsx        # Home page
    │   ├── login/          # Login page
    │   ├── register/       # Registration page
    │   ├── jobs/           # Jobs listing page
    │   └── other pages...  # More pages
    ├── components/         # Reusable UI parts
    ├── lib/                # Helper functions
    ├── package.json        # Dependencies list
    └── tsconfig.json       # TypeScript configuration
```

---

## Frontend Application

### What is the Frontend?

The frontend is the **user interface** - what users see and interact with in their web browser. It's built with **Next.js** (a React framework) and **TypeScript**.

### Pages in the Frontend

| Page | Purpose | Who Uses It |
|------|---------|-----------|
| **Home (/)** | Welcome page with navigation links | Everyone |
| **Register (/register)** | Create a new account (Candidate or Employer) | New users |
| **Login (/login)** | Sign in with email and password | Existing users |
| **Jobs (/jobs)** | See list of available jobs | Job seekers |
| **Job Detail (/jobs/[id])** | View full details of one job | Everyone |
| **Apply (/jobs/[id]/apply)** | Submit application for a job | Candidates |
| **My Jobs (/my-jobs)** | Employers view their posted jobs | Employers |
| **My Applications (/my-applications)** | Candidates see their job applications | Candidates |
| **Create Job (/create-job)** | Employers post a new job | Employers |
| **Job Applicants (/jobs/[id]/applicants)** | Employers see who applied | Employers |

### Frontend Technologies

| Tool | Purpose | Why Used |
|------|---------|----------|
| **Next.js 16** | React framework for building web pages | Fast, modern, easy to use |
| **React 19** | Library for creating interactive UIs | Makes building components simple |
| **TypeScript** | JavaScript with type checking | Catches errors before running code |
| **Tailwind CSS** | Styling tool | Quick and easy way to make things look good |
| **Node ^25** | JavaScript runtime | Runs JavaScript on development machine |

### Frontend Structure (lib and components)

```
frontend/
├── lib/
│   └── auth.ts            # Authentication logic (check if user is logged in)
├── components/
│   └── navbar.tsx         # Navigation bar (appears on all pages)
└── app/
    ├── globals.css        # Styles for entire app
    ├── layout.tsx         # Main page layout
    └── page.tsx           # Home page content
```

---

## Backend Application

### What is the Backend?

The backend is the **server** - it handles all the business logic, stores data, and processes requests from the frontend. It's built with **Express.js** (Node.js framework) and **TypeScript**.

### Backend Responsibilities

1. **Handle User Registration & Login**
   - Create new user accounts
   - Verify passwords
   - Generate login tokens (JWT - a secure way to stay logged in)

2. **Manage Job Postings**
   - Create new job listings (employers only)
   - Show available jobs
   - Update or delete jobs

3. **Handle Job Applications**
   - Accept job applications from candidates
   - Track application status
   - Manage cover letters and resumes

4. **Validate User Permissions**
   - Check if user is logged in
   - Check if user has permission to perform action
   - Prevent unauthorized access

### Backend Technologies

| Tool | Purpose | Why Used |
|------|---------|----------|
| **Express.js 5** | Web server framework | Simple, popular way to build APIs |
| **TypeScript 6** | JavaScript with type safety | Prevents coding errors |
| **Prisma 7** | Database tool (ORM) | Easy way to interact with database |
| **PostgreSQL** | Database | Reliable storage for all data |
| **bcrypt** | Password encryption | Hides passwords securely |
| **jsonwebtoken** | Login token creation | Safe way to stay logged in |
| **Zod** | Data validation | Ensures correct data format |
| **cors** | Cross-origin requests | Allows frontend to talk to backend |

### Backend Folder Structure

```
backend/src/
├── app.ts                   # Main Express app setup
├── server.ts               # Start the server
├── middleware/
│   ├── auth.middleware.ts  # Check if user is logged in
│   └── role.middleware.ts  # Check user type (candidate/employer)
├── lib/
│   ├── jwt.ts              # Token creation/verification
│   └── prisma.ts           # Database connection
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts   # Handle login/register requests
│   │   ├── auth.service.ts      # Login/register logic
│   │   └── auth.routes.ts       # Define auth endpoints
│   └── jobs/
│       ├── jobs.controller.ts   # Handle job requests
│       ├── jobs.service.ts      # Job logic
│       └── jobs.routes.ts       # Define job endpoints
└── routes/                 # Central route definitions
```

### API Endpoints (URLs Backend Responds To)

```
Authentication Routes:
POST   /api/auth/register      → Create new account
POST   /api/auth/login         → Sign in
GET    /api/auth/logout        → Sign out

Job Routes:
GET    /api/jobs               → Get all jobs
GET    /api/jobs/:id           → Get one job details
POST   /api/jobs               → Create new job (employer)
PUT    /api/jobs/:id           → Update job (employer)
DELETE /api/jobs/:id           → Delete job (employer)

Application Routes:
POST   /api/jobs/:id/apply     → Apply for a job (candidate)
GET    /api/jobs/:id/applicants → See applications (employer)

Protected Routes:
GET    /api/protected          → Test if logged in
GET    /api/employer-only      → Test employer access
```

---

## Database Design

### What is a Database?

A database is like a digital filing system where all information is stored - user accounts, job listings, applications, etc.

### How Data is Organized

The database uses **Prisma ORM** which organizes data into **tables** (also called **models**). Think of each table as an Excel spreadsheet with rows and columns.

### Database Tables Explained

#### 1. **User Table** - Stores user account information
```
Contains:
- id              : Unique identifier for each user
- name            : Person's name
- email           : Email address (unique - only one per email)
- password        : Encrypted password
- role            : Type of user (CANDIDATE, EMPLOYER, or ADMIN)
- createdAt       : When account was created
- companyId       : If employer, which company they work for
```

**Roles Explained:**
- **CANDIDATE**: Job seekers looking for work
- **EMPLOYER**: Companies posting jobs
- **ADMIN**: Site administrators (future feature)

---

#### 2. **CandidateProfile Table** - Extra info for job seekers
```
Contains:
- id              : Unique identifier
- userId          : Links to User
- headline        : Professional headline (e.g., "Python Developer")
- bio             : About yourself
- skills          : List of skills (e.g., "JavaScript, React, Node.js")
- resumeUrl       : Link to stored resume file
- resumeFileName  : Name of resume file
- resumeFileType  : File type (pdf, docx, etc.)
```

---

#### 3. **Company Table** - Stores employer company info
```
Contains:
- id              : Unique identifier
- name            : Company name
- description     : What company does
- location        : Where company is based
- website         : Company website URL
- createdAt       : When company profile created
```

---

#### 4. **Job Table** - Stores job listings
```
Contains:
- id              : Unique identifier for job
- jobCode         : Special code for this job (optional)
- title           : Job title (e.g., "Senior Developer")
- description     : Full job description
- location        : Where job is located
- jobType         : Type (Full-time, Part-time, Remote)
- salaryMin       : Minimum salary (optional)
- salaryMax       : Maximum salary (optional)
- status          : Job status (OPEN or CLOSED)
- createdAt       : When job was posted
- companyId       : Which company posted this job
- createdById     : Which user (employer) posted this
```

---

#### 5. **Application Table** - Stores job applications
```
Contains:
- id              : Unique identifier
- jobId           : Which job this application is for
- candidateId     : Which person applied
- coverLetter     : Optional cover letter text
- resumeUrl       : Link to attached resume
- resumeFileName  : Name of resume file
- resumeFileType  : File type (pdf, docx, etc.)
- status          : Application status (PENDING, REVIEWED, SHORTLISTED, REJECTED)
- appliedAt       : When person applied
```

---

### How Tables Connect (Relationships)

```
User ←→ Company
  ├─ User can work for ONE company (employer)
  └─ Company can have MANY users

User ←→ CandidateProfile
  ├─ User has ONE candidate profile (if candidate)
  └─ Profile belongs to ONE user

User ←→ Job (as creator)
  ├─ User can POST many jobs (if employer)
  └─ Job created by ONE user

Company ←→ Job
  ├─ Company has MANY jobs
  └─ Job belongs to ONE company

Job ←→ Application
  ├─ Job has MANY applications
  └─ Application for ONE job

User ←→ Application (as candidate)
  ├─ User can make MANY applications
  └─ Application from ONE user
```

---

## How the Application Works

### User Registration Flow

```
1. User visits /register
2. User selects role (Candidate or Employer)
3. User enters name, email, password
4. Frontend sends data to backend
5. Backend checks:
   - Email not already used
   - Password is strong
6. Backend creates User record in database
7. User can now login
```

### User Login Flow

```
1. User visits /login
2. User enters email and password
3. Frontend sends to backend
4. Backend checks:
   - Email exists in database
   - Password matches (after decryption)
5. Backend creates JWT token (security token)
6. Token sent to frontend
7. Frontend stores token (in browser storage)
8. User is now logged in
9. Subsequent requests include token to prove identity
```

### Employer Posts a Job

```
1. Employer (logged in) visits /create-job
2. Employer fills form:
   - Job title
   - Description
   - Location
   - Job type (full-time, etc.)
   - Salary range
3. Frontend validates and sends to backend
4. Backend validates again
5. Backend creates Job record in database
6. Job now appears on /jobs page for candidates
```

### Candidate Applies for Job

```
1. Candidate (logged in) views job on /jobs/[id]
2. Candidate clicks "Apply"
3. Candidate fills form:
   - Cover letter (optional)
   - Upload resume
4. Frontend sends to backend
5. Backend creates Application record
6. Backend prevents duplicate applications (one per candidate per job)
7. Application now visible to employer
8. Candidate sees application in /my-applications
```

### Employer Reviews Applications

```
1. Employer visits /jobs/[id]/applicants
2. Sees list of all applications for that job
3. Can view:
   - Candidate name and profile
   - Cover letter
   - Resume
   - Application status
4. Can change status:
   - PENDING → REVIEWED
   - REVIEWED → SHORTLISTED or REJECTED
```

---

## Key Features

### 1. **User Authentication**
   - Secure registration with password encryption
   - Login with JWT tokens
   - Password protection

### 2. **Role-Based Access Control**
   - Different features for candidates vs employers
   - Middleware checks permissions before allowing actions

### 3. **Job Management**
   - Employers can create, edit, delete jobs
   - Candidates can search and filter jobs
   - Job status tracking (OPEN/CLOSED)

### 4. **Application Tracking**
   - Candidates track their applications
   - Employers track applicants
   - Application status updates (PENDING → REVIEWED → SHORTLISTED/REJECTED)

### 5. **Resume Management**
   - Candidates upload resumes
   - Resumes stored and linked to applications
   - Employers can download resumes

### 6. **Data Validation**
   - Frontend validates user input (quick feedback)
   - Backend validates data (security)
   - Prevents invalid data in database

### 7. **CORS Support**
   - Frontend and backend can communicate across different domains
   - Secure cross-origin requests

---

## Technology Stack

### Frontend Stack
```
Framework:      Next.js 16.2.4 (React framework)
UI Library:     React 19.2.5 (Component library)
Language:       TypeScript 7 (Type-safe JavaScript)
Styling:        Tailwind CSS 4 (Utility-first CSS)
Type Checking:  @types packages for libraries
Runtime:        Node.js 25
Package Manager: npm
```

### Backend Stack
```
Runtime:        Node.js
Framework:      Express.js 5.2.1 (Web server)
Language:       TypeScript 7 (Type-safe JavaScript)
Database ORM:   Prisma 7.7.0 (Database interaction)
Database:       PostgreSQL (Data storage)
Authentication: jsonwebtoken 9.0.3 (JWT tokens)
Password:       bcrypt 6.0.0 (Password encryption)
Validation:     Zod 4.3.6 (Data validation)
CORS:           cors 2.8.6 (Cross-origin support)
Dev Tools:      tsx 4.21.0 (TypeScript runner)
```

### Version Summary
```
Frontend: Next.js 16 + React 19 + TypeScript 7
Backend:  Express 5 + Node.js + TypeScript 7
Database: PostgreSQL with Prisma ORM
```

---

## Getting Started

### Prerequisites
- **Node.js** version 25 or higher installed
- **npm** (comes with Node.js)
- **PostgreSQL** database installed and running

### Backend Setup

```bash
# 1. Navigate to backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file with database connection
# Add to .env:
# DATABASE_URL="postgresql://user:password@localhost:5432/job_portal"

# 4. Setup database
npx prisma migrate dev

# 5. Seed database (optional - add sample data)
npm run seed

# 6. Start development server
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# Open http://localhost:3000 in browser
```

### Building for Production

**Backend:**
```bash
cd backend
npm run build      # Compile TypeScript to JavaScript
npm start          # Run compiled code
```

**Frontend:**
```bash
cd frontend
npm run build      # Build optimized version
npm start          # Run production build
```

---

## Summary

**Job Portal** is a complete job marketplace application with:

- ✅ **User Registration & Authentication** - Secure login system
- ✅ **Job Posting** - Employers can list jobs
- ✅ **Job Search** - Candidates can find jobs
- ✅ **Applications** - Candidates apply, employers review
- ✅ **Resume Management** - Upload and share resumes
- ✅ **Role-Based Access** - Different views for candidates/employers
- ✅ **Modern Tech Stack** - Latest frameworks and tools

The application is fully functional, uses modern best practices, and is ready for further development and deployment.

---

## Next Steps for Enhancement

1. **Email Notifications** - Send emails on new applications
2. **Advanced Filtering** - Filter jobs by salary, skills, location
3. **User Profiles** - Complete employer and candidate profiles
4. **Messaging System** - Direct messaging between candidates and employers
5. **Analytics Dashboard** - Track applications and hiring metrics
6. **Payment Integration** - Charging for job postings
7. **Mobile App** - React Native version for phones
8. **Search Optimization** - Better search and recommendations
