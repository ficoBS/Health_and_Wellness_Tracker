# Health and Wellness Tracker

A full-stack web application for recording daily wellness metrics, reviewing activity trends, building workouts, and communicating with human coaches or an AI wellness assistant.

The project uses a React frontend, an Express API, and PostgreSQL. Cloudinary stores uploaded files, and the AI coach calls Google's Gemini API through the OpenAI JavaScript SDK.

> **Project status:** Development application. The repository does not include a database schema, migrations, or seed files. A fresh checkout needs an externally supplied schema before database-backed features can work. Known implementation and access-control gaps are documented below.

## Features

- **Accounts and profiles:** Registration, login, logout, profile editing, password changes, and profile image uploads. Authentication uses a JWT in an HTTP-only cookie with a ten-day expiry; passwords are hashed with bcrypt.
- **Daily dashboard:** Record steps, water intake, calories consumed, calories burned, sleep, and weight. Progress indicators compare daily values with goals stored on the user record.
- **Analytics:** Weekly, monthly, and yearly summaries, navigation to previous periods, calorie charts, and sleep charts using Recharts.
- **Workouts:** Create and view personal workouts with a title, duration, description, and ordered exercises. Exercises use sets/repetitions or duration depending on their category.
- **Coach applications:** Submit a biography, professional title, experience, specializations, and supporting documents; view or cancel a pending application.
- **Coach administration:** An admin screen lists applications and coaches and provides approval, rejection, and coach-removal actions.
- **Messaging:** Find coaches, start conversations, and store messages in PostgreSQL. Messaging uses HTTP requests; there is no WebSocket or polling update mechanism.
- **AI coach:** Store AI conversations and request wellness responses. Only the current user message and a system prompt are sent to the model; stored history is not included in subsequent requests.
- **Responsive interface:** Shared navigation, page-specific CSS, and layouts for smaller and larger screens.

## Technology

| Area | Implementation |
| --- | --- |
| Frontend | React 19, React Router 7, Vite 8, Axios, Recharts 3 |
| Backend | Node.js with ES modules, Express 5 |
| Database | PostgreSQL through `pg`, with SQL queries in route handlers |
| Authentication | `jsonwebtoken`, `bcrypt`, `cookie-parser` |
| Uploads | Multer, `multer-storage-cloudinary`, Cloudinary |
| AI | Root-level `openai` dependency calling Gemini's OpenAI-compatible endpoint |
| Development checks | ESLint 10 and Vite production build |

Exact dependency versions are recorded in the three `package-lock.json` files.

## Repository structure

```text
Health_and_Wellness_Tracker/
├── package.json                 # OpenAI SDK dependency used by the backend
├── package-lock.json
├── backend/
│   ├── index.js                 # Express server, CORS, cookies, route registration
│   ├── package.json
│   ├── config/
│   │   ├── db.js                # PostgreSQL connection pool
│   │   ├── cloudinary.js        # Upload service configuration
│   │   └── deepseek.js          # Gemini client (historical filename)
│   ├── middleware/
│   │   ├── auth.js              # Cookie verification and user lookup
│   │   ├── upload.js            # Profile image uploads
│   │   └── coachUpload.js       # Coach application documents
│   └── routes/                 # auth, users, logs, workouts, coach, chats, ai, upload
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── eslint.config.js
    ├── index.html
    ├── public/                 # Public SVG assets
    └── src/
        ├── main.jsx            # React root and authentication provider
        ├── App.jsx             # Browser routes
        ├── index.css           # Shared styles and responsive layout
        ├── assets/             # Logos, icons, and images
        ├── components/         # Navigation, layouts, and route guards
        ├── context/            # Authentication state
        ├── hooks/              # useAuth
        └── pages/              # Account, dashboard, analytics, coach, chat, workout pages
```

## Local setup

### 1. Prerequisites

- Node.js and npm. Node **22.13+ within the 22.x line, or 24+**, satisfies the checked-in Vite and ESLint engine requirements. No Node version file is supplied.
- A running PostgreSQL server and the project's database schema. PostgreSQL's `psql`, `createdb`, and `pg_dump` tools are useful for setup and handoff.
- Cloudinary credentials for image and document uploads.
- A Gemini API key for AI responses. The AI client is constructed during backend startup, so `GEMINI_API_KEY` must be set even when initially testing other features.

### 2. Install dependencies

Run from the repository root:

```bash
npm ci
npm --prefix backend ci
npm --prefix frontend ci
```

All three installs are required. The backend imports `openai`, but that package is declared in the root `package.json`, not in `backend/package.json`. Keep the root and backend directories together when running the current project.

### 3. Configure the backend

Create `backend/.env` with your own local values:

```dotenv
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=health_and_wellness_tracker
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

JWT_SECRET=replace_with_a_long_random_secret

CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret

GEMINI_API_KEY=your_gemini_api_key
```

These are placeholders, not working credentials. `.env` files are ignored by Git. For example, generate a JWT secret locally with:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

