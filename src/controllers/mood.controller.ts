import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { MoodEntry } from '../models/MoodEntry';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * POST /mood
 */
export const saveMoodEntry = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { mood, note, date } = req.body as { mood: number; note?: string; date: string };

  // Upsert by (user, date)
  const entry = await MoodEntry.findOneAndUpdate(
    { user: req.user.id, date },
    { $set: { mood, note } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: {
      id: entry._id,
      mood: entry.mood,
      note: entry.note,
      date: entry.date,
      createdAt: (entry as any).createdAt,
    },
  });
};

/**
 * GET /mood?days=N
 */
export const getMoodLogs = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const days = parseInt(String(req.query.days || '30'), 10) || 30;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const entries = await MoodEntry.find({
    user: req.user.id,
    date: { $gte: cutoffStr },
  })
    .sort({ date: -1 })
    .lean();

  const data = entries.map((e) => ({
    id: e._id,
    mood: e.mood,
    note: e.note,
    date: e.date,
    createdAt: (e as any).createdAt,
  }));

  res.status(StatusCodes.OK).json({ success: true, data });
};
