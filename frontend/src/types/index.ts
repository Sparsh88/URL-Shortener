export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  avatar?: string;
  createdAt?: string;
}

export interface Folder {
  _id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Tag {
  _id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface UrlItem {
  _id: string;
  originalUrl: string;
  shortCode: string;
  customAlias?: string;
  title?: string;
  description?: string;
  userId?: string;
  isPrivate: boolean;
  isFavorite: boolean;
  hasPassword?: boolean;
  expiresAt?: string;
  oneTime: boolean;
  clickCount: number;
  uniqueClickCount: number;
  tags: string[];
  folderId?: Folder | string;
  isActive: boolean;
  qrCodeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKeyItem {
  _id: string;
  name: string;
  key: string;
  lastUsed?: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalClicks: number;
  uniqueClicks: number;
}

export interface TimelineData {
  date: string;
  clicks: number;
  uniques: number;
}

export interface DistributionData {
  name: string;
  count: number;
}

export interface GeoData {
  country: string;
  count: number;
}

export interface ReferrerData {
  referrer: string;
  count: number;
}

export interface UrlAnalyticsResponse {
  url: UrlItem;
  summary: AnalyticsSummary;
  timeline: TimelineData[];
  devices: DistributionData[];
  browsers: DistributionData[];
  os: DistributionData[];
  countries: GeoData[];
  trafficSources: DistributionData[];
  referrers: ReferrerData[];
}

export interface OverallAnalyticsResponse {
  totalLinks: number;
  totalClicks: number;
  uniqueClicks: number;
  activeLinks: number;
  topLinks: UrlItem[];
  timeline: TimelineData[];
}

export interface AdminStatsResponse {
  totalUsers: number;
  totalLinks: number;
  totalClicks: number;
  topUsers: Array<{
    _id: string;
    linkCount: number;
    totalClicks: number;
    name: string;
    email: string;
    role: string;
  }>;
  topLinks: UrlItem[];
  recentUsers: User[];
}
