import mongoose, { Schema, Document, Types } from 'mongoose';

export type SessionType = 'text' | 'voice' | 'video';
export type TherapySessionStatus = 'scheduled' | 'completed' | 'cancelled';

export interface ITherapySession extends Document {
  user_id: Types.ObjectId;
  therapist_id: Types.ObjectId;
  scheduled_at: Date;
  duration: number; // minutes
  session_type: SessionType;
  status: TherapySessionStatus;
  notes?: string;
}

const TherapySessionSchema = new Schema<ITherapySession>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    therapist_id: { type: Schema.Types.ObjectId, ref: 'Therapist', required: true, index: true },
    scheduled_at: { type: Date, required: true },
    duration: { type: Number, default: 60 },
    session_type: { type: String, enum: ['text', 'voice', 'video'], default: 'video' },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const TherapySession = mongoose.model<ITherapySession>(
  'TherapySession',
  TherapySessionSchema
);
