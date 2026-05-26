# Contributing to CareFind

Thanks for taking the time to contribute.

## Getting started

1. Fork the repo and create your branch from `main`.
2. Install dependencies for both apps:
   - `cd frontend && npm install`
   - `cd server && npm install`
3. Create local env files from the examples:
   - `frontend/.env.example` -> `frontend/.env.local`
   - `server/.env.example` -> `server/.env`

## Development workflow

- Frontend: `npm run dev` (runs on http://localhost:3000)
- Backend: `npm run dev` (runs on http://localhost:5000)
- Tests: `npm run test` in [server/package.json](server/package.json)

## Code style

- Keep changes focused and minimal.
- Use existing lint rules (`npm run lint` in the frontend).
- Do not reformat unrelated files.

## Pull requests

- Describe the intent and test coverage in the PR body.
- Link relevant issues.
- Avoid committing secrets or real credentials.

## Reporting security issues

Please email security@carefind.example.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
