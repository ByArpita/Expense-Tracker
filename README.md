# AI Expense Tracker

A personal expense tracking app built with Next.js App Router, TypeScript, Prisma, SQLite, OpenAI, and SCSS modules. Users log in with a unique email address, add expenses in natural language like `Zomato 350`, `Spent 200 on food`, or `200 ka chai`, and get a private dashboard with summaries, charts, and lightweight insights.

## Features

- Email-based login so each user gets a separate private dashboard
- Natural language expense input with AI parsing and a local fallback parser
- SQLite storage through Prisma ORM
- Personal dashboard with today's expenses, weekly totals, monthly totals, top category, trend chart, and category pie chart
- Logic-based insights for weekly and monthly spending patterns
- Mobile-responsive UI using SCSS modules

## Tech Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- SQLite
- OpenAI API
- SCSS modules
- Zod
- Recharts

## Project Structure

- `app` for pages and API routes
- `components` for UI building blocks
- `lib` for parsing, session handling, database access, validation, and summary logic
- `prisma` for the SQLite schema
- `styles` for shared Sass variables

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
copy .env.example .env
```

3. Generate Prisma client and sync the local SQLite database:

```bash
npm run prisma:generate
npx prisma db push
```

4. Add your OpenAI API key in `.env` if you want live AI parsing:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

If the key is missing, the app still works with the built-in parser for simple English and Hinglish expense input.

5. Start the development server:

```bash
npm run dev
```

6. Open `http://localhost:3000`

## How It Works

- A user logs in with their email address
- The app stores a session cookie for that user
- All expense and summary API routes are scoped to the logged-in user
- Each user only sees their own expense records and dashboard data

## API Overview

- `POST /api/session` creates or resumes a user session from an email address
- `GET /api/session` returns the current logged-in user
- `DELETE /api/session` clears the current session
- `POST /api/expenses` parses natural language and stores a new expense for the logged-in user
- `GET /api/expenses` returns recent expenses for the logged-in user
- `GET /api/expenses/summary` returns private dashboard aggregates and insights for the logged-in user

## Notes

- `Expense.createdAt` stores the parsed date from the input
- The AI prompt and fallback parser live in `lib/ai.ts`
- Input validation uses Zod
- User identity is keyed by unique email address
- Existing expenses without a user are backfilled to a local legacy owner account

## Future Improvements

- Proper email verification or magic-link authentication
- Hosted database for true cross-device persistence outside local SQLite
- Expense edit and delete actions
- CSV export
- Voice input
- Smart reminders
- Multi-language support