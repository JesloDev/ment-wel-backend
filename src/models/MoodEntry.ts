import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMoodEntry extends Document {
  user: Types.ObjectId;
  mood: number; // 1-5
  note?: string;
  date: string; // YYYY-MM-DD
}

const MoodEntrySchema = new Schema<IMoodEntry>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mood: { type: Number, required: true, min: 1, max: 5 },
    note: { type: String },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
  },
  { timestamps: true }
);

MoodEntrySchema.index({ user: 1, date: 1 }, { unique: true });

export const MoodEntry = mongoose.model<IMoodEntry>('MoodEntry', MoodEntrySchema);
