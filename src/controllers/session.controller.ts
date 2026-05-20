import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TherapySession } from '../models/TherapySession';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const serialize = (s: any) => ({
  id: s._id,
  user_id: s.user_id,
  therapist_id: s.therapist_id,
  scheduled_at: s.scheduled_at,
  duration: s.duration,
  session_type: s.session_type,
  status: s.status,
  notes: s.notes,
});

/**
 * GET /sessions
 */
export const getUserSessions = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const sessions = await TherapySession.find({ user_id: req.user.id })
    .sort({ scheduled_at: -1 })
    .lean();
  res.status(StatusCodes.OK).json({ success: true, data: sessions.map(serialize) });
};

/**
 * GET /sessions/:id
 */
export const getSessionById = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const session = await TherapySession.findOne({
    _id: req.params.id,
    user_id: req.user.id,
  }).lean();
  if (!session) throw ApiError.notFound('Session not found');
  res.status(StatusCodes.OK).json({ success: true, data: serialize(session) });
};

/**
 * POST /sessions
 */
export const createSession = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { therapist_id, scheduled_at, duration, session_type } = req.body;

  const session = await TherapySession.create({
    user_id: req.user.id,
    therapist_id,
    scheduled_at,
    duration: duration || 60,
    session_type: session_type || 'video',
    status: 'scheduled',
  });

  res.status(StatusCodes.CREATED).json({ success: true, data: serialize(session) });
};

/**
 * PATCH /sessions/:id/cancel
 */
export const cancelSession = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const session = await TherapySession.findOne({
    _id: req.params.id,
    user_id: req.user.id,
  });
  if (!session) throw ApiError.notFound('Session not found');
  session.status = 'cancelled';
  await session.save();
  res.status(StatusCodes.OK).json({ success: true, message: 'Session cancelled' });
};

/**
 * PATCH /sessions/:id/complete
 */
export const completeSession = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { notes } = req.body as { notes?: string };
  const session = await TherapySession.findOne({
    _id: req.params.id,
    user_id: req.user.id,
  });
  if (!session) throw ApiError.notFound('Session not found');
  session.status = 'completed';
  if (notes) session.notes = notes;
  await session.save();
  res.status(StatusCodes.OK).json({ success: true, message: 'Session completed' });
};
