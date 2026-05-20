import { Router } from 'express';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware';
import * as moodController from '../controllers/mood.controller';

const router = Router();

// POST /mood
router.post(
  '/',
  [
    body('mood').isInt({ min: 1, max: 5 }).withMessage('mood must be between 1 and 5'),
    body('note').optional().isString(),
    body('date')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('date must be YYYY-MM-DD'),
  ],
  validateRequest,
  moodController.saveMoodEntry
);

// GET /mood?days=30
router.get(
  '/',
  [query('days').optional().isInt({ min: 1, max: 365 })],
  validateRequest,
  moodController.getMoodLogs
);

export default router;
