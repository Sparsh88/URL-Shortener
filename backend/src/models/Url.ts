import mongoose, { Schema, Document } from 'mongoose';

export interface IUrl extends Document {
  originalUrl: string;
  shortCode: string;
  customAlias?: string;
  title?: string;
  description?: string;
  userId?: mongoose.Types.ObjectId;
  isPrivate: boolean;
  isFavorite: boolean;
  password?: string;
  expiresAt?: Date;
  oneTime: boolean;
  clickCount: number;
  uniqueClickCount: number;
  tags: string[];
  folderId?: mongoose.Types.ObjectId;
  isActive: boolean;
  qrCodeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UrlSchema = new Schema<IUrl>(
  {
    originalUrl: { type: String, required: true, trim: true },
    shortCode: { type: String, required: true, unique: true, index: true, trim: true },
    customAlias: { type: String, unique: true, sparse: true, trim: true },
    title: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    isPrivate: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    password: { type: String, select: false },
    expiresAt: { type: Date },
    oneTime: { type: Boolean, default: false },
    clickCount: { type: Number, default: 0, index: true },
    uniqueClickCount: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
    folderId: { type: Schema.Types.ObjectId, ref: 'Folder' },
    isActive: { type: Boolean, default: true },
    qrCodeUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

UrlSchema.index({ userId: 1, createdAt: -1 });
UrlSchema.index({ userId: 1, clickCount: -1 });
UrlSchema.index({ userId: 1, isFavorite: 1, createdAt: -1 });
UrlSchema.index({ userId: 1, folderId: 1 });
UrlSchema.index({ userId: 1, tags: 1 });
UrlSchema.index({ userId: 1, isActive: 1 });
UrlSchema.index({ tags: 1 });

export const Url = mongoose.model<IUrl>('Url', UrlSchema);
