# 🎓 NIVORA — High-Performance Student Operating System

Nivora is an all-in-one student productivity and academic operating system designed for modern learners. Built with Next.js 14, Tailwind CSS, Prisma, and PostgreSQL, Nivora integrates coursework planning, focus modes, verified merit dossiers, and an ambient study audio engine into a unified interface.

---

## 🚀 Features

- **📅 Dynamic Academic Planner**: Track lectures, assignments, exams, and personal deep work sessions with integrated countdown timers and priority tagging.
- **📚 Curriculum & Module Mastery**: Manage subjects, unit-by-unit syllabus progression, and safe attendance margins.
- **🎵 Built-in Focus Audio Engine**: Curated soundscapes across 7 categories (Focus, Lo-Fi, Ambient, Classical, Nature, Binaural Beats, and Campus Soundscapes) with streaming audio player support.
- **💼 Verified Career & Merit Dossier**: Showcase projects, technical skills, ATS resume scoring, and auditable system credentials.
- **⚡ Reboot & Focus Sessions**: Anti-doomscroll pacing, focus metrics, and cognitive recharge workflows.
- **🏆 Achievements & Badges**: Gamified study milestones and streak tracking.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18)
- **Database ORM**: [Prisma](https://www.prisma.io/) with PostgreSQL (Supabase pooler support)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Lucide Icons and custom design tokens
- **Animations**: GSAP & Canvas Confetti
- **Language**: TypeScript

---

## 📦 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/RISHABH-NEW/NIVORA.git
cd NIVORA
```

### 2. Install Dependencies
```bash
npm install
```
*(This automatically triggers `prisma generate` to configure your platform's Prisma Client engine)*

### 3. Setup Environment Variables
Create a `.env` file in the root directory modeled after `.env.example`:

```env
DATABASE_URL="postgresql://user:password@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/postgres"
JWT_SECRET="your-super-secret-jwt-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup & Seeding
```bash
# Push schema to database
npm run db:push

# Seed initial subjects, assignments, and test student profile
npm run db:seed
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎶 Music Library Seeding (Optional)

To seed or refresh open-access legal study music:
```bash
npm run music:seed
```
For more information, see [`docs/MUSIC_SETUP.md`](docs/MUSIC_SETUP.md).

---

## 📄 License

This project is licensed under the MIT License.
