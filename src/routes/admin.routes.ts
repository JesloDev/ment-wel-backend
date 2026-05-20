import { Router } from 'express';
import { query } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// GET /admin/dashboard
router.get('/dashboard', adminController.getDashboardStats);

// GET /admin/users
router.get(
  '/users',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isString(),
  ],
  validateRequest,
  adminController.getAllUsers
);

export default router;
