import mongoose, { Schema, Document, Types } from 'mongoose';

export type ChatMessageType = 'text' | 'image' | 'file';
export type SenderType = 'user' | 'counselor';

export interface IChatMessage extends Document {
  session: Types.ObjectId;
  sender: Types.ObjectId;
  senderType: SenderType;
  content: string;
  type: ChatMessageType;
  read: boolean;
  timestamp: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    session: { type: Schema.Types.ObjectId, ref: 'ChatSession', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderType: { type: String, enum: ['user', 'counselor'], required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
