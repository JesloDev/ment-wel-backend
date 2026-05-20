import mongoose, { Schema, Document, Types } from 'mongoose';

export type ChatSessionStatus = 'active' | 'ended' | 'pending';

export interface IChatSession extends Document {
  user: Types.ObjectId;
  counselor: Types.ObjectId;
  status: ChatSessionStatus;
  startedAt: Date;
  endedAt?: Date;
  lastMessageAt?: Date;
  lastMessage?: string;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    counselor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'ended', 'pending'],
      default: 'active',
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    lastMessageAt: { type: Date },
    lastMessage: { type: String },
  },
  { timestamps: true }
);

export const ChatSession = mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);
