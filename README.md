# YĀTRA

YĀTRA is a premium travel web app focused on intentional journeys. It includes a modern black-and-gold landing page, secure signup/login with JWT cookie sessions, a protected dashboard, and a contact API endpoint.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Custom auth API (JWT + HTTP-only cookies)
- JSON file persistence for users and contact submissions
- ESLint + Prettier

## Project Structure

```text
app/
  api/
    auth/
      login/route.ts
      logout/route.ts
      session/route.ts
      signup/route.ts
    contact/route.ts
  dashboard/page.tsx
  login/page.tsx
  signup/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  auth-form-shell.tsx
  contact-form.tsx
  dashboard-logout-button.tsx
  features.tsx
  hero.tsx
  login-form.tsx
  navbar.tsx
  signup-form.tsx
lib/
  auth.ts
  storage.ts
  types.ts
data/
  users.json
  contacts.json
public/
```

## Environment Variables

Create a `.env` file using `.env.example`:

```bash
cp .env.example .env
```

Required variables:

- `JWT_SECRET`: long random string for signing auth tokens.

Example:

```env
JWT_SECRET=replace_with_a_long_random_secret
```

## Local Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Build for production:

```bash
npm run build
```

Start production server locally:

```bash
npm run start
```

Lint and format:

```bash
npm run lint
npm run format
```

## Git Commands

Initialize and push to GitHub:

```bash
git init
git add .
git commit -m "Initial YĀTRA app"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Deploy to Vercel

1. Push this project to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New > Project**.
3. Import your GitHub repository.
4. Vercel detects Next.js automatically.
5. Add environment variable in Vercel Project Settings:
   - `JWT_SECRET` = your production secret.
6. Click **Deploy**.

`vercel.json` is included with production-friendly build/install commands.

## Vercel Environment Variable Setup (Example)

In Vercel dashboard:

1. Open project > **Settings** > **Environment Variables**.
2. Add `JWT_SECRET` for:
   - Production
   - Preview
   - Development (optional)
3. Redeploy after saving variables.

## Custom Domain Setup

1. Open your Vercel project > **Settings** > **Domains**.
2. Add your custom domain (for example `app.yourdomain.com`).
3. Follow Vercel DNS instructions:
   - Add CNAME/A records at your domain registrar.
4. Wait for DNS propagation.
5. Set primary domain in Vercel after verification.

## API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `POST /api/contact`

## Notes

- User and contact data are stored locally in JSON files under `data/`.
- This setup is ideal for MVP/prototype workflows and simple deployments.
# YATRA
