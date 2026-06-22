import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sendChatToGroq, ChatMessage } from '../services/ai.service';
import { logger } from '../utils/logger';

/**
 * POST /ai/chat
 * body: { messages: [{ role, content }], model?: string }
 */
export const handleChat = async (req: Request, res: Response) => {
  try {
    const { messages, model } = req.body as { messages: ChatMessage[]; model?: string };
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: 'messages are required' });
    }

    // Pass through to Groq service
    const result = await sendChatToGroq(messages, model);

    // Return in a stable structure expected by frontend
    return res.status(StatusCodes.OK).json({ success: true, data: result });
  } catch (err) {
    const message = (err as Error).message || 'AI chat failed';
    logger.error('AI chat error', { error: message });

    // Network/DNS errors when contacting Groq should be surfaced as 502 Bad Gateway
    if (message.includes('getaddrinfo') || message.includes('ENOTFOUND') || message.includes('ECONNREFUSED') || message.includes('ENETUNREACH')) {
      return res.status(StatusCodes.BAD_GATEWAY).json({ success: false, error: `Unable to reach Groq API: ${message}` });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: message });
  }
};

export default { handleChat };
