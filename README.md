# LinkForge — Full-Stack URL Shortener & Analytics Platform

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
| Frontend Framework | React 18, TypeScript, Vite | Client-side application rendering and strict type safety |
| Styling & UI | Tailwind CSS, Framer Motion, Lucide React | Glassmorphic interface, responsive layout, and transitions |
| State & Data Fetching | Zustand, TanStack React Query, Axios | Global state, server caching, and HTTP requests |
| Data Visualization & QR | Recharts, qrcode.react, PapaParse | Analytics charts, QR rendering, and CSV parsing |
| Backend Runtime | Node.js, Express.js, TypeScript | RESTful API routing, business logic, and redirection engine |
| Database & ODM | MongoDB Atlas, Mongoose | NoSQL document store for users, links, analytics clicks, and API keys |
| Geo & Device Telemetry | geoip-lite, useragent | IP geolocation extraction and browser/OS identification |
| Security & Auth | JWT, bcryptjs, Helmet, Express Rate Limit | Token authentication, password hashing, and API rate limiting |
| Deployment | Vercel (Frontend), Render (Backend) | Cloud hosting with automated deployment pipelines |

---

## Architecture

```text
Client Browser / Developer API Client
       │
       │ HTTPS / API Request
       ▼
Express.js API Server (Node.js + TypeScript)
  ├── Security & Rate Limiting Middleware (Helmet, Express Rate Limit)
  ├── Auth Middleware (JWT & API Key Verification: x-api-key)
  ├── Redirection Controller (Fast 302 Redirect + Async Click Analytics Logging)
  │         │
  │         └──> Telemetry Parsers (geoip-lite + useragent)
  │
  ├── Controllers (Auth, Links, Analytics, Bulk, Admin)
  └── Mongoose ODM (MongoDB Atlas Connection Pooling)
               │
               ▼
       MongoDB Database (Atlas)
```

---

## Application Flow

1. **Short Link Creation:** User enters target URL, optional custom alias, password, expiration date, or one-time view toggle.
2. **NanoID Code Generation:** Backend validates destination URL, checks alias uniqueness, and saves link record in MongoDB.
3. **Visitor Redirection:** Visitor requests short URL (`/:code`); backend verifies expiration and password requirements, then issues a fast `302 Redirect` to target destination.
4. **Asynchronous Telemetry Logging:** In background, backend resolves visitor IP via `geoip-lite` and parse user-agent headers, creating an analytics record.
5. **Analytics Visualization:** Link creator opens dashboard; Recharts renders geographic maps, device distributions, and timeline click volume.
6. **Programmatic Access:** Developers supply `x-api-key` header to create and manage links programmatically via REST endpoints.

---

## Project Structure

```text
URL-Shortener/
├── backend/
│   ├── src/
│   │   ├── config/            # Database and environment configuration
│   │   ├── controllers/       # Link, auth, analytics, apiKey, admin controllers
│   │   ├── middleware/        # JWT auth, apiKey auth, rate limiter, error handler
│   │   ├── models/            # Mongoose models (User, Link, Click, ApiKey)
│   │   ├── routes/            # REST API routes and redirect routes
│   │   ├── utils/             # Geolocation helpers, NanoID generator, QR utilities
│   │   └── server.ts          # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/        # ShortenerForm, LinkList, AnalyticsModal, QRCodeModal, AdminTable
│   │   ├── pages/             # Home, Dashboard, Analytics, DeveloperAPI, Admin, Auth
│   │   ├── store/             # Zustand stores
│   │   ├── types/             # TypeScript interfaces
│   │   ├── App.tsx            # Route configuration
│   │   └── main.tsx           # React entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: MongoDB Atlas connection URI or local instance

### 1. Clone the Repository

```bash
git clone https://github.com/Sparsh88/URL-Shortener.git
cd URL-Shortener
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
```

Start backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_BASE_URL=http://localhost:5000
```

Start frontend:

```bash
npm run dev
```

---

## Author

**Sparsh Chauhan**  
*Computer Science & Engineering Student | Full Stack Developer*

- **Portfolio:** [portfolio-delta-topaz-jsfd5oekgj.vercel.app](https://portfolio-delta-topaz-jsfd5oekgj.vercel.app/)
- **GitHub:** [@Sparsh88](https://github.com/Sparsh88)
- **LinkedIn:** [linkedin.com/in/sparshchauhan08](https://linkedin.com/in/sparshchauhan08)
- **Email:** [sparshchauhan050@gmail.com](mailto:sparshchauhan050@gmail.com)
