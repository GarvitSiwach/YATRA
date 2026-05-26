# YĀTRA

YĀTRA is a Next.js 14 travel platform that runs without an external database. App data is stored in a small local JSON file, which is enough for lightweight personal/demo use.

## Stack

- Next.js 14 + TypeScript
- Tailwind CSS
- Local JSON storage in `data/database.json`
- Cookie-based local auth through API routes

## Environment

Create `.env.local` in the project root:

```env
YATRA_SESSION_SECRET=replace-with-a-long-random-string
```

This secret signs local session cookies. If it is missing, the app uses a development fallback.

## Data Storage

All runtime data lives in `data/database.json`:

- `users`
- `trips`
- `likes`
- `follows`
- `comments`
- `notifications`
- `messages`

The storage helpers are in `lib/storage.ts`. Signup writes new users to the JSON file, and trips/social actions update the same file.

## Local Run

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Manual Checks

1. Signup with `/signup`.
2. Login with `/login`.
3. Confirm protected route access for `/dashboard`, `/trips`, `/profile`, and `/notifications`.
4. Create/edit trips and check `data/database.json`.
5. Logout and verify protected pages redirect to `/login`.

## Deployment Note

JSON file writes are best for local or small self-hosted deployments with a writable filesystem. Serverless platforms can reset or block runtime file writes, so use a persistent database if the app grows beyond small local data.