`PORT` and `FRONTEND_URL` default to `5000` and `http://localhost:5173`. Database settings are passed to the PostgreSQL connection pool. Cloudinary credentials enable uploads. `NODE_ENV=production` adds the cookie's `Secure` flag, requiring HTTPS for authentication.

The frontend currently hardcodes `http://localhost:5000` in its API requests. There is no frontend environment variable or Vite proxy for changing the API address. Changing the backend port or deploying remotely also requires updating those frontend URLs.

Despite its name, `backend/config/deepseek.js` uses Gemini, not DeepSeek. The source configures `https://generativelanguage.googleapis.com/v1beta/openai/` and the model string `gemini-3.6-flash` in `backend/routes/ai.js`. Model availability has not been verified; the configured model must be accessible to your Gemini account.

### 4. Prepare PostgreSQL

**There is no SQL schema, migration runner, or seed script in this repository.** Request a schema-only export from the project owner. Creating an empty database alone is insufficient.

After receiving a plain SQL schema file, create and populate the schema using your configured database user:

```bash
createdb -h localhost -U your_postgres_user health_and_wellness_tracker
psql -h localhost -U your_postgres_user -d health_and_wellness_tracker -v ON_ERROR_STOP=1 -f /path/to/schema.sql
```

The following tables are referenced by the application. This is a source-derived overview, not an authoritative SQL schema or a specification of column types and constraints.

| Table | Purpose and key fields referenced in code |
| --- | --- |
| `users` | Identity, `password_hash`, `role`, contact details, profile image, weight/height, `goal_*` values, timestamps |
| `logs` | `user_id`, `log_date`, `steps`, `water_intake`, `cal_intake`, `cal_burned`, `sleep_time`, `weight` |
| `coach_applications` | Applicant `user_id`, biography, title, experience, specializations, status, submission/review timestamps |
| `coach_images` | Uploaded file URL in `image`, linked through `coach_application_id` |
| `coaches` | Professional profile linked to a user's `user_id` |
| `chats` | Conversation between `user_id` and `coach_id` |
| `messages` | `chat_id`, `sender_id`, `content`, `created_at` |
| `ai_chats` | AI conversation associated with `user_id` and a title |
| `ai_messages` | `ai_chat_id`, `content`, `role`, `created_at` |
| `workouts` | `user_id`, title, duration, description |
| `exercises` | Exercise name, category, type, equipment, description |
| `workout_exercises` | Links workouts and exercises, with sets, reps, duration, and `assigned_place` |

The code relies on database defaults that must be preserved in the supplied schema: generated IDs, initial user role and goals, daily log date and initial values, pending application status, and timestamps. The dashboard loads or creates today's log before metric updates. Date boundaries use PostgreSQL's `CURRENT_DATE`.

Water is recorded in milliliters and displayed in liters; sleep is recorded in minutes and displayed in hours/minutes. Workout creation and detail views label durations in minutes. Profile inputs use kilograms and centimeters.

Populate `exercises` with suitable non-personal reference data before creating workouts. There is no exercise-management UI or bundled catalog seed. The workout form treats `Conditioning`, `Cardio`, `Endurance`, and `Recovery` as duration-based categories; other categories use sets and repetitions.

User roles referenced in the source are `user`, `coach`, and `admin`. There is no administrator signup or bootstrap script. An existing trusted development account must be assigned the `admin` role through database administration to use the admin screen. Coach approval updates the user's role and creates their coach profile.

### 5. Start the application

In one terminal, from the repository root:

```bash
cd backend
node index.js
```

In a second terminal, from the repository root:

```bash
cd frontend
npm run dev -- --port 5173 --strictPort
```

