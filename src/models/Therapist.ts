import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITherapist extends Document {
  user?: Types.ObjectId;
  first_name: string;
  last_name: string;
  email: string;
  specializations: string[];
  bio: string;
  experience_years: number;
  rating: number;
  availability: boolean;
  profile_image?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

const TherapistSchema = new Schema<ITherapist>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    specializations: { type: [String], default: [] },
    bio: { type: String, default: '' },
    experience_years: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    availability: { type: Boolean, default: true },
    profile_image: { type: String },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date },
  },
  { timestamps: true }
);

TherapistSchema.index({ first_name: 'text', last_name: 'text', specializations: 'text', bio: 'text' });

export const Therapist = mongoose.model<ITherapist>('Therapist', TherapistSchema);
