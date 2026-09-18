# Nivora

Nivora is a personalized student learning ecosystem designed to bring a student's academic journey, planning, focus, skills and growth into one connected experience.

---

## Features

- **Personalized Onboarding**: Tailored setup adapting to stream (CSE, BBA, MECH, LAW), academic goals, and study habits.
- **Student Dashboard**: Real-time academic tracking, streak calculation, priority tasks, and progress metrics.
- **Academic Planning**: Interactive planner and calendar for tracking lectures, assignments, exams, and deep work sessions.
- **Music / Focus System**: Ambient study soundscapes and binaural audio player spanning 7 categories (Focus, Lo-Fi, Ambient, Classical, Nature, Binaural Beats, Campus).
- **Skills and Projects**: Verified merit dossier, ATS resume alignment, proof-of-work showcasing, and project portfolios.
- **Student Productivity**: Anti-doomscroll monitoring, cognitive pacing, and reboot focus sessions.
- **Personalized Experience**: Dynamic curriculum tracking, attendance threshold monitoring, and customized study plans.
- **Authentication**: Secure JWT cookie sessions, bcrypt password hashing, password reset verification codes, and protected routes.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router) & React 18
- **Language**: TypeScript
- **Database & ORM**: Prisma ORM with Supabase PostgreSQL (Transaction & Session poolers)
- **Styling**: Tailwind CSS & Lucide React
- **Animations**: GSAP & Canvas Confetti

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <GITHUB_REPOSITORY_URL>
cd NIVORA
```

### 2. Install Dependencies

```bash
npm install
```
*(Dependencies will install and automatically trigger `npx prisma generate` via postinstall)*

### 3. Configure Environment Variables

Create your local environment configuration from `.env.example`:

```bash
cp .env.example .env.local
```

Configure your actual database connection strings and secrets in `.env.local` (see [Environment Variables](#environment-variables) below).

### 4. Database Setup

Push the Prisma schema to your PostgreSQL database:

```bash
npm run db:push
```

*(Optional: To populate initial development courses and subjects for local testing, run `npm run db:seed`)*

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

All sensitive values must be configured via local environment files (`.env` or `.env.local`). **Never commit secrets, tokens, passwords, or connection strings to source control.**

Refer to [`.env.example`](.env.example) for variable placeholders:

| Variable | Description | Required |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string (Transaction pooler, port 6543) | Yes |
| `DIRECT_URL` | Direct PostgreSQL connection string (Session pooler, port 5432) | Yes |
| `JWT_SECRET` | Secret key for signing session tokens (min 32 chars in production) | Yes |
| `NEXT_PUBLIC_APP_URL` | Base URL of the application (e.g., `http://localhost:3000`) | Optional |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (optional cloud audio storage) | Optional |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public API key | Optional |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for server-side storage operations) | Optional |
| `RESEND_API_KEY` | Resend API key for password reset email delivery | Optional |
| `EMAIL_FROM` | Verified sender email address | Optional |

---

## Available Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Generates Prisma Client and builds the production application.
- `npm run start`: Runs the production Next.js server.
- `npm run lint`: Runs ESLint checks.
- `npm run db:push`: Pushes Prisma schema changes to the database.
- `npm run db:seed`: Seeds local development mock data.
- `npm run music:seed`: Seeds local audio tracks into the database.
- `npm run music:update`: Updates audio metadata and audio hashes.

---

## License

This project is private and proprietary.
