# CareFind Frontend

The frontend is a Next.js 16 App Router application for authentication, symptom analysis, doctor discovery, and saved user data workflows.

## Tech stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Redux Toolkit
- UploadThing and Leaflet integrations

## Prerequisites

- Node.js 22+
- npm
- CareFind backend running locally or remotely

## Environment variables

Create `/home/runner/work/CareFindAi/CareFindAi/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
BACKEND_URL=http://localhost:5000
```

Notes:

- `NEXT_PUBLIC_API_URL` is used by the browser-side API client.
- `BACKEND_URL` is used by `next.config.ts` rewrites for `/api/v1/*` proxying.

## Install and run

```bash
cd /home/runner/work/CareFindAi/CareFindAi/frontend
npm install
npm run dev
```

App URL: `http://localhost:3000`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Project structure

```text
frontend/
|-- app/            # App Router pages and route groups
|-- authContext/    # Session/auth context provider
|-- components/     # Reusable UI and feature components
|-- lib/            # API client and helper utilities
|-- store/          # Redux store setup
`-- types/          # Shared TypeScript types
```

## Related docs

- Root repository docs: `/home/runner/work/CareFindAi/CareFindAi/README.md`
- Backend docs: `/home/runner/work/CareFindAi/CareFindAi/server/README.md`
