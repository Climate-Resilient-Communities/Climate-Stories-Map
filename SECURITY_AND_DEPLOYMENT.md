# Security & Deployment Notes (Flask + React)

This project can run in two common ways:

1) **Single origin (recommended)**: Flask serves the built React UI from `backend/static/` **and** serves the API.
2) **Split origin**: React is hosted separately (Vercel/Netlify/etc.) and calls the Flask API over the network.

This document summarizes the environment variables and settings to use for both.

## Key concepts

- **CORS is only needed for cross-origin browser requests.** If your React UI is served by Flask (same host/port), the browser does not require CORS for `/api/*`.
- **Cookies are only needed if you use Flask sessions** (admin login). Public API endpoints do not require cookies.
- Any env var starting with `VITE_` is **public at build time** (bundled into client JS). Never store secrets in `VITE_*`.

## Backend (Flask) environment variables

Required for most deployments:

- `SECRET_KEY` — Flask session signing key (must be long and random)
- `MONGODB_URI` — Mongo connection string
- `CAPTCHA_SECRET_KEY` — hCaptcha secret key (server-side)
- `CAPTCHA_URL` — usually `https://hcaptcha.com/siteverify`
- `CDN_KEY`, `CDN_API` — if using ImgBB uploads

Security/ops knobs added by hardening:

- `FLASK_DEBUG` — `true` or `false`
- `ALLOWED_ORIGINS` — comma-separated allowlist for CORS (ex: `https://frontend.example.com,https://www.frontend.example.com`)
- `SESSION_COOKIE_SECURE` — `true` (HTTPS) / `false` (local dev HTTP)
- `SESSION_COOKIE_SAMESITE` — `Lax` (default), `Strict`, or `None`

Login rate-limit knobs (admin login):

- `LOGIN_MAX_ATTEMPTS` (default 10)
- `LOGIN_WINDOW_SECONDS` (default 900)
- `LOGIN_LOCK_SECONDS` (default 900)

### Generating a strong SECRET_KEY

Use Python:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Frontend (React/Vite) environment variables

- `VITE_POST_API_URL`
  - **Optional**.
  - If not set, the frontend uses `'/api/posts'` (same-origin default).
  - If you host the frontend separately, set it to your backend API base, e.g.:
    - `VITE_POST_API_URL=https://api.example.com/api/posts`

Other `VITE_*` variables (like Mapbox token) are public:

- `VITE_MAPBOX_ACCESS_TOKEN` — this is expected to be public.

## Deployment config A: Single origin (Flask serves React + API)

**When to use:** simplest and most secure. One service, one domain.

Backend env:

- `FLASK_DEBUG=false`
- `SECRET_KEY=...`
- `MONGODB_URI=...`
- `CAPTCHA_SECRET_KEY=...`
- `CAPTCHA_URL=https://hcaptcha.com/siteverify`
- (Optional) `SESSION_COOKIE_SECURE=true`
- (Optional) `SESSION_COOKIE_SAMESITE=Lax`
- Leave `ALLOWED_ORIGINS` **unset** (CORS is not needed)

Frontend env:

- Usually none required for API calls (same-origin default).

Notes:

- Because everything is same-origin, the browser will send/receive cookies normally for admin login.

## Deployment config B: Split origin (React separate from Flask API)

**When to use:** you host frontend and backend on different domains.

Backend env:

- `FLASK_DEBUG=false`
- `ALLOWED_ORIGINS=https://your-frontend.example.com`
- `SESSION_COOKIE_SECURE=true`
- `SESSION_COOKIE_SAMESITE=Lax`

Frontend env:

- `VITE_POST_API_URL=https://your-backend.example.com/api/posts`

Notes:

- If the React UI is not meant to use the cookie-protected admin session, you generally do **not** need cross-site cookies.
- If you *do* want session cookies to flow cross-site (not recommended unless needed):
  - You must use HTTPS
  - Set `SESSION_COOKIE_SAMESITE=None` and `SESSION_COOKIE_SECURE=true`
  - Configure Flask-CORS with `supports_credentials=True` and a **non-\*** origin allowlist
  - Configure Axios with `withCredentials: true`

## Local development

Two common approaches:

1) **Run React dev server + Flask API**
   - You may need CORS (or a Vite proxy) because origins differ.

2) **Avoid CORS using a Vite proxy (recommended for dev)**
   - Configure Vite to proxy `/api` to Flask.
   - Then the frontend can keep calling `'/api/posts'` and the browser thinks it’s same-origin.

If you want, add to `frontend/vite.config.ts`:

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

## Important security note about moderation endpoints

- The backend routes for updating/deleting posts should be protected.
- This repo hardens those endpoints to require an admin/moderator session.
