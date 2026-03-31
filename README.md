# Ultra-Simple AI Expense Tracker

An MVP expense tracking app built with Next.js App Router, TypeScript, Prisma, SQLite, OpenAI, and SCSS modules. Users can add expenses in natural language like `Zomato 350`, `Spent 200 on food`, or `200 ka chai`, and the app turns them into structured records with summaries, charts, and simple insights.

## Features

- Natural language expense input on the homepage
- AI-powered parsing with a local fallback parser when `OPENAI_API_KEY` is missing or AI fails
- SQLite storage through Prisma ORM
- Dashboard with today's expenses, weekly totals, monthly totals, top category, trend chart, and category pie chart
- Logic-based insights for weekly and monthly spending patterns
- Mobile-responsive UI using SCSS modules

## Project Structure

- `app` for App Router pages and API routes
- `components` for UI building blocks
- `lib` for AI parsing, database access, validation, and summary logic
- `prisma` for SQLite schema
- `styles` for shared SASS variables

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
copy .env.example .env
```

3. Generate Prisma client and create the SQLite database:

```bash
npm run prisma:generate
npx prisma migrate dev --name init
```

4. Add your OpenAI API key in `.env` if you want live AI parsing:

```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

If the key is missing, the app uses a built-in parser that still supports simple English and Hinglish inputs.

5. Start the development server:

```bash
npm run dev
```

6. Open `http://localhost:3000`

## API Overview

- `POST /api/expenses` parses natural language and stores a new expense
- `GET /api/expenses` returns recent expenses
- `GET /api/expenses/summary` returns dashboard aggregates and insights

## Notes

- The Prisma `Expense.createdAt` field stores the parsed date from the input
- The AI prompt is implemented in `lib/ai.ts`
- Input validation uses Zod for safer API handling

## Future Improvements

- Voice input with the browser speech API
- Expense edit and delete actions
- WhatsApp and Telegram capture flows
- CSV export
- Dark mode
- Smart reminders
- Multi-language support
