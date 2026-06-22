import fetch from 'node-fetch';
import { logger } from '../utils/logger';

const GROQ_BASE = process.env.GROQ_API_BASE || 'https://api.groq.ai/v1';
const GROQ_KEY = process.env.GROQ_API_KEY;

if (!GROQ_KEY) {
  logger.warn('GROQ_API_KEY not set; AI endpoints will fail until configured');
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const sendChatToGroq = async (messages: ChatMessage[], model = 'gpt-4o-mini') => {
  if (!GROQ_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const url = `${GROQ_BASE}/chat/completions`;
  const body = {
    model,
    messages,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      logger.error('Groq API error', { status: res.status, body: text });
      throw new Error(`Groq API responded with ${res.status}: ${text}`);
    }

    const json = await res.json();
    return json;
  } catch (err) {
    logger.error('Error sending chat to Groq', { error: (err as Error).message });
    throw err;
  }
};

export default { sendChatToGroq };
