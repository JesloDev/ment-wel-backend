import { Router } from 'express';
import { param, query } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware';
import * as therapistController from '../controllers/therapist.controller';

const router = Router();

// GET /therapists/search?q=
router.get(
  '/search',
  [query('q').optional().isString()],
  validateRequest,
  therapistController.searchTherapists
);

// GET /therapists/filter
router.get('/filter', therapistController.filterTherapists);

// GET /therapists
router.get('/', therapistController.getAllTherapists);

// GET /therapists/:id
router.get(
  '/:id',
  [param('id').isMongoId()],
  validateRequest,
  therapistController.getTherapistById
);

export default router;