Open [http://localhost:5173](http://localhost:5173). The API is mounted under `http://localhost:5000/api`.

Start the backend from `backend/` so dotenv reads `backend/.env`. There is no backend `start` or `dev` npm script. For automatic restarts during development, use `node --watch index.js` from that directory.

Use `localhost` consistently in both browser and API URLs. Authentication requests include cookies, and the backend allows the exact origin configured in `FRONTEND_URL`. The strict frontend port prevents Vite from silently choosing a different origin if port 5173 is busy.

## Using the application

1. Register at `/register`, then use `/dashboard` to enter today's wellness data.
2. Open `/analytics` to review weekly, monthly, or yearly totals and charts.
3. Open `/workouts`, choose **Add workout**, select catalog exercises, and save a routine. Open a saved workout to inspect its ordered exercises.
4. Use `/profile` to edit personal details, change your password or photo, or log out.
5. Use `/chats` to find a coach or open the **AI Coach** conversation at `/chat/ai`.
6. Eligible users see a coach-application link in their profile. The UI shows this for users with role `user` who are at least 18; the backend does not independently enforce that eligibility rule.
7. Administrators use `/adminDashboard` to review applications and manage coaches.

Profile uploads use the multipart field `image` and allow JPG, JPEG, and PNG. Coach applications use `documents`, with up to ten files of 10 MB each; configured formats include JPG, JPEG, PNG, WebP, and PDF. File URLs are stored in PostgreSQL and the files themselves are stored in Cloudinary. Application views currently render attachments as images, so PDF preview is incomplete.

## API overview

All paths below are relative to `/api`. Most protected routes read the JWT from the `token` cookie. Authentication alone does not imply that a route currently enforces ownership or administrator permissions; see the limitations below.

| Area | Endpoints |
| --- | --- |
| Authentication | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout` |
| Profile updates | `POST /auth/changeInfo`, `POST /auth/changeImage` |
| Profile upload | `POST /upload/profile_image` |
| Daily logs | `GET /logs/today`; `POST /logs/steps`, `/logs/water`, `/logs/calIntake`, `/logs/calBurned`, `/logs/sleep`, `/logs/weight` |
| Analytics | `GET /logs/stats?period=week&offset=0` (`week`, `month`, or `year`; negative offsets select earlier periods) |
| Users | `GET /users/:userId`, `GET /users/chats/:coachId` |
| Coach discovery | `GET /coach/getAll`, `GET /coach/get/:coachId` |
| Applications | `POST /coach/apply`, `POST /coach/cancelApply`, `GET /coach/apply/me`, `GET /coach/applications`, `GET /coach/application/:applicationId` |
| Coach administration | `POST /coach/hire`, `POST /coach/reject`, `POST /coach/fire` |
| Coach chats | `GET /chats/getAll`, `POST /chats/start`, `GET /chats/get/:chatId` |
| Coach messages | `GET /chats/messages/get/:chatId`, `POST /chats/messages/send` |
| AI history | `GET /chats/ai/getAll` (gets or creates a chat), `GET /chats/ai/messages/:chatId` |
| AI response | `POST /ai/coach` with `{ "message": "...", "aiChatId": 1 }` |
| Workouts | `GET /workouts/getAll`, `GET /workouts/exercises`, `POST /workouts/add`, `GET /workouts/:id` |

Daily metric POST requests set the stored value; the dashboard calculates accumulated totals before submitting. Workout creation inserts the workout and its exercises in a database transaction, and workout detail retrieval checks ownership.

## Build and checks

From the repository root:

```bash
npm --prefix frontend run build
npm --prefix frontend run lint
```

The build writes static assets to `frontend/dist/`. To inspect that build locally:

```bash
npm --prefix frontend run preview -- --port 5173 --strictPort
```

Stop the frontend development server first so the preview can use the configured origin. The Express API must run separately; it does not serve the frontend build. A deployed frontend also needs a fallback to `index.html` for React Router paths.

Validation during README preparation:

- Frontend production build **passed**, with a warning about a JavaScript chunk larger than 500 kB.
- Frontend lint **failed with 77 errors and 13 warnings**, including unused variables, React hook issues, and undefined references.
- No automated application test suite is configured. `backend/package.json` has a placeholder `test` command that exits with an error.
- Database-backed flows, Cloudinary uploads, and Gemini responses were not verified end to end.

## Known limitations and troubleshooting

- **Database setup is external:** Missing-table errors require the actual schema and its defaults. The repository cannot bootstrap the database by itself.
- **Access control is incomplete:** Coach hire/reject/fire routes authenticate users but do not check the admin role. Several profile, chat, message, and application operations accept client-supplied IDs without checking ownership. User lookup and application listing are unauthenticated, and profile image upload is also public. These are concrete gaps to address before exposing real user data or deploying publicly.
- **Login error handling:** The login catch block uses `es.status` instead of `res.status`, so a backend login exception does not produce the intended JSON response.
- **Coach route ordering:** `/users/coaches` is declared after `/users/:userId` and is intercepted as a user ID. The frontend uses `/coach/getAll` for coach discovery.
- **AI message display:** The send handler appends strings to state where rendering expects message objects. Newly sent AI exchanges may not display correctly until history is reloaded.
- **AI startup or response failures:** Ensure the root dependencies are installed and `GEMINI_API_KEY` is set. A valid key and an accessible configured model are needed for responses. No alternate model or provider fallback is implemented.
- **Goal editing:** Goals are read from user records, but there is no goal-editing API or UI.
- **Feature scope:** Workouts support creation and viewing, with no edit/delete or completed-session flow. Incoming chat messages require reloading or another fetch to appear. The dashboard's **Chat now** button has no navigation handler; use **Chats → AI Coach**.
- **CORS or login persistence:** Check the exact frontend origin, API URL, and cookie settings. Setting `NODE_ENV=production` while using plain local HTTP prevents the secure authentication cookie from working as intended.

## Sharing the project

Include source files, assets, this README, all three package manifests and lockfiles, and a schema-only SQL export. If example configuration is supplied, use placeholders without real secrets. An anonymized or synthetic exercise catalog can help another developer try workout creation.

To export the schema from an existing database, replace the connection values below:

```bash
pg_dump -h localhost -U your_postgres_user -d health_and_wellness_tracker --schema-only --no-owner --no-privileges --file=schema.sql
```

Review the export before sharing. Exclude `.env` files, API keys, database passwords, private uploads, real wellness records, account data, message history, `node_modules/`, `frontend/dist/`, `.git/`, logs, and old backups. A full data dump is not needed to explain the application structure.
