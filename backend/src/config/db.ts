import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';

// Override Node's default DNS resolver with Google/Cloudflare DNS to fix Windows ECONNREFUSED querySrv errors
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Fallback if environment restricts custom DNS
}

let isConnecting = false;

export const connectDB = async (): Promise<void> => {
  // If already connected, reuse existing connection (crucial for fast response times and serverless environments)
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (isConnecting) {
    return;
  }

  try {
    isConnecting = true;

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Warning: Connection lost.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error event:', err.message);
    });

    const conn = await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 20, // Maintain up to 20 socket connections for high concurrency
      minPoolSize: 5,  // Keep at least 5 connections ready for zero-latency initial queries
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
      autoIndex: env.NODE_ENV !== 'production', // Prevent expensive index builds on every cold start in production
    });
    console.log(`[MongoDB] Successfully connected to host: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`[MongoDB] Connection failed: ${error.message}`);
    if (error.message?.includes('querySrv') || error.message?.includes('ECONNREFUSED')) {
      console.error('[MongoDB Help] DNS SRV lookup failed. Attempting alternative connection configuration.');
    }
  } finally {
    isConnecting = false;
  }
};

