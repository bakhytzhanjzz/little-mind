# Little Mind+

A two-minute daily mood check-in for children aged 8–14, with a private mood history for their parent. Built as an installable web app (PWA) for iPhone, Android and desktop.

**What's in it:** parent sign-up and login (with consent), child mood check-in with an optional written note, mood history visible only to the signed-in parent, a calm corner with three short exercises, and an optional AI-written weekly summary with conversation starters for the parent.

## How it works

1. A parent creates an account, adds their child and sets a 4-digit **parent PIN**.
2. On Home, the parent taps **Hand the phone to …**. The phone switches to **Child mode**.
3. The child picks a mood, can add what it's about (school, friends, …) and write a note, then is offered the calm corner: balloon breathing, 5-4-3-2-1 grounding, or squeeze-and-let-go.
4. Leaving Child mode needs the parent PIN, so the history stays with the parent. This is enforced on the server, not only in the UI.
5. On Home, **This week** writes a short summary of the last 7 days and three questions to start a conversation. It only runs when the parent taps the button.

### Notes and safety

The note screen tells the child plainly that their grown-up can read it. If a note mentions self-harm or not wanting to live (a keyword check in English, Russian and Kazakh, see `src/lib/safety.ts`), the child is gently told to tell a grown-up today, and the parent sees a card on Home with what to do. This is a safety net for free text, not a risk-detection system: it will miss things.

### AI weekly summary

With `GROQ_API_KEY` set, the summary is written by a language model on [Groq](https://console.groq.com) (default model `openai/gpt-oss-120b`, change with `GROQ_MODEL`). The child's name is never sent: the model writes "your child" and the app puts the name back. Moods, topics and notes (trimmed) from the last 7 days are sent. A summary is stored and reused until new check-ins arrive, so the free tier's limits are not a concern. Without a key, or if the call fails, a basic summary built from counts is shown instead.

**Try a demo with sample data** on the welcome screen opens a shared demo account (parent Dana, child Aru, PIN `1234`) with two weeks of check-ins.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no `DATABASE_URL` set, the app uses an embedded Postgres (PGlite) stored in `./.pglite`, so you don't need to install anything. Delete that folder to start fresh.

## Deploy (Vercel + Neon)

1. Push this folder to a GitHub repository.
2. In [Vercel](https://vercel.com/new), import the repository.
3. Add a Neon database: in the Vercel project open **Storage → Create Database → Neon**. This sets `DATABASE_URL` for you. Alternatively, create a project at [neon.tech](https://neon.tech) and paste its connection string as `DATABASE_URL`.
4. Add `SESSION_SECRET` under **Settings → Environment Variables**. Generate one with:
   ```bash
   openssl rand -base64 32
   ```
5. Optional, for AI summaries: create a free API key at [console.groq.com](https://console.groq.com/keys) and add it as `GROQ_API_KEY`.
6. Deploy. Tables (and new columns) are created automatically on the first request.

## Install on a phone

- **iPhone (Safari):** open the site, tap **Share**, then **Add to Home Screen**.
- **Android (Chrome):** open the site and tap **Install app**, either on the app's Home screen or in Chrome's menu.

It then opens full screen from its own icon, like a native app.

## Tech

| Part | Choice |
|---|---|
| App | Next.js 16 (App Router), React 19, TypeScript |
| Styling and motion | Tailwind CSS 4, Motion |
| Data | PostgreSQL via Drizzle ORM (Neon in production, PGlite locally) |
| Auth | bcrypt-hashed passwords and PIN, signed session in an httpOnly cookie (`jose`) |
| PWA | Web app manifest, icons, service worker (`public/sw.js`) |

### API

Plain REST, so a separate backend (for example FastAPI) could replace it without UI changes.

| Method and path | Who | Purpose |
|---|---|---|
| `POST /api/auth/signup` | anyone | Create a parent account (requires consent) |
| `POST /api/auth/login` · `POST /api/auth/logout` | anyone / parent | Session |
| `GET /api/me` | parent | Parent profile and children |
| `POST /api/children` | parent | Add a child |
| `PUT /api/pin` | parent | Set the parent PIN |
| `POST /api/child-mode` | parent | Start Child mode for a child |
| `GET /api/child-mode` | child mode | Who is checking in |
| `POST /api/child-mode/exit` | child mode | Leave Child mode with the PIN |
| `POST /api/moods` | child mode | Record a check-in (mood, topics, optional note) |
| `GET /api/moods?childId=&days=` | parent | Mood history for one of the parent's own children |
| `GET /api/summary?childId=` | parent | Stored weekly summary and whether it's out of date |
| `POST /api/summary` | parent | Write (or reuse) this week's summary |
| `POST /api/demo` | anyone | Reset and open the demo account |

### Project layout

```
src/
  app/            screens (welcome, login, signup, setup, home, history, child, calm) and api/
  components/     MoodFace (the morphing character), Calm exercises, PinPad, DayStrip, WeeklySummary, …
  lib/            db + schema, session, moods, safety, summary (Groq), blob geometry, date helpers
  proxy.ts        keeps people on the right screen for their session state
scripts/icons.mts regenerates the app icons from the same blob geometry (npm run icons)
```

## Not in this version

Automatic mood-risk alerts, an AI chat for children, exports, reminders, gamification and language switching.

Little Mind+ supports conversations about feelings. It is not a medical or diagnostic tool.
