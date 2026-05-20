import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { ChatSession } from '../models/ChatSession';
import { ChatMessage, SenderType } from '../models/ChatMessage';
import { Therapist } from '../models/Therapist';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { UserRole } from '../types';

/**
 * GET /chat/sessions
 */
export const getChatSessions = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const filter =
    req.user.role === UserRole.THERAPIST
      ? { counselor: req.user.id }
      : { user: req.user.id };

  const sessions = await ChatSession.find(filter)
    .sort({ lastMessageAt: -1, startedAt: -1 })
    .lean();

  // Build counselor info + unread counts
  const counselorIds = sessions.map((s) => s.counselor);
  const therapists = await Therapist.find({ user: { $in: counselorIds } }).lean();
  const therapistByUserId: Record<string, any> = {};
  therapists.forEach((t) => {
    if (t.user) therapistByUserId[String(t.user)] = t;
  });

  const sessionIds = sessions.map((s) => s._id);
  const unreadCounts = await ChatMessage.aggregate([
    {
      $match: {
        session: { $in: sessionIds },
        senderType: req.user.role === UserRole.THERAPIST ? 'user' : 'counselor',
        read: false,
      },
    },
    { $group: { _id: '$session', count: { $sum: 1 } } },
  ]);
  const unreadMap: Record<string, number> = {};
  unreadCounts.forEach((u) => (unreadMap[String(u._id)] = u.count));

  const data = sessions.map((s) => {
    const therapist = therapistByUserId[String(s.counselor)];
    return {
      id: s._id,
      userId: s.user,
      counselorId: s.counselor,
      status: s.status,
      startedAt: s.startedAt,
      lastMessageAt: s.lastMessageAt,
      counselor: therapist
        ? {
            id: therapist._id,
            name: `${therapist.first_name} ${therapist.last_name}`,
            avatar: therapist.profile_image,
            isOnline: !!therapist.isOnline,
          }
        : { id: s.counselor, name: 'Counselor', isOnline: false },
      unreadCount: unreadMap[String(s._id)] || 0,
      lastMessage: s.lastMessage,
    };
  });

  res.status(StatusCodes.OK).json({ success: true, data });
};

/**
 * Helper: assert user is participant in session
 */
const assertParticipant = async (sessionId: string, userId: string) => {
  const session = await ChatSession.findById(sessionId);
  if (!session) throw ApiError.notFound('Session not found');
  const isParticipant =
    String(session.user) === userId || String(session.counselor) === userId;
  if (!isParticipant) throw ApiError.forbidden('Not a participant of this session');
  return session;
};

/**
 * GET /chat/sessions/:sessionId/messages
 */
export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await assertParticipant(req.params.sessionId, req.user.id);

  const messages = await ChatMessage.find({ session: req.params.sessionId })
    .sort({ timestamp: 1 })
    .lean();

  const data = messages.map((m) => ({
    id: m._id,
    sessionId: m.session,
    senderId: m.sender,
    senderType: m.senderType,
    content: m.content,
    timestamp: m.timestamp,
    read: m.read,
    type: m.type,
  }));

  res.status(StatusCodes.OK).json({ success: true, data });
};

/**
 * POST /chat/sessions/:sessionId/messages
 */
export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const session = await assertParticipant(req.params.sessionId, req.user.id);

  const { content, type } = req.body as { content: string; type?: 'text' | 'image' | 'file' };
  if (!content) throw ApiError.badRequest('content is required');

  const senderType: SenderType =
    req.user.role === UserRole.THERAPIST ? 'counselor' : 'user';

  const message = await ChatMessage.create({
    session: session._id,
    sender: req.user.id,
    senderType,
    content,
    type: type || 'text',
    read: false,
    timestamp: new Date(),
  });

  session.lastMessage = content;
  session.lastMessageAt = new Date();
  await session.save();

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      id: message._id,
      sessionId: message.session,
      senderId: message.sender,
      senderType: message.senderType,
      content: message.content,
      timestamp: message.timestamp,
      read: message.read,
      type: message.type,
    },
  });
};

/**
 * POST /chat/sessions
 */
export const startChatSession = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { counselorId } = req.body as { counselorId: string };
  if (!counselorId || !Types.ObjectId.isValid(counselorId)) {
    throw ApiError.badRequest('Valid counselorId is required');
  }

  const session = await ChatSession.create({
    user: req.user.id,
    counselor: counselorId,
    status: 'active',
    startedAt: new Date(),
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    data: {
      id: session._id,
      userId: session.user,
      counselorId: session.counselor,
      status: session.status,
      startedAt: session.startedAt,
    },
  });
};

/**
 * POST /chat/sessions/:sessionId/end
 */
export const endChatSession = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const session = await assertParticipant(req.params.sessionId, req.user.id);
  session.status = 'ended';
  session.endedAt = new Date();
  await session.save();
  res.status(StatusCodes.OK).json({ success: true, message: 'Session ended' });
};

/**
 * POST /chat/sessions/:sessionId/read
 */
export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await assertParticipant(req.params.sessionId, req.user.id);

  // Mark messages from the OTHER party as read
  const otherSenderType: SenderType =
    req.user.role === UserRole.THERAPIST ? 'user' : 'counselor';

  await ChatMessage.updateMany(
    { session: req.params.sessionId, senderType: otherSenderType, read: false },
    { $set: { read: true } }
  );

  res.status(StatusCodes.OK).json({ success: true, message: 'Messages marked as read' });
};

/**
 * GET /chat/counselors/available
 */
export const getAvailableCounselors = async (_req: AuthenticatedRequest, res: Response) => {
  const therapists = await Therapist.find({ availability: true }).lean();
  const data = therapists.map((t) => ({
    id: t._id,
    name: `${t.first_name} ${t.last_name}`,
    avatar: t.profile_image,
    isOnline: !!t.isOnline,
    lastSeen: t.lastSeen,
    specialties: t.specializations,
    rating: t.rating,
    experience: t.experience_years,
  }));
  res.status(StatusCodes.OK).json({ success: true, data });
};
