# LinkForge - Full-Stack URL Shortener & Analytics Platform

A full-stack URL shortening and link management platform built with React, Node.js, Express, TypeScript, and MongoDB, featuring fast redirection, granular click analytics, QR code generation, and developer API key access.

---

## Live Demo & Repository

- **Live Application:** [https://url-shortener-blue-phi.vercel.app](https://url-shortener-blue-phi.vercel.app/)
- **Backend API:** [https://url-shortener-b3u8.onrender.com](https://url-shortener-b3u8.onrender.com)
- **GitHub Repository:** [https://github.com/Sparsh88/URL-Shortener](https://github.com/Sparsh88/URL-Shortener)

---

## Overview

LinkForge is a modern web application designed to transform lengthy URLs into compact, memorable links while providing detailed real-time tracking of visitor traffic.

The platform provides granular link controls including custom aliases, optional password protection, expiration timestamps, one-time self-destruct links, and custom-styled QR codes. Performance metrics are aggregated into interactive dashboards offering timeline trends, geographic distributions, device breakdowns, and referrer sources.

In addition to the web interface, LinkForge includes a developer API with key-based authentication for programmatic access, a role-based admin console for user governance, and bulk URL processing capabilities.

---

## Problem Statement

- **Unwieldy Links:** Long, parameterized URLs are difficult to share across messaging platforms, social media, and printed collateral.
- **Lack of Traffic Visibility:** Standard URL shorteners often lack actionable audience analytics such as visitor location, device type, and referral origin.
- **Link Security & Lifecycle Controls:** Sharing sensitive or time-bound information requires granular protection like password gates, self-destruct mechanisms, and expiration dates.
- **Workflow Bottlenecks:** Managing and shortening links individually without batch import tools or developer APIs slows down power users and automation pipelines.

---

## Key Features

- **URL Shortening & Custom Aliases:** Generate 7-character NanoID short codes or assign custom aliases with reserved-path protection.
- **Link Security & Expiration:** Set link expiration dates, enable one-time (self-destruct) access, and secure destinations with bcrypt-hashed passwords.
- **Comprehensive Click Analytics:** Track total and unique visits, device type (Desktop, Mobile, Tablet), operating system, browser, country, city, and referral source via `geoip-lite` and `useragent`.
- **Interactive Analytics Dashboard:** Visualize traffic trends using Recharts timeline charts, device distribution breakdowns, and filterable metrics over custom timeframes (24h, 7d, 30d, 1y).
- **Customizable QR Code Generator:** Generate live QR codes for any short link with custom foreground and background colors, downloadable directly as PNG.
- **Bulk URL Management & CSV Import:** Shorten multiple URLs simultaneously via multi-line text input or CSV file upload, alongside bulk delete operations.
- **Developer API Keys:** Generate and revoke API keys (`x-api-key` header) for programmatic link creation and retrieval.
- **Role-Based Admin Dashboard:** Admin interface to monitor platform-wide metrics, review user link activity, toggle user suspension, and manage account roles.
- **Authentication & Security:** JWT-based authentication (short-lived access tokens and refresh tokens), password reset and email verification flows via Nodemailer, Helmet security headers, and rate limiting.

---

## Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite | Client-side application rendering and type safety |
| **Styling & UI** | Tailwind CSS, Framer Motion, Lucide React | Glassmorphic interface, responsive layout, and transitions |
| **State & Data Fetching** | Zustand, TanStack React Query, Axios | Global state, server caching, and HTTP requests |
| **Data Visualization & QR** | Recharts, qrcode.react, PapaParse | Analytics charts, QR rendering, and CSV parsing |
| **Backend Runtime & API** | Node.js, Express.js, TypeScript | RESTful API routing, business logic, and redirection engine |
| **Database & ODM** | MongoDB, Mongoose | Schema modeling, compound indexing, and aggregate pipelines |
| **Authentication & Security** | JWT, bcryptjs, Helmet, Express-Rate-Limit | Token auth, password hashing, security headers, and throttling |
| **Parsing & Utilities** | GeoIP-Lite, Useragent, Zod, Nodemailer | Geo-location lookup, client parsing, validation, and email |
| **Hosting & Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas | Cloud deployment and database hosting |

---

## Architecture

```mermaid
graph TD
    User["Client Browser / Developer API"]
    Vercel["Frontend (Vercel SPA - React + Vite)"]
    Render["Backend REST API & Redirect Engine (Render - Express + Node.js)"]
    Mongo[("MongoDB Atlas (Users, URLs, Analytics, API Keys)")]
    GeoIP["GeoIP-Lite & UserAgent Parser"]
    SMTP["SMTP Mailer (Nodemailer)"]

    User -->|Access Dashboard & UI| Vercel
    User -->|Resolve Short URL (/:shortCode)| Render
    User -->|API Requests (x-api-key)| Render
    Vercel -->|REST API Calls (Bearer Token)| Render
    Render -->|CRUD & Aggregate Pipelines| Mongo
    Render -->|Parse IP & Client Header| GeoIP
    Render -->|Auth & Verification Mails| SMTP
```

---

## Application Flow

1. **Authentication:** User registers or logs in; the server validates credentials and issues JWT access and refresh tokens.
2. **Link Configuration:** User enters a destination URL and configures optional properties (custom alias, expiration time, password, tags, or one-time access).
3. **Validation & Creation:** Backend validates inputs using Zod schemas, hashes passwords with bcrypt (if set), assigns a unique short code, and saves the document in MongoDB.
4. **Link Distribution:** User copies the short URL or exports a customized QR code for marketing or distribution.
5. **Redirection Request:** Visitor navigates to the short link (`/:shortCode` or `/r/:shortCode`).
6. **Security & State Validation:** Redirection controller checks active status, expiration timestamp, and validates password credentials if enabled.
7. **Analytics Logging:** Server extracts IP, GeoIP location, browser, OS, and referrer, logging an analytics record while atomically incrementing link click counters.
8. **Destination Redirect:** Visitor is redirected to the original destination URL via an HTTP 302 response.

---

## Project Structure

```text
URL-Shortener/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection and environment config
│   │   ├── controllers/     # Auth, URL, analytics, admin, & apiKey logic
│   │   ├── middleware/      # JWT auth, rate limiter, validation, & error handler
│   │   ├── models/          # Mongoose schemas (User, Url, Analytics, ApiKey, etc.)
│   │   ├── routes/          # Express route definitions
│   │   ├── utils/           # Email, GeoIP, JWT, NanoID, and response helpers
│   │   └── server.ts        # Server entrypoint and middleware orchestration
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Modular UI components (auth, urls, analytics, admin)
│   │   ├── pages/           # Route views (Dashboard, Analytics, Admin, etc.)
│   │   ├── services/        # Axios API client integrations
│   │   ├── stores/          # Zustand state stores (auth, theme, url)
│   │   ├── types/           # TypeScript interfaces and types
│   │   ├── App.tsx          # Router configuration and React Query provider
│   │   └── main.tsx         # React application entrypoint
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── render.yaml              # Render backend deployment blueprint
├── vercel.json              # Vercel SPA routing rewrite rules
└── README.md
```

---

## Getting Started Locally

### Prerequisites

- Node.js (v18 or later)
- MongoDB instance (local or MongoDB Atlas connection string)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/Sparsh88/URL-Shortener.git
cd URL-Shortener
```

### 2. Backend Configuration & Setup

```bash
cd backend
npm install
cp .env.example .env
```

Configure the environment variables in `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

Start the backend development server:

```bash
npm run dev
```

### 3. Frontend Configuration & Setup

```bash
cd ../frontend
npm install
cp .env.example .env
```

Configure `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SHORT_BASE_URL=http://localhost:5000/r
```

Start the frontend development server:

```bash
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## API Reference Highlights

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user account | No |
| `POST` | `/api/v1/auth/login` | Authenticate user & receive tokens | No |
| `POST` | `/api/v1/urls/shorten` | Create a new short URL | Optional (JWT / API Key) |
| `GET` | `/api/v1/urls` | Retrieve paginated user URLs with filters | Yes (JWT / API Key) |
| `GET` | `/r/:shortCode` | Redirect to original target URL | No |
| `POST` | `/api/v1/urls/verify-password` | Verify password for protected link | No |
| `GET` | `/api/v1/analytics/url/:id` | Get aggregated analytics for a specific link | Yes (JWT) |
| `GET` | `/api/v1/analytics/overview` | Get overview metrics across all user links | Yes (JWT) |
| `POST` | `/api/v1/api-keys` | Generate a new developer API key | Yes (JWT) |
| `GET` | `/api/v1/admin/stats` | Retrieve platform-wide administration stats | Yes (Admin) |

---

## Author

**Sparsh Chauhan**
- GitHub: [@Sparsh88](https://github.com/Sparsh88)
- LinkedIn: [sparshchauhan08](https://linkedin.com/in/sparshchauhan08)
