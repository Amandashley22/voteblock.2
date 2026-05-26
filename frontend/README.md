# VoteBlock Frontend

## Overview

VoteBlock frontend is a React + TypeScript + Vite application for creating polls, signing in, and casting votes. It communicates with the backend API for authentication, poll management, voting, and verification.

## Architecture

### Entry point
- `src/main.tsx`
  - Bootstraps the React app
  - Wraps the application with `AuthProvider`

- `src/App.tsx`
  - Defines route structure using React Router
  - Uses protected routes for authenticated pages and public routes for login/register

### Authentication
- `src/context/AuthContext.tsx`
  - Maintains `user` and `isAuthenticated` state
  - Persists auth token and user info in `localStorage`
  - Exposes `login`, `register`, and `logout`

### API client
- `src/api/client.ts`
  - Axios client configured with JSON headers
  - Automatically attaches bearer token from `localStorage`
  - Clears auth state and redirects to `/login` on `401`

### Pages
- `src/pages/Login.tsx`
- `src/pages/Register.tsx`
- `src/pages/Home.tsx`
- `src/pages/CreatePoll.tsx`
- `src/pages/PollDetail.tsx`
- `src/pages/Profile.tsx`

### Styling
- Uses inline React style objects within page components
- Base styles are located in `src/index.css` and `src/App.css`

## Running Locally

### Requirements

- Node.js 20+ or a compatible Node version
- npm

### Install dependencies

```bash
cd frontend
npm install
```

### Start the development server

```bash
npm run dev
```

The app will usually be available at `http://localhost:5173`.

### Configure backend URL

The frontend uses `VITE_API_URL` to locate the backend API. If not set, it defaults to:

```bash
http://localhost:4000/api
```

Create a `.env` file in `frontend/` if needed:

```env
VITE_API_URL=http://localhost:4000/api
```

### Build for production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Notes

- The frontend depends on the backend API for authentication and vote flows.
- Protected routes enforce login before accessing home, poll creation, poll detail, and profile pages.
- When login or token validation fails, the app removes auth state and redirects to `/login`.
