# 🚀 LinkForge - Production-Ready Enterprise URL Shortener Platform

LinkForge is a modern, scalable, secure, and feature-rich full-stack URL shortener platform inspired by Bitly, Dub.co, Short.io, Vercel, and Linear. Built with clean architecture, micro-animations, real-time analytics tracking, and developer APIs.

---

## 🌟 Key Features

- 🔐 **Authentication & Authorization**: JWT Access/Refresh tokens in HttpOnly cookies, Email Verification, Password Reset, Roles (User & Admin).
- 🔗 **Advanced URL Shortening**:
  - Custom & Random Aliases (NanoID)
  - Expiration Dates & One-Time (Self-Destructing) Links
  - Password Protection
  - Public / Private visibility
  - Favorites & Tag / Folder organization
  - Bulk Import (CSV) & Bulk Export (CSV)
- 📊 **Comprehensive Analytics**:
  - Real-time click tracking
  - Unique vs Returning visitors
  - Geolocation (Country & City) tracking
  - Device, OS, and Browser breakdown
  - Referral and Traffic Source analytics
  - Dynamic interactive charts powered by Recharts (Daily, Weekly, Monthly, Yearly)
- 📱 **QR Code Engine**:
  - Real-time client-side customizable QR code generation
  - Download as PNG / SVG
- 🛠️ **Developer API & Keys**:
  - API Key Generation & Management
  - RESTful Developer API (`/api/v1/...`) with API key authorization header support
- 🛡️ **Admin Oversight Panel**:
  - Global user management (View, Suspend, Promote, Delete)
  - Platform-wide telemetry and top performing links
- 🎨 **Modern UI/UX**:
  - Dark & Light mode support
  - Glassmorphic animated interface built with Tailwind CSS & Framer Motion
  - Responsive layout for Mobile, Tablet, and Desktop

---

## 📁 Repository Structure

LinkForge is organized into two completely independent non-monorepo projects:

```text
LinkForge/
├── frontend/             # React 19 + TypeScript + Vite + Tailwind CSS SPA
│   ├── src/              # Components, Hooks, Pages, Services, Stores
│   ├── package.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── README.md
├── backend/              # Node.js + Express + TypeScript REST API
│   ├── src/              # Controllers, Models, Routes, Services, Middleware
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
└── README.md             # This global documentation file
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas connection URI

### 1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGODB_URI and JWT secrets in .env
npm run dev
```
Backend API will start at `http://localhost:5000`

### 2. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend Web App will run at `http://localhost:5173`

---

## 🌐 Deployment Instructions

- **Frontend**: Deploy `frontend/` directory directly to **Vercel** (`npm run build`).
- **Backend**: Deploy `backend/` directory directly to **Render** or Railway (`npm run build` -> `npm start`).
- **Database**: Connect to **MongoDB Atlas**.

---

## 📜 License
MIT License. Created for high-performance link management and analytics.
