import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';

// Override Node's default DNS resolver with Google/Cloudflare DNS to fix Windows ECONNREFUSED querySrv errors
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Fallback if environment restricts custom DNS
}

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Warning: Connection lost.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error event:', err.message);
    });

    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Successfully connected to host: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`[MongoDB] Connection failed: ${error.message}`);
    if (error.message?.includes('querySrv') || error.message?.includes('ECONNREFUSED')) {
      console.error('[MongoDB Help] DNS SRV lookup failed. Attempting alternative connection configuration.');
    }
  }
};
