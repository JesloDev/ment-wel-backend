import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Assessment } from '../models/Assessment';
import { AssessmentResult, Severity } from '../models/AssessmentResult';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * GET /assessments
 */
export const getAllAssessments = async (_req: AuthenticatedRequest, res: Response) => {
  const assessments = await Assessment.find().lean();
  res.status(StatusCodes.OK).json({ success: true, data: assessments });
};

/**
 * GET /assessments/history
 * IMPORTANT: must come before /:id route
 */
export const getAssessmentHistory = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const results = await AssessmentResult.find({ user: req.user.id })
    .sort({ completedAt: -1 })
    .lean();
  res.status(StatusCodes.OK).json({ success: true, data: results });
};

/**
 * GET /assessments/results/:resultId
 */
export const getAssessmentResultById = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const result = await AssessmentResult.findOne({
    _id: req.params.resultId,
    user: req.user.id,
  }).lean();
  if (!result) throw ApiError.notFound('Result not found');
  res.status(StatusCodes.OK).json({ success: true, data: result });
};

/**
 * GET /assessments/:id
 */
export const getAssessmentById = async (req: AuthenticatedRequest, res: Response) => {
  const assessment = await Assessment.findById(req.params.id).lean();
  if (!assessment) throw ApiError.notFound('Assessment not found');
  res.status(StatusCodes.OK).json({ success: true, data: assessment });
};

/**
 * Determine severity based on percentage scored
 */
const computeSeverity = (percentage: number): Severity => {
  if (percentage < 25) return 'minimal';
  if (percentage < 50) return 'mild';
  if (percentage < 75) return 'moderate';
  return 'severe';
};

const interpretationMap: Record<Severity, string> = {
  minimal: 'Your results suggest minimal symptoms.',
  mild: 'Your results suggest mild symptoms. Consider self-care strategies.',
  moderate: 'Your results suggest moderate symptoms. Speaking with a counselor may help.',
  severe: 'Your results suggest severe symptoms. We strongly recommend professional support.',
};

const recommendationsMap: Record<Severity, string[]> = {
  minimal: ['Continue with healthy habits', 'Practice gratitude journaling'],
  mild: ['Try guided breathing exercises', 'Maintain a consistent sleep schedule'],
  moderate: ['Consider booking a session with a therapist', 'Explore mindfulness resources'],
  severe: ['Book a therapy session as soon as possible', 'Reach out to a crisis support line if needed'],
};

/**
 * POST /assessments/:assessmentId/submit
 */
export const submitAssessment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) throw ApiError.unauthorized();
    const { assessmentId } = req.params;
    const { answers } = req.body as { answers: Record<string, number> };

    if (!answers || typeof answers !== 'object') {
      throw ApiError.badRequest('Invalid answers');
    }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) throw ApiError.notFound('Assessment not found');

    // Compute score
    let score = 0;
    let maxScore = 0;
    for (const q of assessment.questions) {
      const maxForQ = q.options.reduce((m, o) => Math.max(m, o.value), 0);
      maxScore += maxForQ;
      const userAnswer = answers[q.id];
      if (typeof userAnswer === 'number') {
        score += userAnswer;
      }
    }

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const severity = computeSeverity(percentage);

    const result = await AssessmentResult.create({
      user: req.user.id,
      assessment: assessment._id,
      assessmentTitle: assessment.title,
      answers,
      score,
      maxScore,
      percentage,
      severity,
      interpretation: interpretationMap[severity],
      recommendations: recommendationsMap[severity],
      completedAt: new Date(),
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        id: result._id,
        assessmentId: assessment._id,
        assessmentTitle: assessment.title,
        score,
        maxScore,
        percentage,
        severity,
        interpretation: result.interpretation,
        recommendations: result.recommendations,
        completedAt: result.completedAt,
      },
    });
  } catch (error) {
    logger.error('Submit assessment error:', error);
    throw error;
  }
};
