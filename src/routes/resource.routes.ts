import { Router } from 'express';
import { param, query } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import * as resourceController from '../controllers/resource.controller';

const router = Router();

// GET /resources/bookmarked (must be before /:resourceId/...)
router.get('/bookmarked', authenticate, resourceController.getBookmarkedResources);

// GET /resources?category=&search=
router.get(
  '/',
  [query('category').optional().isString(), query('search').optional().isString()],
  validateRequest,
  resourceController.getAllResources
);

// POST /resources/:resourceId/bookmark
router.post(
  '/:resourceId/bookmark',
  authenticate,
  [param('resourceId').isMongoId()],
  validateRequest,
  resourceController.bookmarkResource
);

// DELETE /resources/:resourceId/bookmark
router.delete(
  '/:resourceId/bookmark',
  authenticate,
  [param('resourceId').isMongoId()],
  validateRequest,
  resourceController.removeBookmark
);

export default router;
