import { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware';
import * as chatController from '../controllers/chat.controller';

const router = Router();

// GET /chat/counselors/available (must be before /:sessionId routes)
router.get('/counselors/available', chatController.getAvailableCounselors);

// GET /chat/sessions
router.get('/sessions', chatController.getChatSessions);

// POST /chat/sessions
router.post(
  '/sessions',
  [body('counselorId').isMongoId().withMessage('Valid counselorId is required')],
  validateRequest,
  chatController.startChatSession
);

// GET /chat/sessions/:sessionId/messages
router.get(
  '/sessions/:sessionId/messages',
  [param('sessionId').isMongoId()],
  validateRequest,
  chatController.getMessages
);

// POST /chat/sessions/:sessionId/messages
router.post(
  '/sessions/:sessionId/messages',
  [
    param('sessionId').isMongoId(),
    body('content').isString().notEmpty().withMessage('content is required'),
    body('type').optional().isIn(['text', 'image', 'file']),
  ],
  validateRequest,
  chatController.sendMessage
);

// POST /chat/sessions/:sessionId/end
router.post(
  '/sessions/:sessionId/end',
  [param('sessionId').isMongoId()],
  validateRequest,
  chatController.endChatSession
);

// POST /chat/sessions/:sessionId/read
router.post(
  '/sessions/:sessionId/read',
  [param('sessionId').isMongoId()],
  validateRequest,
  chatController.markAsRead
);

export default router;
