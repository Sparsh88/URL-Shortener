import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';

// In Windows local environments, local ISP DNS sometimes fails on SRV lookups.
// Only apply fallback DNS if on Windows or explicitly running in development.
if (process.platform === 'win32' && env.NODE_ENV !== 'production') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    // Ignore if system restricts custom DNS
  }
}

let isConnecting = false;
let isListenersAttached = false;

export const connectDB = async (): Promise<void> => {
  // If already connected, reuse existing connection
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (isConnecting) {
    return;
  }

  if (!isListenersAttached) {
    isListenersAttached = true;
    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Warning: Connection lost.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error event:', err.message);
    });
  }

  try {
    isConnecting = true;

    if (!env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is missing!');
    }

    if (env.MONGODB_URI.includes('127.0.0.1') && env.NODE_ENV === 'production') {
      console.warn(
        '[MongoDB Warning] Production environment detected with localhost MONGODB_URI. Set MONGODB_URI to MongoDB Atlas connection string in Render environment variables.'
      );
    }

    const conn = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 20, // Maintain up to 20 socket connections for high concurrency
      minPoolSize: 5,  // Keep at least 5 connections ready for zero-latency initial queries
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
      autoIndex: env.NODE_ENV !== 'production', // Prevent expensive index builds on every cold start in production
    });

    console.log(`[MongoDB] Successfully connected to host: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`[MongoDB] Connection failed: ${error.message}`);
    if (error.message?.includes('querySrv') || error.message?.includes('ECONNREFUSED')) {
      console.error(
        '[MongoDB Help] DNS SRV lookup failed. Verify MongoDB Atlas Network Access whitelist (0.0.0.0/0) and database connection string.'
      );
    }
  } finally {
    isConnecting = false;
  }
};


