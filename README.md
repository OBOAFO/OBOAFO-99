# AI Scientific Calculator

A scientific calculator with two modes:

1. **Keypad** — standard scientific calculator (trig, log, powers, etc.) powered by [math.js](https://mathjs.org/), runs entirely in the browser.
2. **Scan / AI Solve** — upload/photograph a math problem, or type a question in plain words, and an AI model solves it step by step.

## Why it needs two parts

GitHub Pages only serves static files — it can't keep a secret API key safe.
So this project has two pieces:

- **Frontend** (`index.html`, `css/`, `js/`) — this is what you host on GitHub Pages.
- **Backend** (`api/solve.js`) — a tiny serverless function that holds your API key and talks to the AI. This gets deployed separately (Vercel's free tier works well and understands this exact `/api` folder structure automatically).

## Setup

1. Push this whole folder to a GitHub repo.
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, and import the repo.
   - Vercel will auto-detect `api/solve.js` as a serverless function.
3. In the Vercel project settings, add an environment variable:
   - `ANTHROPIC_API_KEY` = your key from [console.anthropic.com](https://console.anthropic.com/)
4. Deploy. Vercel gives you a URL like `https://your-project.vercel.app`.
5. In `js/script.js`, if you're hosting the frontend separately on GitHub Pages (rather than also on Vercel), update:
   ```js
   const SOLVE_ENDPOINT = "https://your-project.vercel.app/api/solve";
   ```
   If Vercel is hosting *both* the frontend and the `/api` function together, you can leave it as `/api/solve` and skip GitHub Pages entirely — Vercel will serve everything.

## Notes

- The keypad mode works with zero setup — pure client-side JS.
- The AI mode requires the backend to be deployed and the API key set, or it will show a connection error.
- You can swap `claude-sonnet-4-6` in `api/solve.js` for another Claude model, or swap the whole fetch call for a different provider (OpenAI, etc.) if you prefer.
