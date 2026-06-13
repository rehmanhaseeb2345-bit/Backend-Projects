# 🎬 StreamYT

A full-stack, YouTube-style video platform — upload and stream videos, like, comment, build playlists, subscribe to channels, post community tweets, and track your watch history. Built on the MERN stack with a production-hardened, security-first backend.

### 🔗 Live demo — **[streamflow-project.onrender.com](https://streamflow-project.onrender.com/)**

> ⏳ Hosted on Render's free tier, so the server spins down when idle. The **first request after inactivity can take ~30–60 seconds** to wake up — give it a moment, then it's fast. Just create an account to start uploading and watching.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-ESM-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-media-3448C5?logo=cloudinary&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT%20httpOnly-FB015B?logo=jsonwebtokens&logoColor=white)
![Tests](https://img.shields.io/badge/tests-200%2B-success)

---

## ✨ Features

**Videos**
- Upload videos (up to 100 MB) with a thumbnail, title, and description, with a live upload progress bar
- Stream playback with autoplay, view counting, and a full watch page
- Search by title/description, sort by date / views / duration / title, and infinite-scroll paginated feeds
- Creator controls: publish / unpublish, edit metadata & thumbnail, delete (with automatic Cloudinary cleanup)

**Engagement**
- Like / unlike videos, comments, and tweets (with optimistic UI updates)
- Threaded comments with full create / edit / delete
- "Liked videos" and chronological "Watch history" pages

**Channels & social**
- Public channel profiles with subscriber counts and subscribe / unsubscribe
- A subscriptions feed and a community **Tweets** tab per channel
- Playlists: create, add/remove videos, and a "Save to playlist" modal

**Creator studio**
- Dashboard stats: total videos, views, subscribers, and likes
- Manage all your videos, including unpublished drafts

**Experience**
- Light / dark theme with a no-flash, pre-paint theme loader
- Responsive layout, loading states, error boundaries, and SPA client-side routing

**Security & hardening**
- JWT auth in **httpOnly, `sameSite: strict`, secure** cookies — tokens never touch JS
- Refresh-token **rotation with reuse detection** (a replayed token revokes the session)
- `bcrypt` password hashing, Helmet + Content-Security-Policy, and CORS with credentials
- Rate limiting on auth routes, Zod request validation, and input sanitization
- Upload safety: MIME allow-list **+ magic-byte signature verification** + size limits

---

## 🛠 Tech stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React 18, Vite 6, React Router 6, TanStack Query 5, React Hook Form, Axios |
| **Backend** | Node.js (ESM), Express 5 |
| **Database** | MongoDB + Mongoose, `mongoose-aggregate-paginate-v2` |
| **Auth** | JWT access/refresh tokens (httpOnly cookies, rotation + reuse detection), bcrypt |
| **Media** | Multer (temp storage) → Cloudinary, magic-byte file verification |
| **Validation/Security** | Zod, Helmet (CSP), `express-rate-limit`, `sanitize-html`, CORS |
| **Testing** | Vitest, Supertest, `mongodb-memory-server` (200+ tests) |
| **Hosting** | Render (single service serves API + built frontend on one origin) |

---

## 🏗 Project structure

```
StreamYT/
├── index.js                 # Server entry point
├── src/
│   ├── app.js               # Express app: middleware, CSP, routes, SPA fallback
│   ├── controllers/         # Route handlers (video, user, comment, like, …)
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route definitions (/api/v1/*)
│   ├── middlewares/         # auth, multer, validation, rate limiting
│   ├── db/                  # MongoDB connection
│   └── utils/               # Cloudinary, ApiError/ApiResponse, pagination, …
├── tests/
│   ├── integration/         # End-to-end API tests (in-memory MongoDB)
│   ├── security/            # Auth-bypass, injection, rate-limit, upload hardening
│   └── unit/                # Pure-function & model unit tests
└── client/                  # React + Vite frontend
    └── src/
        ├── api/             # Axios API modules (one per resource)
        ├── components/      # Layout, video, comments, tweets, playlists, ui
        ├── context/         # AuthContext
        ├── lib/             # Formatters, theme, query cache helpers
        └── pages/           # Home, Watch, Channel, Studio, Playlist, …
```

---

## 🚀 Getting started

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local or Atlas)
- A free [Cloudinary](https://cloudinary.com/) account (for media storage)

### 1. Clone & install
```sh
git clone https://github.com/<your-username>/StreamYT.git
cd StreamYT
npm install                 # backend dependencies
npm --prefix client install # frontend dependencies
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in the values (see the [table below](#-environment-variables)).
```sh
cp .env.example .env
```

### 3. Run in development
The frontend (Vite) and backend run separately in dev. Vite proxies `/api` to the backend.
```sh
# Terminal 1 — backend (http://localhost:3000)
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
npm --prefix client run dev
```
Open **http://localhost:5173**.

### 4. Run the test suite
Tests use an in-memory MongoDB — no real database required.
```sh
npm test          # run once
npm run test:watch
```

---

## 🔧 Environment variables

| Variable | Description |
| --- | --- |
| `PORT` | Port to listen on (default `3000`) |
| `NODE_ENV` | `development` / `production` / `test` |
| `MONGODB_URI` | MongoDB connection string |
| `CORS_ORIGIN` | Allowed frontend origin (exact origin, not `*`, since credentials are enabled). In production this is the app's own URL. |
| `ACCESS_TOKEN_SECRET` / `ACCESS_TOKEN_EXPIRY` | JWT access-token secret + expiry (e.g. `15m`) |
| `REFRESH_TOKEN_SECRET` / `REFRESH_TOKEN_EXPIRY` | JWT refresh-token secret + expiry (e.g. `7d`) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials |
| `TRUST_PROXY` | Set `true` when running behind a reverse proxy / load balancer (Render, Railway, …) so rate limiting sees real client IPs |
| `AUTH_RATE_LIMIT_MAX` | Max requests per 15 min per IP on `/register`, `/login`, `/refresh-token` (default `20`) |

---

## 📦 Production build & deployment

In production, the Express server serves the built React frontend from `client/dist` on the **same origin** as the API — this is required by the `sameSite: "strict"` auth cookies — with an SPA fallback so client-side routes work on reload.

```sh
npm install
npm run build     # installs client deps + builds client/dist
NODE_ENV=production npm start
```

### Deploying to Render (as in the live demo)
| Setting | Value |
| --- | --- |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Environment** | Set every variable from the table above, plus `NODE_ENV=production` and `TRUST_PROXY=true`. Set `CORS_ORIGIN` to your Render URL (e.g. `https://streamflow-project.onrender.com`). |

> 💡 Cloudinary media is served over **https** (`secure_url`) so it loads correctly under the production HTTPS Content-Security-Policy.

---

## 🔐 Auth model (important for API consumers)

- On register/login, the server sets two **httpOnly cookies**: `accessToken` (short-lived) and `refreshToken` (long-lived). They are **not** returned in the JSON body.
- Authenticated requests must be sent with `credentials: "include"` (fetch) / `withCredentials: true` (axios) so the browser includes these cookies.
- Cookies use `sameSite: "strict"` and `secure` (in production), so the frontend must run on the same site/origin as `CORS_ORIGIN`.
- When the access token expires, `POST /api/v1/users/refresh-token` issues a new token pair. Reusing an old/rotated-out refresh token revokes **both** tokens and forces re-login.

---

## 📚 API reference

Base URL: `/api/v1`. List endpoints marked **paginated** accept `?page=` and `?limit=` (max 50) and return `{ docs, totalDocs, limit, page, totalPages, hasPrevPage, hasNextPage, … }`.

<details>
<summary><strong>Expand full endpoint reference</strong></summary>

### Health
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/healthcheck` | — | Service + DB status |

### Users / Auth (`/users`)
| Method | Path | Auth | Body / Notes |
| --- | --- | --- | --- |
| POST | `/users/register` | — | multipart: `fullname`, `username`, `email`, `password`, `avatar` (required), `coverImage` (optional) |
| POST | `/users/login` | — | JSON: `username` or `email`, `password` |
| POST | `/users/refresh-token` | — (cookie) | Refreshes access/refresh token cookies |
| POST | `/users/logout` | required | Clears auth cookies |
| POST | `/users/change-password` | required | JSON: `oldPassword`, `newPassword`, `confirmPassword` |
| GET | `/users/me` | required | Current user profile |
| PATCH | `/users/update-account` | required | JSON: `fullname`, `email` |
| PATCH | `/users/avatar` | required | multipart: `avatar` |
| PATCH | `/users/cover-image` | required | multipart: `coverImage` |
| GET | `/users/channel/:username` | optional | Channel profile + subscriber counts + `isSubscribed` |

### Videos (`/videos`)
| Method | Path | Auth | Body / Notes |
| --- | --- | --- | --- |
| GET | `/videos` | — | **paginated**. Query: `query`, `sortBy` (`createdAt`\|`views`\|`duration`\|`title`), `sortType` (`asc`\|`desc`), `userId` |
| POST | `/videos` | required | multipart: `title`, `description`, `videoFile`, `thumbnail` |
| GET | `/videos/:videoId` | optional | Video details (unpublished visible only to owner); increments views |
| PATCH | `/videos/:videoId` | required (owner) | multipart: `title?`, `description?`, `thumbnail?` |
| DELETE | `/videos/:videoId` | required (owner) | Deletes video + Cloudinary assets |
| PATCH | `/videos/:videoId/toggle-publish` | required (owner) | Toggles `isPublished` |

### Comments (`/comments`)
| Method | Path | Auth | Body / Notes |
| --- | --- | --- | --- |
| GET | `/comments/:videoId` | optional | **paginated** comments for a video |
| POST | `/comments/:videoId` | required | JSON: `content` |
| PATCH | `/comments/c/:commentId` | required (owner) | JSON: `content` |
| DELETE | `/comments/c/:commentId` | required (owner) | — |

### Likes (`/likes`) — all require auth
| Method | Path | Notes |
| --- | --- | --- |
| POST | `/likes/toggle/v/:videoId` | Like/unlike a video |
| POST | `/likes/toggle/c/:commentId` | Like/unlike a comment |
| POST | `/likes/toggle/t/:tweetId` | Like/unlike a tweet |
| GET | `/likes/videos` | **paginated** liked videos |

### Playlists (`/playlists`)
| Method | Path | Auth | Body / Notes |
| --- | --- | --- | --- |
| GET | `/playlists/user/:userId` | — | **paginated** playlists, each with `videoCount` |
| POST | `/playlists` | required | JSON: `name`, `description?` |
| GET | `/playlists/:playlistId` | optional | Playlist with populated videos |
| PATCH | `/playlists/:playlistId` | required (owner) | JSON: `name?`, `description?` |
| DELETE | `/playlists/:playlistId` | required (owner) | — |
| PATCH | `/playlists/:playlistId/videos/:videoId` | required (owner) | Add video to playlist |
| DELETE | `/playlists/:playlistId/videos/:videoId` | required (owner) | Remove video from playlist |

### Subscriptions (`/subscriptions`)
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/subscriptions/c/:channelId` | required | Toggle subscribe/unsubscribe |
| GET | `/subscriptions/c/:channelId` | — | **paginated** subscribers of a channel |
| GET | `/subscriptions/u/:subscriberId` | — | **paginated** channels a user follows |

### Tweets (`/tweets`)
| Method | Path | Auth | Body / Notes |
| --- | --- | --- | --- |
| GET | `/tweets/user/:userId` | — | **paginated** tweets for a user |
| POST | `/tweets` | required | JSON: `content` |
| PATCH | `/tweets/:tweetId` | required (owner) | JSON: `content` |
| DELETE | `/tweets/:tweetId` | required (owner) | — |

### Dashboard (`/dashboard`) — all require auth
| Method | Path | Notes |
| --- | --- | --- |
| GET | `/dashboard/stats` | `{ totalVideos, totalViews, totalSubscribers, totalLikes }` |
| GET | `/dashboard/videos` | **paginated** current user's videos (incl. unpublished) |

</details>

### Response shape
```json
{ "success": true, "statusCode": 200, "data": { }, "message": "..." }
```
```json
{ "success": false, "statusCode": 400, "message": "...", "errors": [] }
```

---

## 🧪 Testing

A 200+ test suite runs against an in-memory MongoDB (no external services needed), covering:
- **Integration** — every API resource end-to-end (auth, videos, comments, likes, playlists, subscriptions, tweets, dashboard, watch history)
- **Security** — auth-bypass attempts, injection, rate limiting, upload hardening, general hardening
- **Unit** — cookie options, file-signature verification, and model logic

```sh
npm test
```

---

## 👤 Author

**Muhammad Haseeb Ur Rehman**

Built as a full-stack practice project. Contributions and feedback welcome — try it live at **[streamflow-project.onrender.com](https://streamflow-project.onrender.com/)**.
