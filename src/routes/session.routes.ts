import { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware';
import * as sessionController from '../controllers/session.controller';

const router = Router();

// GET /sessions
router.get('/', sessionController.getUserSessions);

// GET /sessions/:id
router.get(
  '/:id',
  [param('id').isMongoId()],
  validateRequest,
  sessionController.getSessionById
);

// POST /sessions
router.post(
  '/',
  [
    body('therapist_id').isMongoId().withMessage('Valid therapist_id is required'),
    body('scheduled_at').isISO8601().withMessage('Valid scheduled_at ISO date is required'),
    body('duration').optional().isInt({ min: 5, max: 600 }),
    body('session_type').optional().isIn(['text', 'voice', 'video']),
  ],
  validateRequest,
  sessionController.createSession
);

// PATCH /sessions/:id/cancel
router.patch(
  '/:id/cancel',
  [param('id').isMongoId()],
  validateRequest,
  sessionController.cancelSession
);

// PATCH /sessions/:id/complete
router.patch(
  '/:id/complete',
  [param('id').isMongoId(), body('notes').optional().isString()],
  validateRequest,
  sessionController.completeSession
);

export default router;
