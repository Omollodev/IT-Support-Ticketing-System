# IT-Support-Ticketing-System

A lightweight MERN-stack ticketing system for logging and tracking IT issues (network, printer, hardware, security, other). Built for a short pilot in a small office/department that currently has no formal way to log IT problems.

## Stack

- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React (Vite)
- Auth: JWT for IT staff/admin accounts only. Staff reporting issues
  do not need an account.
- Security: helmet, CORS restriction, rate limiting on public and
  login endpoints, input validation and sanitization (express-validator,
  express-mongo-sanitize), bcrypt password hashing.

## Prerequisites

- Node.js 18+ and npm
- MongoDB running locally, or a free MongoDB Atlas cluster

## 1. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI (local or Atlas), and a long random JWT_SECRET
npm install
npm run seed:admin   # creates your first IT staff / admin login
npm run dev          # starts the API on http://localhost:5000
```

Generate a JWT_SECRET quickly with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 2. Frontend setup

```bash
cd frontend
cp .env.example .env
# Edit .env if your backend is not on localhost:5000
npm install
npm run dev           # starts the app on http://localhost:5173
```

## 3. Running the pilot

- Open `http://localhost:5173` on the machine hosting it, or find
  your machine's LAN IP (`ip a` on Linux) and share
  `http://<your-lan-ip>:5173` with a few staff on the same network
  so they can log real issues from their own desks.
- Log in at "IT Staff Area" with the account created by
  `npm run seed:admin` to view, filter, and update tickets.
- Let it run for a few days, then use the dashboard's stats (total
  tickets, tickets by status, tickets by category) as the raw data
  for your report's outcome/impact section.

## Notes for the report

- The `POST /api/tickets` endpoint is intentionally open (no login)
  so any staff member can report an issue with minimal friction,
  but it is rate-limited and input-validated to prevent abuse.
- All admin actions (viewing all tickets, changing status) require a
  valid JWT, obtained only via `/api/auth/login` with a seeded
  account, giving you a real, if small, example of role separation
  to discuss under your DevSecOps training relevance.
