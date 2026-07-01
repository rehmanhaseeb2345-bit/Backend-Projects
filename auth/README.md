# Auth API

A production-style authentication backend built with **Node.js**, **Express 5**, and **MongoDB**. It implements JWT access tokens, rotating refresh tokens backed by server-side sessions, and email verification via one-time codes (OTP).

---

## Features

- **Register / Login** with hashed passwords (bcrypt).
- **Short-lived access tokens** (JWT) + **long-lived refresh tokens** stored as `httpOnly` cookies.
- **Server-side sessions** — every refresh token has a matching `Session` document, so tokens can be revoked.
- **Refresh-token rotation** — each refresh revokes the used session and issues a new one.
- **Logout** (single session) and **logout-all** (every session for the user).
- **Email verification (OTP)** — 6-digit codes, hashed at rest, with expiry, max-attempts, resend cooldown, and rate limiting.
- **Centralized validation & error handling** — zod schemas, an async wrapper, and one error handler for the whole app.

---

## Tech Stack

| Concern | Library |
|---|---|
| Web framework | express (v5) |
| Database | mongoose (MongoDB) |
| Auth tokens | jsonwebtoken |
| Password / token hashing | bcrypt |
| Email delivery | resend |
| Input validation | zod |
| Rate limiting | express-rate-limit |
| Cookies / logging / config | cookie-parser, morgan, dotenv, ms |

---

## Project Structure

```
src/
├── app.js                      # Express app: middleware, routes, error handling
├── config/
│   ├── env.js                  # Loads + validates env vars, derives token TTLs
│   └── otp.js                  # OTP tuning (TTL, max attempts, cooldown, bcrypt rounds)
├── controllers/
│   └── authentication.js       # register, login, getUser, refresh, logout(s), OTP handlers
├── db/
│   └── config.js               # MongoDB connection
├── errors/
│   ├── errorHandler.js         # Central error handler (maps errors → HTTP status)
│   └── notFound.js             # 404 handler
├── middleware/
│   ├── asyncHandler.js         # Wraps async handlers, forwards errors
│   ├── requireAuth.js          # Verifies access token, attaches req.user
│   ├── requireverified.js      # Gates routes behind a verified email
│   ├── rateLimiter.js          # OTP request rate limiter
│   └── validate.js             # Generic zod validator + register/login checks
├── models/
│   ├── user.model.js           # User (username, email, password, isEmailVerified)
│   ├── session.model.js        # Refresh-token session (bcrypt tokenHash, TTL index)
│   └── verification.model.js   # OTP record (bcrypt codeHash, TTL index)
├── services/
│   ├── token.service.js        # Sign access tokens, issue/rotate refresh sessions
│   ├── verification.service.js # Create + verify OTP codes
│   └── email.service.js        # Send verification email (Resend)
├── Validator/
│   └── otp.validator.js        # zod schema for verify-otp
└── routes/
    └── auth.route.js           # /api/auth routes
index.js                        # Entry point: validates env, connects DB, starts server
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB connection string (e.g. MongoDB Atlas)
- A [Resend](https://resend.com) API key (for sending verification emails)

### Install
```bash
npm install
```

### Configure environment
Create a `.env` file in the project root:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>

# JWT secrets (use long random strings)
JWT_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret

# Token lifetimes (any `ms`-compatible string)
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=onboarding@resend.dev

# OTP tuning
OTP_TTL_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=60
```

