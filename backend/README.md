# VoteBlock Backend

## Overview

The backend provides a secure polling API with authentication, poll management, vote recording, and vote-chain verification. It uses Express, TypeScript, SQLite, and a blockchain-inspired vote ledger to help ensure vote integrity.

## Key Features

- User registration and login with JWT authentication
- Profile retrieval and updates
- Poll creation, editing, closing, and deletion
- Vote recording with one-vote-per-user enforcement
- Vote chain verification and export
- Validation with Zod and error handling for common database problems
- Rate limiting on all requests, with stricter limits for login/register

## Architecture

### Entry point
- `src/index.ts`
  - Starts Express server
  - Configures CORS and JSON parsing
  - Adds rate limit middleware
  - Mounts route modules
  - Uses centralized error handler

### API routes
- `src/routes/auth.ts`
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/profile`
  - `PUT /api/auth/profile`
  - `POST /api/auth/change-password`

- `src/routes/polls.ts`
  - `POST /api/polls`
  - `GET /api/polls`
  - `GET /api/polls/:id`
  - `PUT /api/polls/:id`
  - `PATCH /api/polls/:id/close`
  - `DELETE /api/polls/:id`

- `src/routes/votes.ts`
  - `POST /api/votes/:pollId`

- `src/routes/verify.ts`
  - `GET /api/verify/:pollId`
  - `GET /api/verify/:pollId/chain`
  - `GET /api/verify/:pollId/export`
  - `GET /api/verify/block/:hash`

### Validation
- `src/lib/validation.ts`
  - Request schemas with `zod`
  - Protects auth, poll creation/editing, and vote payloads

### Database and chain logic
- `src/lib/db.ts`
  - Creates SQLite tables for `users`, `polls`, and `vote_blocks`
  - Uses `better-sqlite3`

- `src/lib/chain.ts`
  - Creates vote blocks with hashed credentials and previous-block chaining
  - Verifies chain integrity
  - Computes vote tallies from blocks

### Middleware
- `src/middleware/auth.ts`
  - JWT authorization middleware

- `src/middleware/errorHandler.ts`
  - Centralized error formatting
  - Handles Zod validation errors and SQLite constraint errors
  - Converts duplicate vote errors into user-friendly messages

## Running Locally

### Requirements

- Node.js 20+ (or compatible with the `package.json` setup)
- npm

### Install dependencies

```bash
cd backend
npm install
```

### Environment variables

Create a `.env` file in `backend/` with at least:

```env
PORT=4000
JWT_SECRET=your-very-secure-secret-at-least-32-chars
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Start the server

```bash
npm run dev
```

The API will be available at `http://localhost:4000` by default.

### Build for production

```bash
npm run build
npm start
```

### Tests

```bash
npm test
```

## Notes

- Duplicate votes are prevented by a unique SQLite constraint on `vote_blocks.poll_id` and `vote_blocks.voter_id`.
- When a user attempts to vote again, the backend returns a clean message: `You have already voted in this poll`.
- The chain verification endpoints allow audit and integrity checks of poll votes.
