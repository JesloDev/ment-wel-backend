import { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware';
import * as assessmentController from '../controllers/assessment.controller';

const router = Router();

// GET /assessments
router.get('/', assessmentController.getAllAssessments);

// GET /assessments/history (must be before /:id)
router.get('/history', assessmentController.getAssessmentHistory);

// GET /assessments/results/:resultId (must be before /:id)
router.get(
  '/results/:resultId',
  [param('resultId').isMongoId().withMessage('Invalid result id')],
  validateRequest,
  assessmentController.getAssessmentResultById
);

// GET /assessments/:id
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid assessment id')],
  validateRequest,
  assessmentController.getAssessmentById
);

// POST /assessments/:assessmentId/submit
router.post(
  '/:assessmentId/submit',
  [
    param('assessmentId').isMongoId().withMessage('Invalid assessment id'),
    body('answers').isObject().withMessage('answers must be an object'),
  ],
  validateRequest,
  assessmentController.submitAssessment
);

export default router;