> **`MONGO_URI`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` are required** — the server refuses to start without them.
>
> **`EMAIL_FROM`**: `onboarding@resend.dev` works out of the box but only delivers to the email that owns your Resend account. To send to any recipient, verify a domain in Resend and use `no-reply@yourdomain.com`.

### Run
```bash
npm run dev     # development, with auto-reload (nodemon)
npm start       # production
```
On boot you should see `Connected to MongoDB` and `Server is running on port 3000`.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `MONGO_URI` | ✅ | — | MongoDB connection string |
| `JWT_SECRET` | ✅ | — | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | ✅ | — | Secret for signing refresh tokens |
| `PORT` | | `3000` | HTTP port |
| `NODE_ENV` | | `development` | `production` enables secure cookies + `trust proxy` |
| `ACCESS_TOKEN_TTL` | | `15m` | Access-token lifetime |
| `REFRESH_TOKEN_TTL` | | `7d` | Refresh-token lifetime (also cookie & session expiry) |
| `RESEND_API_KEY` | for email | — | Resend API key |
| `EMAIL_FROM` | for email | — | Sender address for verification emails |
| `OTP_TTL_MINUTES` | | `10` | Minutes an OTP code stays valid |
| `OTP_MAX_ATTEMPTS` | | `5` | Wrong tries before a code is burned |
| `OTP_RESEND_COOLDOWN_SECONDS` | | `60` | Minimum wait between OTP requests |

---

## API Reference

Base URL: `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/register` | — | Create an account, receive access token + refresh cookie |
| `POST` | `/login` | — | Log in, receive access token + refresh cookie |
| `GET` | `/me` | Bearer | Get the current user |
| `POST` | `/refresh-token` | Cookie | Rotate refresh token, get a new access token |
| `POST` | `/logout` | Cookie | Revoke the current session |
| `POST` | `/logout-all` | Cookie | Revoke all sessions for the user |
| `POST` | `/request-otp` | Bearer | Email a verification code (rate limited) |
| `POST` | `/verify-otp` | Bearer | Verify the code, mark email verified |

**Auth legend:** *Bearer* = `Authorization: Bearer <accessToken>` header. *Cookie* = the `httpOnly` `refreshToken` cookie (sent automatically by the browser).

### Examples

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{ "username": "haseeb", "email": "haseeb@example.com", "password": "secret123" }
```
```json
201 Created
{
  "message": "User registered successfully",
  "token": "<accessToken>",
  "user": { "id": "...", "username": "haseeb", "email": "haseeb@example.com" }
}
```
> Sets an `httpOnly` `refreshToken` cookie.

**Login** → `200 OK`, same shape as register.

**Get current user**
```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```

**Refresh** (browser sends the cookie automatically)
```http
POST /api/auth/refresh-token
```
```json
200 OK
{ "token": "<newAccessToken>" }
```

**Verify OTP**
```http
POST /api/auth/verify-otp
Authorization: Bearer <accessToken>
Content-Type: application/json

{ "code": "123456" }
```

### Common status codes
| Code | Meaning |
|---|---|
| `400` | Validation error / bad input |
| `401` | Missing/invalid credentials or token |
| `403` | Email not verified (on gated routes) |
| `409` | Username or email already exists |
| `429` | Rate limited / OTP cooldown / too many attempts |
| `500` | Unexpected server error |

---

## How Authentication Works

**Two tokens:**
- **Access token** — short-lived JWT (default 15m), sent in the `Authorization` header, verified on every protected request.
- **Refresh token** — long-lived JWT (default 7d), stored as an `httpOnly` cookie so client-side JS can never read it.

**Sessions & rotation:**
- Each refresh token is tied to a `Session` document. Only a **bcrypt hash** of the token is stored — never the raw token.
- On `POST /refresh-token`, the presented token is verified, matched against its session, then that session is **revoked** and a brand-new session + token are issued (rotation). This limits the damage of a stolen refresh token.
- `logout` revokes the one session; `logout-all` revokes every session for the user. Sessions also auto-expire via a MongoDB TTL index.

**Email verification (OTP):**
1. `POST /request-otp` generates a 6-digit code, stores its **bcrypt hash** (with expiry + attempt counter), and emails the plaintext code via Resend. Requests are rate limited and cooldown-protected.
2. `POST /verify-otp` checks the code against the hash; on success it sets `isEmailVerified: true` and deletes the record. Too many wrong attempts or an expired code forces a fresh request.

---

## Security Notes

- Passwords and refresh tokens/OTP codes are never stored in plaintext (bcrypt).
- Refresh tokens live in `httpOnly`, `sameSite=strict` cookies; `secure` is enabled in production.
- Access tokens are short-lived; refresh tokens rotate and are revocable server-side.
- Input is validated with zod; all errors funnel through one handler that avoids leaking internals.
- **Never commit your `.env`** — it holds database credentials and signing secrets.

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start the server |
