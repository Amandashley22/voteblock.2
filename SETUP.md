# VoteBlock — Local Setup Guide

A blockchain-inspired voting platform with an admin dashboard for managing polls, users, and viewing reports.

## Prerequisites

- **Node.js** v18 or higher
- **npm** (comes with Node.js)


```bash

cd voteblock
```

## 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=4000
JWT_SECRET=your_secret_here_must_be_at_least_32_characters_long
NODE_ENV=development
CORS_ORIGIN=*
```

> To generate a secure JWT secret, run:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

## 3. Seed the Admin User

```bash
npm run seed:admin
```

This creates an admin account:

| Field    | Value                 |
| -------- | --------------------- |
| Username | `admin`               |
| Email    | `admin@voteblock.com` |
| Password | `admin123!`           |

## 4. Start the Backend Server

```bash
npm run dev
```

The API will be available at `http://localhost:4000`.

## 5. Frontend Setup

Open a **new terminal window**:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:4000/api
```

## 6. Start the Frontend Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

## Using the App

### As a Regular User

1. Open the frontend URL in your browser
2. Click **Register** to create an account
3. Browse available polls and cast your vote

### As an Admin

1. Log in with `admin@voteblock.com` / `admin123!`
2. Click **Admin Dashboard** in the sidebar
3. From the dashboard you can:
   - **Dashboard** — View platform statistics (total users, polls, votes, charts)
   - **Polls** — Create new polls, close active polls, delete polls
   - **Users** — View all registered users, delete users
   - **Reports** — View voting activity, top polls, registration trends

## Available Scripts

### Backend (`backend/`)

| Command                | Description                    |
| ---------------------- | ------------------------------ |
| `npm run dev`          | Start server with hot-reload   |
| `npm run build`        | Compile TypeScript to `dist/`  |
| `npm start`            | Run compiled production build  |
| `npm test`             | Run tests                      |
| `npm run seed:admin`   | Create or update admin user    |

### Frontend (`frontend/`)

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start dev server             |
| `npm run build`   | Build for production         |

## Project Structure

```
voteblock/
├── backend/
│   └── src/
│       ├── index.ts              # Express server entry point
│       ├── seed-admin.ts         # Admin seeder script
│       ├── lib/
│       │   ├── chain.ts          # Blockchain vote ledger logic
│       │   ├── config.ts         # Environment config (Zod)
│       │   ├── db.ts             # SQLite database setup
│       │   └── validation.ts     # Request validation schemas
│       ├── middleware/
│       │   ├── auth.ts           # JWT auth + admin middleware
│       │   └── errorHandler.ts   # Centralized error handling
│       └── routes/
│           ├── admin.ts          # Admin dashboard endpoints
│           ├── auth.ts           # Login, register, profile
│           ├── polls.ts          # Poll CRUD (create is admin-only)
│           ├── verify.ts         # Chain verification & audit
│           └── votes.ts          # Vote casting
├── frontend/
│   └── src/
│       ├── App.tsx               # Routing setup
│       ├── types.ts              # TypeScript interfaces
│       ├── api/
│       │   └── client.ts         # Axios API client
│       ├── context/
│       │   └── AuthContext.tsx    # Auth state management
│       └── pages/
│           ├── Home.tsx          # Poll listing
│           ├── Login.tsx         # Login page
│           ├── Register.tsx      # Registration page
│           ├── CreatePoll.tsx    # Poll creation (admin)
│           ├── PollDetail.tsx    # Voting & results
│           ├── Profile.tsx       # User settings
│           └── admin/
│               ├── AdminDashboard.tsx  # Stats & charts
│               ├── AdminPolls.tsx      # Poll management
│               ├── AdminUsers.tsx      # User management
│               └── AdminReports.tsx    # Analytics
└── SETUP.md
```
