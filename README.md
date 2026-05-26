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
# Optional. Defaults to data/database.json locally and /tmp/yatra-database.json on Vercel.
YATRA_DATABASE_PATH=
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

On Vercel, the deployed project filesystem is read-only. The app automatically seeds from `data/database.json` and writes runtime changes to `/tmp/yatra-database.json` so API routes can still run. Vercel's `/tmp` storage is ephemeral, so data can reset after cold starts or redeploys. For permanent hosted data, set `YATRA_DATABASE_PATH` only on a writable self-hosted server or move to a persistent store.

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

This setup is Vercel-compatible for demos and lightweight use, but hosted JSON writes are not durable on serverless infrastructure. Keep important production data in a persistent service if the app grows.
