import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import os from 'os';
import { User } from '../models/User';
import { TherapySession } from '../models/TherapySession';
import { AssessmentResult } from '../models/AssessmentResult';
import { UserStatus } from '../types';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * GET /admin/dashboard
 */
export const getDashboardStats = async (_req: AuthenticatedRequest, res: Response) => {
  const [totalUsers, activeUsers, totalSessions, totalAssessments] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: UserStatus.ACTIVE }),
    TherapySession.countDocuments(),
    AssessmentResult.countDocuments(),
  ]);

  // User growth (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const growthRaw = await User.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const userGrowth = growthRaw.map((g) => ({ date: g._id, count: g.count }));

  // Simple platform health metrics
  const loadAvg = typeof os.loadavg === 'function' ? os.loadavg()[0] : 0;
  const platformHealth = {
    serverStatus: 'ok',
    responseTime: Math.round(loadAvg * 100), // proxy metric
    errorRate: 0,
  };

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      totalSessions,
      totalAssessments,
      userGrowth,
      platformHealth,
    },
  });
};

/**
 * GET /admin/users?page=&limit=&status=
 */
export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
  const { status } = req.query as { status?: string };

  const filter: any = {};
  if (status) filter.status = status;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
};
