import mongoose, { Schema, Document } from 'mongoose';

export type ResourceType = 'article' | 'video' | 'podcast' | 'guide';

export interface IResource extends Document {
  title: string;
  description: string;
  category: string;
  type: ResourceType;
  url: string;
  thumbnail?: string;
  duration?: string;
  author?: string;
  tags: string[];
}

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['article', 'video', 'podcast', 'guide'],
      required: true,
    },
    url: { type: String, required: true },
    thumbnail: { type: String },
    duration: { type: String },
    author: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

ResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Resource = mongoose.model<IResource>('Resource', ResourceSchema);
