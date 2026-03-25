# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Frontend (task-manager-frontend)
npm run dev        # Start Vite dev server on port 5173
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # Preview production build

# Backend (task-manager-backend) — run from that directory
npm run dev        # nodemon server.js (auto-reload)
npm start          # node server.js (production)
```

Both servers must run together. Frontend expects backend at `http://localhost:3000`.

## Architecture

### Frontend (`task-manager-frontend`)

**Stack:** React 19 + TypeScript + Vite 5 + Redux Toolkit + React Router v7 + Formik/Yup + Axios + Tailwind CSS v4

**Redux pattern** — follows a strict pattern (do not deviate):
- Store is set up with `combineReducers` + `setupStore()` in `src/store/index.ts`
- Slices live in `src/store/authSlice.ts` and `src/store/taskSlice.ts`
- **Slice reducers (sync only) are defined first, async thunks defined after** the slice
- Thunks use a local `type Thunk = ThunkAction<void, any, unknown, Action<string>>` — do NOT import `AppThunk` from the store (causes circular ESM dependency in Vite)
- All imports of type-only values must use `import type` (`verbatimModuleSyntax` is enabled)
- Typed hooks: `useAppDispatch` / `useAppSelector` from `src/store/hooks.ts` — never use raw `useDispatch`/`useSelector`
- Error typing: always `err as AxiosError<ApiError>`, never `err: any`

**Auth flow:** Token stored in `localStorage` under `token`; user object under `currentUser`. `src/services/api.ts` auto-injects `Bearer <token>` on every request. Initial Redux state rehydrates from `localStorage`.

**Task status flow:**
- Tasks are `pending` → `progress` → `completed`
- Status changes only happen via `TaskDetailModal` (clicking a task card) — not via direct badge cycling
- Completed tasks cannot be reopened (modal is blocked)
- Draft notes are kept in `taskSlice.draftNotes` (Redux, not component state) so text survives modal close/reopen without an API call
- On Cancel with text → status becomes `progress` (API call for status only, notes stay in Redux)
- On Save → status becomes `completed`, notes sent to API, draft cleared from Redux

**Routing:** `App.tsx` wraps protected pages in `<PrivateRoute>` which redirects to `/login` if unauthenticated. Routes: `/login`, `/register`, `/` (dashboard), `/profile`.

### Backend (`task-manager-backend`)

**Stack:** Express 5 + Mongoose + JWT (1h expiry) + bcryptjs + CORS

**Route mounting:**
- `app.use('/users', authRoutes)` → register, login, list users
- `app.use('/tasks', taskRoutes)` → full CRUD with owner-only guards

**Auth middleware** (`middleware/authMiddleware.js`): verifies JWT, attaches `req.user = { userId }` — used on all task routes and `GET /users`.

**Task model fields:** `title`, `description`, `notes` (saved on completion), `status` (`pending`|`progress`|`completed`), `owner` (ObjectId ref to User), timestamps.

**CORS** is locked to `http://localhost:5173`. If testing from a different origin, update `server.js`.

**No 404 on empty task list** — `GET /tasks/user/:uid` returns `[]` when no tasks found (not a 404).
