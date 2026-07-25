import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  urlId: mongoose.Types.ObjectId;
  shortCode: string;
  ip: string;
  userAgent: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Other';
  os: string;
  browser: string;
  country: string;
  city: string;
  referrer: string;
  trafficSource: 'Direct' | 'Social' | 'Search' | 'Email' | 'Referral';
  isUnique: boolean;
  timestamp: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    urlId: { type: Schema.Types.ObjectId, ref: 'Url', required: true, index: true },
    shortCode: { type: String, required: true, index: true },
    ip: { type: String, required: true },
    userAgent: { type: String, default: '' },
    deviceType: { type: String, enum: ['Desktop', 'Mobile', 'Tablet', 'Other'], default: 'Desktop' },
    os: { type: String, default: 'Unknown OS' },
    browser: { type: String, default: 'Unknown Browser' },
    country: { type: String, default: 'Unknown' },
    city: { type: String, default: 'Unknown' },
    referrer: { type: String, default: 'Direct' },
    trafficSource: { type: String, enum: ['Direct', 'Social', 'Search', 'Email', 'Referral'], default: 'Direct' },
    isUnique: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

AnalyticsSchema.index({ urlId: 1, timestamp: -1 });

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
