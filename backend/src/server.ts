import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { env } from './config/env';
import { connectDB } from './config/db';
import { seedAdminUser } from './utils/seedAdmin';
import { globalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes/index';
import redirectRoutes from './routes/redirectRoutes';

const app = express();

// 1. Connect Database & Seed Admin
connectDB()
  .then(() => {
    seedAdminUser();
  })
  .catch((err) => {
    console.error('[Startup Error] Database connection or seeding failed:', err.message);
  });

// 2. Health Check Endpoints (Mounted before rate limiter & DB guards to guarantee 200 OK for Render probes)
const healthHandler = (req: Request, res: Response) => {
  const dbStatus =
    mongoose.connection.readyState === 1
      ? 'connected'
      : mongoose.connection.readyState === 2
      ? 'connecting'
      : 'disconnected';

  res.status(200).json({
    status: 'ok',
    message: 'API is running',
    app: 'LinkForge API Engine',
    version: '1.0.0',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);
app.get('/api/v1/health', healthHandler);

// 3. Core Middlewares
app.set('etag', 'strong'); // Enable HTTP 304 Not Modified caching support

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all Vercel, localhost, and incoming requests dynamically with credentials
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-link-password'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(globalLimiter);

// Cold-Start Database Guard: Ensure DB connection is active before processing data requests
app.use(async (req: Request, res: Response, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (err) {
    next(err);
  }
});

// 4. API Routes (/api/v1)
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes); // Backward compatibility fallback

// 5. Redirection Engine (/r/:shortCode and /:shortCode)
app.use('/r', redirectRoutes);
app.use('/', redirectRoutes);

// 6. Global Error Handler
app.use(errorHandler);

const PORT = Number(process.env.PORT) || Number(env.PORT) || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(`⚡ LinkForge Backend running on port ${PORT}`);
  console.log(`🌐 Base URL: ${env.BASE_URL}`);
  console.log(`🚀 Mode: ${env.NODE_ENV}`);
  console.log(`==================================================`);
});

// Graceful Shutdown Handling
const handleGracefulShutdown = (signal: string) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    try {
      await mongoose.connection.close(false);
      console.log('[MongoDB] Connection closed.');
    } catch (err) {
      console.error('[MongoDB] Error during disconnect:', err);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

export default app;
