# CareFind

CareFind is a full-stack healthcare discovery application that helps users describe symptoms, receive an AI-assisted specialist recommendation, and move toward finding relevant doctors. The repository is split into a Next.js frontend and an Express API backed by MongoDB, Redis, and a retrieval-augmented AI pipeline.

## Project overview

CareFind focuses on:

- Capturing symptom descriptions and producing specialist recommendations.
- Matching users to doctors and specializations based on location and availability.
- Supporting secure authentication with OTP and OAuth flows.
- Grounding AI responses using a medical knowledge base and vector search.

## Features

- Email/password auth with OTP verification and password reset.
- Google OAuth sign-in and session management.
- AI-driven symptom analysis with urgency scoring.
- Doctor discovery, bookmarking, and saved locations.
- Admin tooling for doctor onboarding and specialization data.

## Tech stack

### Frontend

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4, shadcn-style UI components
- Next Themes, Framer Motion

### Backend

- Node.js 22+, Express 5 (ESM)
- MongoDB + Mongoose
- Redis for sessions and rate limiting
- Qdrant + Jina embeddings for retrieval

## Local setup

1. Install dependencies:
   - `cd frontend && npm install`
   - `cd server && npm install`
2. Create environment files:
   - `frontend/.env.example` -> `frontend/.env.local`
   - `server/.env.example` -> `server/.env`
3. Start the apps in two terminals:
   - Frontend: `npm run dev`
   - Backend: `npm run dev`

Optional Docker setup:

```bash
docker compose up --build
```

## Environment variables

See the sample files for the full list:

- `frontend/.env.example`
- `server/.env.example`

## Scripts

### Frontend

- `npm run dev` - start Next.js dev server
- `npm run build` - build production bundle
- `npm run start` - run production server
- `npm run lint` - run ESLint

### Backend

- `npm run dev` - start API server with nodemon
- `npm run test` - run Jest test suite
- `npm run rag:parse-medlineplus` - parse medical topic data
- `npm run rag:build-seeds` - build knowledge base seed data
- `npm run rag:upload-qdrant` - embed and upload to Qdrant
- `npm run rag:run` - query Qdrant directly
- `npm run seed:specializations` - seed specialization data
- `npm run seed:doctors` - seed doctor data

## Deployment

- Frontend uses Next.js standalone output (`output: "standalone"`).
- Backend expects `NODE_ENV=production` and a reachable MongoDB + Redis.
- `docker-compose.yml` provides a multi-container reference for local or containerized deployments.
- Remember to set `NEXT_PUBLIC_SITE_URL` and `BACKEND_URL` in production.

## Folder structure

```text
.
|-- frontend/              # Next.js application
|   |-- app/               # App Router pages and routes
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
|   |-- Rag/               # Knowledge base scripts
|   |-- routes/            # API route modules
|   `-- tests/             # Jest and Supertest tests
`-- docker-compose.yml     # Local multi-container setup
```

## Screenshots

- Landing page: `docs/screenshots/landing.png`
- Symptom analysis: `docs/screenshots/analysis.png`
- Doctor discovery: `docs/screenshots/discovery.png`

## Credits

- Medical topic data from MedlinePlus
- Vector search powered by Qdrant
- Embeddings from Jina AI

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
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
