# Copilot Instructions for AI Learning Platform

## Project Overview
This is a MERN app for AI-assisted learning from PDF documents. The backend ingests PDFs, extracts text, and generates study assets such as flashcards and quizzes. The repository is split into [client/](client/) and [server/](server/) with HTTP as the only boundary between them.

## Start Here
Use the package scripts in the relevant app folder:

```bash
# server/
npm run dev
npm start

# client/
npm run dev
npm run build
npm run lint
```

Required environment variables include `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `COOKIE_EXPIRE`, `CLIENT_URL`, `PORT`, `NODE_ENV`, `MAX_FILE_SIZE`, and `GOOGLE_GENAI_API_KEY`.

## Architecture
- Backend entry point: [server/server.js](server/server.js)
- Backend features live under [server/feature/](server/feature/), not `server/controllers/` or `server/routes/`
- Frontend routes and auth live under [client/src/features/auth/](client/src/features/auth/)
- Styling is Tailwind v4 through [client/src/index.css](client/src/index.css)

The backend mounts these API groups in [server/server.js](server/server.js): `/api/auth`, `/api/documents`, `/api/flashcards`, and `/api/ai`.

## Backend Conventions
- Wrap async controllers with [server/middleware/asyncHandler.js](server/middleware/asyncHandler.js)
- Return consistent API errors through [server/middleware/error.js](server/middleware/error.js)
- Use JWT cookies for auth via [server/utils/generateToken.js](server/utils/generateToken.js) and verify them in [server/middleware/authMiddleware.js](server/middleware/authMiddleware.js)
- Passwords are selected only when needed with `.select("+password")`
- File uploads use [server/config/multer.js](server/config/multer.js), accept PDF only, and write to `server/public/uploads/documents/`
- PDF text chunking happens in [server/utils/textChunker.js](server/utils/textChunker.js); empty input should return `[]`

## Client Conventions
- Route definitions start in [client/src/App.jsx](client/src/App.jsx)
- Auth route objects live in [client/src/features/auth/Auth.Routes.jsx](client/src/features/auth/Auth.Routes.jsx)
- Auth state is managed in [client/src/features/auth/AuthContext.jsx](client/src/features/auth/AuthContext.jsx)
- Use credentials when calling the API from the browser so cookie auth works

## High-Value Files
- [server/feature/auth/auth.controller.js](server/feature/auth/auth.controller.js)
- [server/feature/auth/auth.route.js](server/feature/auth/auth.route.js)
- [server/feature/documents/document.routes.js](server/feature/documents/document.routes.js)
- [server/feature/documents/document.controller.js](server/feature/documents/document.controller.js)
- [server/feature/user/user.model.js](server/feature/user/user.model.js)
- [client/src/features/auth/Login.jsx](client/src/features/auth/Login.jsx)
- [client/src/features/auth/SignUp.jsx](client/src/features/auth/SignUp.jsx)

## Common Pitfalls
- Be careful with filename casing in imports. The repo currently mixes cases in a few auth imports, which can work on Windows but fail on case-sensitive systems.
- The frontend auth context currently keeps token and user data in localStorage, while the backend auth flow uses HttpOnly cookies. Do not assume those two mechanisms are already aligned.
- The backend CORS setup must allow the configured `CLIENT_URL` and set credentials for cookie auth.
- The client app still has partially stubbed protected routes, so check the current route tree before adding new navigation or guards.
- If you upload a file, the form field name must match the backend multer setup: `document`.

## When Extending The App
- Add new backend endpoints in the relevant `server/feature/<area>/` folder and keep them wrapped with async error handling.
- Add new client screens under `client/src/features/` and wire them through [client/src/App.jsx](client/src/App.jsx).
- Prefer linking to existing docs and code instead of repeating project background here.
- Keep changes focused on the feature area you are touching; do not rework unrelated auth, upload, or routing code unless the task requires it.

