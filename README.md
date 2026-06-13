# 🔐 Google OAuth 2.0 with Passport.js — Complete Notes

## ⚙️ Setup — Step by Step

### Step 1 — Initialize the project

```bash
mkdir google-auth-demo
cd google-auth-demo
npm init -y
```

### Step 2 — Install dependencies

```bash
npm install express passport passport-google-oauth20 dotenv morgan
```

| Package | What it does |
|---|---|
| `express` | Web framework — handles routes, requests, responses |
| `passport` | Authentication middleware — manages login strategies |
| `passport-google-oauth20` | The Google-specific OAuth 2.0 strategy for passport |
| `dotenv` | Loads `.env` file values into `process.env` |
| `morgan` | Logs HTTP requests in terminal (for debugging) |

### Step 3 — Enable ES Modules

In `package.json`, add:

```json
{
  "type": "module"
}
```

This lets you use `import/export` syntax (instead of `require`).

### Step 4 — Create your `.env` file

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
PORT=3000
```

### Step 5 — Get Google Credentials (most important step!)

```
HOW TO GET GOOGLE_CLIENT_ID AND GOOGLE_CLIENT_SECRET
═══════════════════════════════════════════════════

1. Go to → https://console.cloud.google.com/

2. Create a New Project
   ┌─────────────────────────────┐
   │ Click "Select a project"    │
   │ → "New Project"             │
   │ → Give it any name          │
   │ → Click "Create"            │
   └─────────────────────────────┘

3. Enable the Google+ API (or Google Identity)
   ┌──────────────────────────────────────────────┐
   │ Left menu → "APIs & Services"                │
   │ → "Enable APIs and Services"                 │
   │ → Search "Google+ API" or "Google People"    │
   │ → Click Enable                               │
   └──────────────────────────────────────────────┘

4. Configure OAuth Consent Screen
   ┌────────────────────────────────────────────────────┐
   │ "APIs & Services" → "OAuth consent screen"         │
   │ → Choose "External" (for testing with any Gmail)   │
   │ → Fill: App name, support email                    │
   │ → Add your Gmail under "Test users" (IMPORTANT!)   │
   │ → Save                                             │
   └────────────────────────────────────────────────────┘

5. Create Credentials
   ┌────────────────────────────────────────────────────┐
   │ "APIs & Services" → "Credentials"                  │
   │ → "+ Create Credentials" → "OAuth Client ID"       │
   │ → Application type: "Web application"              │
   │ → Authorized redirect URIs:                        │
   │     http://localhost:3000/auth/google/callback     │
   │ → Click Create                                     │
   └────────────────────────────────────────────────────┘

6. Copy the values
   → Client ID     → paste as GOOGLE_CLIENT_ID in .env
   → Client Secret → paste as GOOGLE_CLIENT_SECRET in .env
```

### Step 6 — Create `.gitignore`

```
node_modules/
.env
```

### Step 7 — Run the server

```bash
node server.js
```

Open: `http://localhost:3000`

---

## 🔄 How OAuth 2.0 Actually Works (The Full Flow)

```
USER'S BROWSER          YOUR SERVER           GOOGLE'S SERVERS
─────────────────────────────────────────────────────────────────

1. User visits /
   [Sees "Continue with Google" button]

2. User clicks button
   ──── GET /auth/google ────►
                              passport generates Google URL
                              with your clientID + scope
                              ◄── 302 Redirect ────────────

3. Browser goes to Google
   ─────────────────────────────────────── accounts.google.com ──►
                                           Google shows login page
                                           User logs in + approves
                                           ◄──────────────────────

4. Google redirects back with a CODE
   ◄── 302 Redirect to /auth/google/callback?code=XXXX ──────────

5. Your server receives the code
   ──── GET /auth/google/callback?code=XXXX ──►
        passport sees the code
        ─── POST /token (exchanges code) ──────────────────────►
                                          Google verifies code
                                          ◄── returns access_token ─
        passport uses access_token
        ─── GET /userinfo ─────────────────────────────────────►
                                          ◄── returns profile data ──

6. Your verify callback runs
   passport calls done(null, profile)
   req.user = profile

7. Your route handler runs
   ◄── res.send(successPage) ────────────────

8. User sees their profile ✅
```

---

## 🧱 Code Concepts — Line by Line

### `config()` from dotenv
```js
import { config } from "dotenv";
config(); // reads .env → sets process.env.GOOGLE_CLIENT_ID etc.
```
Must be the FIRST thing that runs. If you call it after, `process.env` values will be `undefined`.

---

  Install this packages for setup

npm i express passport passport-google-oauth20 express-session dotenv

### `passport.initialize()`
```js
app.use(passport.initialize());
```
This is middleware. It runs on EVERY request and sets up passport's internal context (attaches `req._passport` etc). Without it, passport can't work.

---

### `passport.use(new GoogleStrategy(...))`
```js
passport.use(new GoogleStrategy({ clientID, clientSecret, callbackURL }, verifyFn));
```
This registers the Google strategy. You only call this ONCE at startup. It tells passport: *"When someone tries to authenticate with Google, here's how to do it."*

