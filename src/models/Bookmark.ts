import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBookmark extends Document {
  user: Types.ObjectId;
  resource: Types.ObjectId;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resource: { type: Schema.Types.ObjectId, ref: 'Resource', required: true },
  },
  { timestamps: true }
);

BookmarkSchema.index({ user: 1, resource: 1 }, { unique: true });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
