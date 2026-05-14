# CareFind

CareFind is a full-stack healthcare discovery application that helps users describe symptoms, receive an AI-assisted specialist recommendation, and move toward finding relevant doctors. The repository is split into a Next.js frontend and an Express API backed by MongoDB, Redis, and a retrieval-augmented AI pipeline.

## What the project does

- Authenticates users with email/password, OTP-based email verification, password reset, and Google OAuth.
- Maintains short-lived access tokens plus Redis-backed refresh sessions.
- Accepts symptom descriptions and runs an AI analysis flow to recommend a specialist and urgency level.
- Stores healthcare-related data such as doctors, specializations, bookmarks, saved locations, and doctor join requests.
- Uses a medical knowledge base and vector search to ground AI responses before the final recommendation is produced.

## Architecture

### Frontend

- Framework: Next.js 16 with the App Router
- Language: TypeScript
- UI: React 19, Tailwind CSS 4, shadcn-style UI components
- Main responsibilities:
  - Login and registration flows
  - Session restoration and token refresh
  - Symptom analysis screen
  - Calling the backend API through `NEXT_PUBLIC_API_URL`

### Backend

- Runtime: Node.js 22+
- Framework: Express 5
- Database: MongoDB with Mongoose
- Cache/session store: Redis
- Main responsibilities:
  - Authentication and session management
  - Doctor and specialization APIs
  - AI symptom analysis orchestration
  - Email delivery for verification and password reset
  - OAuth callback handling

### AI pipeline

The symptom analysis flow currently works in four stages:

1. Input validation checks that the request is well formed.
2. A gatekeeper model decides whether the prompt is health-related and cleans the query.
3. Relevant medical context is retrieved from Qdrant using Jina embeddings.
4. A main model generates a specialist recommendation, explanation, urgency, and warning message.

Because the AI modules are imported during backend startup, the AI-related environment variables are required for the server to boot in the current codebase.

## Repo documentation

- Root (full-stack): this document
- Frontend app: `./frontend/README.md`
- Backend API: `./server/README.md`

## Repository layout

```text
.
|-- frontend/              # Next.js application
|   |-- app/               # App Router pages
|   |-- authContext/       # Client auth/session state
|   |-- components/        # Forms and UI primitives
|   |-- lib/               # API client and auth helpers
|   `-- types/             # Shared frontend types
|-- server/                # Express API
|   |-- config/            # DB, Redis, mail, OAuth, env helpers
|   |-- controllers/       # Route handlers
|   |-- middleware/        # Auth, validation, security, email, sessions
|   |-- models/            # Mongoose models
|   |-- modules/ai/        # AI pipeline and retrieval logic
|   |-- Rag/               # Knowledge base parsing and upload scripts
|   |-- routes/            # API route modules
|   `-- tests/             # Jest and Supertest tests
`-- docker-compose.yml     # Local multi-container setup
```

## Key API areas

The backend is mounted at `http://localhost:5000/api/v1` by default.

- `/auth`
  - register, login, logout, refresh, me
  - verify email, resend verification, forgot password, reset password
  - Google OAuth start and callback
  - session listing and revocation
- `/ai`
  - health check
  - symptom analysis
- `/doctors`
  - CRUD endpoints
  - nearby doctor search
- `/specializations`
- `/bookmarks`
- `/saved-locations`
- `/symptom-searches`
- `/doctor-join-requests`

## Prerequisites

- Node.js 22 or newer
- npm
- MongoDB
- Redis
- Docker and Docker Compose, if you want to run the full stack in containers
- Third-party credentials for the enabled integrations:
  - OpenRouter
  - Qdrant
  - Jina AI embeddings
  - Gmail app password for transactional email
  - Google OAuth
  - Arcjet

## Environment variables

There are no committed `.env` files in the repository, so you need to create them locally.

### Frontend: `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Backend: `server/.env`

Use the following as a starting point:

```env
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:3000

MONGO_URI=mongodb://127.0.0.1:27017/carefind

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=

JWT_SECRET=replace-with-a-strong-secret
OTP_EXP_MIN=10
APP_NAME=CareFind

GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASS=your-gmail-app-password

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/v1/auth/google/callback

ARCJET_KEY=your-arcjet-key
ARCJET_ENV=development

OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_GATEKEEPER_MODEL=qwen/qwen3-4b:free
OPENROUTER_MAIN_MODEL=openrouter/free

QDRANT_URL=https://your-qdrant-instance
QDRANT_API_KEY=your-qdrant-api-key
QDRANT_COLLECTION=carefind_medical_kb
JINA_API_KEY=your-jina-api-key

HF_TOKEN=
```

### Backend: `server/.env.docker`

The Docker Compose file expects a separate Docker env file for the backend. A typical local version looks like this:

```env
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:3000

MONGO_URI=mongodb://mongo:27017/carefind

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=

JWT_SECRET=replace-with-a-strong-secret
OTP_EXP_MIN=10
APP_NAME=CareFind

GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASS=your-gmail-app-password

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/v1/auth/google/callback

ARCJET_KEY=your-arcjet-key
ARCJET_ENV=development

OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_GATEKEEPER_MODEL=qwen/qwen3-4b:free
OPENROUTER_MAIN_MODEL=openrouter/free

QDRANT_URL=https://your-qdrant-instance
QDRANT_API_KEY=your-qdrant-api-key
QDRANT_COLLECTION=carefind_medical_kb
JINA_API_KEY=your-jina-api-key

HF_TOKEN=
```

## Local development

Open two terminals.

### 1. Install dependencies

```bash
cd server
npm install

cd ../frontend
npm install
```

### 2. Start MongoDB and Redis

Run them locally or through Docker:

```bash
docker compose up mongo redis -d
```

### 3. Start the backend

```bash
cd server
npm run dev
```

The API will start on `http://localhost:5000`.

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

The web app will start on `http://localhost:3000`.

## Running with Docker Compose

Build and start the full stack:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`
- Redis: `redis://localhost:6379`

Before running this command, make sure `server/.env.docker` exists because it is referenced by `docker-compose.yml`.

## Available scripts

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run start
npm run lint
```

### Backend

```bash
cd server
npm run dev
npm test
npm run rag:parse-medlineplus
npm run rag:build-seeds
npm run rag:upload-qdrant
npm run rag:query-qdrant
```

## Testing

Backend tests use Jest, Supertest, and `mongodb-memory-server`.

```bash
cd server
npm test
```

The test command expects `server/.env.test` because the script sets `DOTENV_CONFIG_PATH=.env.test`.

## RAG data workflow

The repository includes scripts under `server/Rag/` for building and querying the medical knowledge base:

1. Parse MedlinePlus XML into JSON.
2. Build seed documents for the CareFind knowledge base.
3. Generate embeddings and upload them to Qdrant.
4. Query Qdrant during symptom analysis.

If you refresh or replace the knowledge base, rerun the parse, build, and upload scripts before using the AI analysis endpoint.

## Current entry points

- Frontend home: `frontend/app/page.tsx`
- Frontend analysis page: `frontend/app/analyze/page.tsx`
- Backend app wiring: `server/app.js`
- Backend startup: `server/index.js`

## Notes

- The frontend and backend are developed as separate apps inside one repository; there is no root `package.json`.
- The backend currently mounts all main API routes under `/api/v1`.
- Email verification, password reset, and Google OAuth all depend on valid external credentials.
- AI analysis depends on OpenRouter, Qdrant, and Jina configuration being present at startup.

## License

No license file is currently included in this repository.
