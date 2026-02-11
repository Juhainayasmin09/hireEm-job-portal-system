# HireEm – Job Portal

HireEm is a full-stack job portal platform designed to connect recruiters and job seekers through a clean, structured, and intelligent hiring experience. The system enables recruiters to post job listings and candidates to discover and apply for opportunities, with optional AI-assisted matching.

The platform focuses on real authentication, database-backed persistence, and production-grade interaction flows.

## Project Overview
HireEm allows users to:

- Register and log in securely

- Post and manage job listings (Recruiter role)

- Browse available jobs (Public access)

- Apply to job listings

- View application status

## Key Features
- Role-based authentication (Recruiter / Job Seeker)

- Job posting and management

- Public job listing feed

- Job detail page

- Apply functionality with persistent status

- Database-backed application tracking

- Theme-aware UI

## Tech Stack

### Frontend

- Next.js/ React

- Tailwind CSS

### Backend

- Node.js

- Express.js / API Routes

### Database

- PostgreSQL

### Authentication
- Session-based or JWT-based authentication

- Password hashing using bcrypt

### Optional AI Integration
- Resume parsing

- Job recommendation system

- Skill gap analysis

## Project Structure
```
scribra-ai-blog-platform/
hireem/
 │
 ├── app/                 # Core routes and pages
 ├── components/          # Reusable UI components
 ├── api/                 # Backend routes
 ├── database/            # Schema and models
 ├── lib/                 # Utilities
 └── public/              # Static assets

```

### Run Locally
Prerequisites: Node.js

1. Install dependencies: npm install
2. Set the GEMINI_API_KEY in .env.local to your Gemini API key
3. Run the app: npm run dev
