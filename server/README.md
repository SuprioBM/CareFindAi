# CareFind Backend

The backend is an Express 5 API that handles authentication, doctor/specialization data, AI-assisted symptom analysis, and supporting user data flows.

## Tech stack

- Node.js 22+
- Express 5 (ESM)
- MongoDB + Mongoose
- Redis (session/refresh token storage)
- Zod validation

## Prerequisites

- Node.js 22+
- npm
- MongoDB
- Redis

## Environment setup

Create `server/.env`:

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

GROQ_API_KEY=your-groq-key
GROQ_MAIN_MODEL=llama-3.1-8b-instant
GROQ_TRANSLATE_MODEL=llama-3.1-8b-instant

QDRANT_URL=https://your-qdrant-instance
QDRANT_API_KEY=your-qdrant-api-key
QDRANT_COLLECTION=carefind_medical_kb
JINA_API_KEY=your-jina-api-key
```

For tests, the `npm test` script reads `.env.test` via `DOTENV_CONFIG_PATH=.env.test`.

## Install and run

```bash
cd server
npm install
npm run dev
```

API URL: `http://localhost:5000`

## Scripts

```bash
npm run dev
npm test
npm run rag:parse-medlineplus
npm run rag:build-seeds
npm run rag:upload-qdrant
npm run rag:run
npm run seed:specializations
npm run seed:doctors
```

## API route prefixes

All routes are mounted under `/api/v1`.

- `/auth`
- `/specializations`
- `/doctors`
- `/symptom-searches`
- `/bookmarks`
- `/saved-locations`
- `/doctor-join-requests`
- `/ai`
- `/analytics`
- `/triage`

## Related docs

- Root repository docs: `README.md`
- Frontend docs: `frontend/README.md`
