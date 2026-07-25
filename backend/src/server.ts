import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { connectDB } from './config/db';
import { seedAdminUser } from './utils/seedAdmin';
import { globalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes/index';
import redirectRoutes from './routes/redirectRoutes';

const app = express();

// 1. Connect Database & Seed Admin
connectDB().then(() => {
  seedAdminUser();
});

// 2. Core Middlewares
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

// 3. Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    app: 'LinkForge API Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 4. API Routes (/api/v1)
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes); // Backward compatibility fallback

// 5. Redirection Engine (/r/:shortCode and /:shortCode)
app.use('/r', redirectRoutes);
app.use('/', redirectRoutes);

// 6. Global Error Handler
app.use(errorHandler);

const PORT = env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`⚡ LinkForge Backend running on port ${PORT}`);
  console.log(`🌐 Base URL: ${env.BASE_URL}`);
  console.log(`🚀 Mode: ${env.NODE_ENV}`);
  console.log(`==================================================`);
});

export default app;
