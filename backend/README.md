# LinkForge Backend API

Node.js + Express + TypeScript REST API providing authentication, short URL generation, real-time analytics tracking, QR code processing, user administration, and developer API key access.

## Architecture

- `src/config/`: App environment variables, MongoDB connection setup, CORS rules.
- `src/controllers/`: Route handlers for Auth, URLs, Analytics, Users, Admin, and API Keys.
- `src/middleware/`: JWT verification, role authorization, rate limiting, Zod request validation, global error handling.
- `src/models/`: Mongoose schemas (User, RefreshToken, Url, Analytics, Folder, Tag, ApiKey).
- `src/routes/`: Express endpoint bindings (`/api/v1/...` and `/r/:shortCode`).
- `src/services/`: Email sending, GeoIP geolocation, Nanoid code generation, analytics data aggregation.

## Available Scripts

- `npm run dev`: Runs local dev server using `ts-node-dev`.
- `npm run build`: Compiles TypeScript to `dist/`.
- `npm start`: Starts production Express server from `dist/server.js`.

## API Endpoints Overview

- Auth: `/api/v1/auth` (register, login, logout, refresh-token, verify-email, forgot-password, reset-password)
- URLs: `/api/v1/urls` (CRUD, bulk-delete, bulk-import, folders, tags)
- Analytics: `/api/v1/analytics` (overview, link detailed stats)
- User & Admin: `/api/v1/users` & `/api/v1/admin`
- Developer API: `/api/v1/api-keys`
- Redirection Engine: `/r/:shortCode`
