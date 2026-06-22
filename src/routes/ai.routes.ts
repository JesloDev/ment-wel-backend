import { Router } from 'express';
import { handleChat } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protected endpoint — frontend must call backend
router.post('/chat', authenticate, handleChat);

export default router;
