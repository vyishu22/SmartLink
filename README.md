# SmartLink – URL Shortener with Analytics

> A production-ready, full-stack URL shortening platform with deep analytics, QR codes, custom aliases, bulk import, and a modern SaaS dashboard.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [MongoDB Schema](#mongodb-schema)
- [Deployment Guide](#deployment-guide)
- [Screenshots](#screenshots)
- [Testing](#testing)
- [Sample Logs](#sample-logs)
- [Sample Database Records](#sample-database-records)
- [Assumptions](#assumptions)

---

## Project Overview

**SmartLink** is a full-stack URL shortener platform where authenticated users can:
- Create short links from long URLs
- Manage all their links from a clean dashboard
- View per-link analytics (clicks, browser, device, OS, daily trend)
- Generate QR codes for any link
- Set custom aliases and expiry dates
- Bulk-import URLs via CSV

Stack: **React + Vite** frontend, **Node.js/Express** backend, **MongoDB Atlas** database.

---

## Features

### Authentication
- JWT-based register / login / logout
- Password hashing with bcrypt (12 salt rounds)
- Protected frontend routes via React Router
- Protected backend APIs via middleware
- Token stored in `localStorage`, auto-attached via Axios interceptor
- Auto-redirect to `/login` on 401

### URL Shortening
- Create short URL from any valid `http(s)` URL
- `nanoid` generates unique 7-character short codes
- Custom alias support (validated: alphanumeric + `-_`)
- Optional title and expiry date per link
- Copy to clipboard, delete, and edit destination
- Server-side `301` redirect with UA tracking

### Analytics
- Total clicks counter per link
- Last visited timestamp
- Browser breakdown (Chrome, Firefox, Safari, etc.)
- Device breakdown (Desktop, Mobile, Tablet)
- OS breakdown
- Daily click trend chart (7 / 30 / 90 days)
- Recent visits table (last 10)
- Public stats page per short code

### Bonus Features
- ✅ Custom alias support
- ✅ QR code generation (inline toggle)
- ✅ Link expiry dates (auto-deactivates)
- ✅ Public statistics page (`/s/:shortCode`)
- ✅ Bulk CSV URL shortening (up to 100 URLs)
- ✅ Daily click trend charts (AreaChart + BarChart)
- ✅ Edit destination URL inline modal

---

## Architecture

```
Browser (React SPA)
       │
       ▼
  Vercel CDN
       │
       ▼
 Express API (Render)
   ├── /api/auth     → JWT auth endpoints
   ├── /api/urls     → CRUD + analytics endpoints
   ├── /api/bulk     → Bulk CSV processing
   ├── /stats/:code  → Public stats
   └── /:shortCode   → 301 redirect + visit tracking
       │
       ▼
 MongoDB Atlas
   ├── users         → Credentials + profile
   ├── urls          → Short link records
   └── visits        → Per-click analytics events
```

**Request flow for a redirect:**
1. Browser hits `https://api.smartlink.app/abc123`
2. Express finds the URL doc by `shortCode`
3. Checks `isActive` and `expiryDate`
4. Parses `User-Agent` with `ua-parser-js`
5. Creates a `Visit` document asynchronously
6. Increments `totalClicks` and sets `lastVisitedAt`
7. Responds with `301` to `originalUrl`

---

## Folder Structure

```
smartlink/
├── backend/
│   ├── config/
│   │   └── db.js               # Mongoose connection
│   ├── controllers/
│   │   ├── authController.js   # register, login, getMe
│   │   ├── urlController.js    # CRUD, analytics, public stats
│   │   └── redirectController.js # 301 redirect + visit tracking
│   ├── middleware/
│   │   ├── auth.js             # JWT protect middleware
│   │   ├── errorHandler.js     # Global error + 404 handler
│   │   └── validate.js         # express-validator error handler
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Url.js              # URL schema
│   │   └── Visit.js            # Visit/analytics schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── urls.js
│   │   ├── redirect.js
│   │   └── bulk.js
│   ├── services/
│   │   └── bulkService.js      # CSV batch processing logic
│   ├── validators/
│   │   ├── authValidators.js
│   │   └── urlValidators.js
│   ├── utils/
│   │   ├── response.js         # sendSuccess / sendError helpers
│   │   └── jwt.js              # generateToken / verifyToken
│   ├── tests/
│   │   └── api.test.js         # Jest + Supertest integration tests
│   ├── server.js               # Express app entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── client.js       # Axios instance + interceptors
    │   │   ├── auth.js         # Auth API calls
    │   │   └── urls.js         # URL API calls
    │   ├── components/
    │   │   ├── EditUrlModal.jsx
    │   │   ├── UrlCard.jsx
    │   │   └── ui/
    │   │       ├── ConfirmDialog.jsx
    │   │       ├── EmptyState.jsx
    │   │       ├── LoadingScreen.jsx
    │   │       ├── Skeletons.jsx
    │   │       └── StatCard.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx  # Auth state + login/logout
    │   ├── layouts/
    │   │   └── DashboardLayout.jsx  # Sidebar + mobile header
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── CreateUrl.jsx
    │   │   ├── Analytics.jsx        # Per-link detail
    │   │   ├── AnalyticsOverview.jsx
    │   │   ├── Profile.jsx
    │   │   ├── PublicStats.jsx
    │   │   ├── NotFound.jsx
    │   │   └── Expired.jsx
    │   ├── routes/
    │   │   └── ProtectedRoute.jsx
    │   ├── utils/
    │   │   └── date.js          # formatDistanceToNow, formatNumber
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css            # Tailwind + custom component classes
    ├── public/
    │   └── favicon.svg
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── .env.example
```

---

## Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- npm or yarn

### 1. Clone the repo

```bash
git clone https://github.com/your-username/smartlink.git
cd smartlink
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend URL
npm run dev
```

Frontend runs at `http://localhost:5173`
Backend runs at `http://localhost:5000`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `super_secret_key_abc123` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `CLIENT_URL` | Frontend origin for CORS + redirects | `http://localhost:5173` |
| `BASE_URL` | Backend base URL for short links | `http://localhost:5000` |
| `NODE_ENV` | Environment | `development` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `VITE_BASE_URL` | Backend base URL (for redirect links) | `http://localhost:5000` |

---

## API Documentation

All responses follow this format:
```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... }
}
```

### Auth

#### `POST /api/auth/register`
```json
// Body
{ "name": "Alex", "email": "alex@example.com", "password": "secret123" }

// Response 201
{ "success": true, "data": { "token": "...", "user": { "id": "...", "name": "Alex", "email": "..." } } }
```

#### `POST /api/auth/login`
```json
// Body
{ "email": "alex@example.com", "password": "secret123" }

// Response 200
{ "success": true, "data": { "token": "...", "user": { ... } } }
```

#### `GET /api/auth/me`
```
Headers: Authorization: Bearer <token>

Response 200: { "data": { "user": { ... } } }
```

### URLs

#### `POST /api/urls`
```json
// Headers: Authorization: Bearer <token>
// Body
{
  "originalUrl": "https://example.com/very/long/url",
  "customAlias": "my-link",       // optional
  "title": "My campaign",          // optional
  "expiryDate": "2025-12-31T00:00:00Z"  // optional
}
// Response 201: { "data": { "url": { ..., "shortUrl": "http://..." } } }
```

#### `GET /api/urls`
```
Query: ?page=1&limit=10&search=keyword
Response 200: { "data": { "urls": [...], "pagination": { "page", "limit", "total", "pages" } } }
```

#### `GET /api/urls/:id`
#### `PUT /api/urls/:id`
#### `DELETE /api/urls/:id`

#### `GET /api/urls/:id/analytics`
```json
{
  "data": {
    "url": { ... },
    "totalClicks": 142,
    "recentVisits": [...],
    "browsers": [{ "name": "Chrome", "value": 89 }],
    "devices": [{ "name": "Desktop", "value": 105 }],
    "operatingSystems": [{ "name": "Windows", "value": 67 }]
  }
}
```

#### `GET /api/urls/:id/daily-clicks?days=30`
```json
{
  "data": {
    "dailyClicks": [
      { "date": "2024-01-01", "clicks": 12 },
      ...
    ]
  }
}
```

### Redirect

#### `GET /:shortCode`
- Returns `301` redirect to `originalUrl`
- Tracks visit (browser, device, OS, IP) asynchronously
- Returns redirect to `/expired` if link has passed expiry

#### `GET /stats/:shortCode`
- Public endpoint, no auth required
- Returns total clicks, creation date, last visited, recent visits

### Bulk

#### `POST /api/bulk`
```json
// Body
{
  "rows": [
    { "originalUrl": "https://example.com", "customAlias": "ex", "title": "Example" },
    { "originalUrl": "https://google.com" }
  ]
}
// Response 200: { "data": { "results": [...], "summary": { "total", "succeeded", "failed" } } }
```

---

## MongoDB Schema

### User
```js
{
  name:      String (required, 2–50 chars),
  email:     String (required, unique, lowercase),
  password:  String (hashed, bcrypt 12 rounds, select:false),
  createdAt: Date,
  updatedAt: Date
}
// Index: email (unique)
```

### Url
```js
{
  userId:       ObjectId → User (required, indexed),
  originalUrl:  String (required),
  shortCode:    String (required, unique, indexed),
  customAlias:  String | null,
  title:        String | null (max 100 chars),
  expiryDate:   Date | null,
  totalClicks:  Number (default 0),
  lastVisitedAt:Date | null,
  isActive:     Boolean (default true),
  createdAt:    Date,
  updatedAt:    Date
}
// Indexes: shortCode (unique), userId+createdAt (compound)
```

### Visit
```js
{
  urlId:           ObjectId → Url (required, indexed),
  visitedAt:       Date (default: now),
  browser:         String (e.g. "Chrome"),
  device:          String (enum: Desktop|Mobile|Tablet|Unknown),
  operatingSystem: String (e.g. "Windows"),
  ipAddress:       String | null,
  referrer:        String | null,
  createdAt:       Date,
  updatedAt:       Date
}
// Indexes: urlId+visitedAt (compound, for analytics aggregation)
```

---

## Deployment Guide

### MongoDB Atlas
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Add a database user and whitelist `0.0.0.0/0`
3. Copy the connection string into `MONGODB_URI`

### Backend → Render
1. Push `backend/` to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. Add all environment variables from `.env.example`
6. Set `NODE_ENV=production`
7. Note your Render URL (e.g. `https://smartlink-api.onrender.com`)

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Set environment variables:
   - `VITE_API_URL` = `https://smartlink-api.onrender.com/api`
   - `VITE_BASE_URL` = `https://smartlink-api.onrender.com`
4. Deploy

> **Note:** Update `CLIENT_URL` in your Render env vars to your Vercel domain to allow CORS.

---

## Screenshots

> _(Add screenshots of: Landing page, Dashboard, Create URL form, Analytics charts, QR code, Bulk CSV modal)_

---

## Loom Video

> (https://www.loom.com/share/6fd6fa7b3d754584a232055391b59113)

---

## Testing

### Backend Tests (Jest + Supertest)

```bash
cd backend
npm test
```

Tests cover:
- `POST /api/auth/register` — success + duplicate email
- `POST /api/auth/login` — success + wrong password
- `GET /api/auth/me` — authenticated + unauthenticated
- `POST /api/urls` — valid URL + invalid URL + custom alias
- `GET /api/urls` — list with pagination
- `GET /api/urls/:id` — fetch by ID
- `PUT /api/urls/:id` — update title
- `GET /api/urls/:id/analytics` — analytics shape
- `GET /api/urls/:id/daily-clicks` — daily data array
- `GET /:shortCode` — 301 redirect
- `GET /stats/:shortCode` — public stats

### Frontend Testing Checklist

| Feature | Test |
|---|---|
| Register | Fill form → submit → redirect to dashboard |
| Login | Valid credentials → JWT stored → redirect |
| Login fail | Wrong password → error toast shown |
| Create link | Enter URL → submit → short URL displayed |
| Copy link | Click copy icon → clipboard → toast |
| Custom alias | Taken alias → 409 error toast |
| Edit link | Open modal → change URL → save → updated |
| Delete link | Confirm dialog → delete → removed from list |
| QR Code | Click QR icon → QR renders inline |
| Analytics | Click chart icon → daily area chart renders |
| Expiry | Past date → badge shows "Expired" |
| Bulk CSV | Upload/paste CSV → process → results shown |
| Pagination | > 10 links → prev/next buttons appear |
| Search | Type in search → list filters |
| Logout | Click logout → redirected to landing |
| Protected route | Visit /dashboard unauthenticated → /login |

---

## Sample Logs

```
✅ MongoDB connected: cluster0.abc.mongodb.net
🚀 SmartLink server running on port 5000 [production]
POST /api/auth/register 201 42ms
POST /api/auth/login 200 38ms
POST /api/urls 201 55ms
GET /api/urls 200 18ms
GET /abc123g → 301 → https://example.com (Chrome/Desktop/Windows)
GET /api/urls/64f.../analytics 200 24ms
```

---

## Sample Database Records

### User
```json
{
  "_id": "64f3a1b2c4d5e6f7a8b9c0d1",
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "$2b$12$hashedpassword...",
  "createdAt": "2024-01-10T09:00:00.000Z"
}
```

### URL
```json
{
  "_id": "64f3a2c3d4e5f6a7b8c9d0e1",
  "userId": "64f3a1b2c4d5e6f7a8b9c0d1",
  "originalUrl": "https://example.com/blog/my-post",
  "shortCode": "abc123g",
  "customAlias": null,
  "title": "Blog post",
  "expiryDate": null,
  "totalClicks": 42,
  "lastVisitedAt": "2024-01-15T14:32:00.000Z",
  "isActive": true,
  "createdAt": "2024-01-10T10:00:00.000Z"
}
```

### Visit
```json
{
  "_id": "64f3a3d4e5f6a7b8c9d0e1f2",
  "urlId": "64f3a2c3d4e5f6a7b8c9d0e1",
  "visitedAt": "2024-01-15T14:32:00.000Z",
  "browser": "Chrome",
  "device": "Desktop",
  "operatingSystem": "macOS",
  "ipAddress": "203.0.113.42",
  "referrer": "https://twitter.com"
}
```

---

## Assumptions

1. Short codes are globally unique (not per-user), enabling clean redirects without user context.
2. Visit tracking is best-effort — if the `Visit.create` call fails, the redirect still succeeds.
3. `totalClicks` on the `Url` document is a denormalized counter for fast dashboard reads; `Visit` documents are the source of truth for breakdowns.
4. The public stats page (`/s/:shortCode`) exposes only aggregate data — no personal user info.
5. Bulk CSV processing is synchronous per row but concurrent requests are rate-limited to 100 URLs per call.
6. Link expiry is enforced at redirect time only (not retroactively removed from the database).
7. IP addresses are stored as-is from the request for analytics; no geolocation is performed (can be added with `maxmind`).
8. The frontend stores the JWT in `localStorage` — a `httpOnly` cookie approach would be more secure for production but requires additional backend cookie configuration.

---


> This project is a part of a hackathon run by https://katomaran.com