The `verifyFn` is YOUR code that runs after Google confirms the user. You decide what to do with the profile (save to DB, create JWT, etc).

---

### `scope: ["profile", "email"]`
Scopes = permissions you're asking from Google.
- `profile` → name, photo, Google ID
- `email` → email address
- You can add `openid`, `https://www.googleapis.com/auth/calendar`, etc.

---

### `session: false`
```js
passport.authenticate("google", { session: false })
```
By default passport uses sessions (stores user in a cookie-based session). We set `false` because in modern apps we use JWTs (JSON Web Tokens) instead — stateless, works for mobile too.

If you want sessions, you'd add `express-session` middleware and `passport.serializeUser()` / `passport.deserializeUser()` functions.

---

### The two-middleware pattern on `/auth/google/callback`
```js
app.get("/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  (req, res) => { /* only runs if auth succeeded */ }
)
```
Two functions = two middleware. Express runs them in order:
1. `passport.authenticate(...)` — handles code exchange with Google. If success → calls `next()`. If fail → redirects.
2. Your handler — only reaches here if auth succeeded. `req.user` is ready.

---

## 📡 API Routes Reference

| Method | Route | Auth Required | Description |
|--------|-------|---------------|-------------|
| GET | `/` | No | Landing page with login button |
| GET | `/auth/google` | No | Starts OAuth flow (redirects to Google) |
| GET | `/auth/google/callback` | No (handled by passport) | Google redirects here after login |
| GET | `/api/status` | No | Server health check — returns JSON |
| GET | `/api/me` | Yes (demo) | Returns user data — 401 if not authed |

---

## 🏭 What Would a Production App Add?

```
After req.user is set in your callback, real apps typically:

1. Check DB: does this Google ID already exist?
   ┌─────────────────────────────────────────┐
   │ const user = await User.findOne({       │
   │   googleId: profile.id                  │
   │ })                                      │
   └─────────────────────────────────────────┘

2. If not → create new user in DB
   ┌─────────────────────────────────────────┐
   │ const newUser = await User.create({     │
   │   googleId: profile.id,                 │
   │   name: profile.displayName,            │
   │   email: profile.emails[0].value        │
   │ })                                      │
   └─────────────────────────────────────────┘

3. Generate a JWT token
   ┌─────────────────────────────────────────┐
   │ const token = jwt.sign(                 │
   │   { userId: user._id },                 │
   │   process.env.JWT_SECRET,               │
   │   { expiresIn: "7d" }                   │
   │ )                                       │
   └─────────────────────────────────────────┘

4. Send token to frontend (cookie or JSON)
   → Frontend stores it and sends with every API request
   → Your middleware validates it: Authorization: Bearer <token>
```

---

## ❓ Interview Questions You Should Know

**Q: What is OAuth 2.0?**
> A protocol that lets a user grant a third-party app limited access to their account on another service (like Google), without sharing their password. Your app never sees the user's Google password.

**Q: What is the difference between OAuth 2.0 and OpenID Connect?**
> OAuth 2.0 is for *authorization* (access to resources). OpenID Connect is built on top of OAuth 2.0 and adds *authentication* (verifying identity). When you get a user's profile from Google, you're using OpenID Connect.

**Q: What is an authorization code? Why not get the access token directly?**
> The code is a one-time, short-lived token exchanged server-to-server for the actual access token. This keeps the access token out of the browser URL bar and prevents interception.

**Q: What is `scope` in OAuth?**
> The list of permissions you're requesting from the user. The user explicitly approves what data you can access. Principle of least privilege — only request what you need.

**Q: Why `session: false`?**
> Sessions store user state on the server (or in cookies). Modern APIs prefer stateless auth using JWTs — each request carries the token, the server doesn't need to store anything.

**Q: What's the difference between `clientID` and `clientSecret`?**
> `clientID` is public — it identifies your app to Google. `clientSecret` is private — it proves to Google that the request is really from you. Never expose `clientSecret` in frontend code.

**Q: What happens if the user denies access on Google's consent screen?**
> Google redirects to `callbackURL` with an `error` query param. `passport.authenticate` catches this and triggers `failureRedirect`.

---

## 🔒 Security Checklist

- [ ] `.env` is in `.gitignore` — NEVER commit secrets
- [ ] `GOOGLE_CLIENT_SECRET` only lives on the server
- [ ] Callback URL matches exactly in Google Console
- [ ] Use HTTPS in production (Google requires it)
- [ ] Validate `state` parameter in production (CSRF protection — passport does this automatically)
- [ ] In production, use proper JWT middleware to protect routes

---

## 🚀 Quick Start Cheatsheet

```bash
# 1. Clone / create project
npm init -y
npm install express passport passport-google-oauth20 dotenv morgan

# 2. Add "type": "module" to package.json

# 3. Create .env with your Google credentials

# 4. Run
node server.js

# 5. Open
open http://localhost:3000
```
