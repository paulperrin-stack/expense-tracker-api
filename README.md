# Expense Tracker API

A personal finance tracking API built with TypeScript, Express, and PostgreSQL. Users can sign up, log in, and track income, expenses, and debts — with tagging, filtering, and a debt payoff calculator that compares two real repayment strategies.

**Live demo:** https://expense-tracker-api-ce9q.onrender.com
(hosted on Render's free tier — the first request after a period of inactivity may take up to a minute while the service wakes up)

**Example request:**
```bash
curl -X POST https://expense-tracker-api-ce9q.onrender.com/auth/signup
-H "Content-Type: application/json"
-d '{"email": "test@example.com", "password": "yourpassword"}'
```

## Tech Stack
- TypeScript, Node.js, Express
- PostgreSQL (Neon), Prisma ORM (with the `@prisma/adapter-pg` driver adapter)
- JWT authentication, bcrypt password hashing
- Zod input validation

## Features
- Signup and login with JWT authentication
- Full CRUD for Income, Expense, and Debt entries, scoped to the authenticated user
- Category and Tag system: tags belong to a category, entries can be tagged with multiple tags at once
- Tags can be attached to an entry at creation time, wrapped in a database transaction so the entry and its tags are created atomically — either both succeed, or neither does
- Filter entries by month and/or by tag
- Debt payoff calculator: simulates paying off multiple debts using either the **avalanche** method (highest interest rate first — mathematically minimizes total interest paid) or the **snowball** method (smallest balance first — prioritizes quick wins to sustain motivation), returning total months to debt-free and total interest paid for each

## Key Design Decisions
- **Amounts use PostgreSQL's `NUMERIC` type (via Prisma's `Decimal`), not floats** — floating-point numbers can't represent many decimals exactly, which is unacceptable for money.
- **`Tag` has no direct `userId`** — ownership is derived through `Tag → Category → User`, so there's only one source of truth for who owns a tag, avoiding the possibility of it disagreeing with its own category's owner.
- **Ownership checks combine the resource ID and the user ID in one query** (e.g. `updateMany({ where: { id, userId } })`), rather than fetching by ID and checking ownership afterward. If the IDs don't match, the query simply finds nothing — a user gets an identical 404 whether the resource doesn't exist or just isn't theirs, so no information about other users' data ever leaks.
- **`req.user` is added to Express's `Request` type via TypeScript declaration merging** (`src/types/express.d.ts`), so every route has compile-time-checked, autocompleted access to the authenticated user's ID after the auth middleware runs.
- **Creating an entry with tags is wrapped in `prisma.$transaction`** — the entry and its tag links are created as one atomic operation, so a failure partway through can't leave an entry without its intended tags.

## Setup
1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your own `DATABASE_URL` (PostgreSQL) and `JWT_SECRET`
4. `npx prisma migrate dev`
5. `npm run dev`

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/auth/signup` | Create a new account |
| POST | `/auth/login` | Log in, returns a JWT |
| POST | `/expenses` | Create an expense (optionally with `tagIds`) |
| GET | `/expenses` | List expenses (optional `?month=&year=&tagId=` filters) |
| PUT | `/expenses/:id` | Update an expense |
| DELETE | `/expenses/:id` | Delete an expense |
| POST / GET / PUT / DELETE | `/incomes` | Same pattern as Expense |
| POST / GET / PUT / DELETE | `/debts` | Same pattern as Expense, plus `balance`, `interestRate`, `minPayment` |
| GET | `/debts/payoff-plan?extra=&strategy=` | Returns months-to-payoff and total interest for `avalanche` or `snowball` |
| POST / GET / PUT / DELETE | `/categories` | Manage categories |
| POST / GET / PUT / DELETE | `/tags` | Manage tags (each tag belongs to a category) |

All routes except `/auth/*` require a `Authorization: Bearer <token>` header.

## Debt Payoff Feature, Explained

Given a user's debts and a fixed amount of extra money per month, the API simulates paying them off month by month under two different strategies:

- **Avalanche** sorts debts by interest rate, highest first, and puts all extra money toward that one debt until it's paid off, then moves to the next. This is mathematically optimal — it minimizes total interest paid.
- **Snowball** sorts debts by balance, smallest first, using the same "all extra money on one target" approach. It pays more interest overall, but clears individual debts faster, which can help sustain motivation to stick with a repayment plan.

Both strategies are calculated and exposed, rather than picking one as "correct" — the mathematically better option isn't always the one a real person will actually stick with, so the API presents both and lets the user decide.

## Future Improvements
- Update tags on an existing entry (currently only supported at creation)
- Single-resource `GET /:id` endpoints
- Automated tests for the payoff calculation logic