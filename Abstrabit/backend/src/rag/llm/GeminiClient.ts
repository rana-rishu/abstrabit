import { GoogleGenerativeAI } from '@google/generative-ai';
import { ILLMClient, LLMResponse } from '../interfaces/ILLMClient';
import { env } from '../../config/env.config';
import { RAG_CONFIG } from '../../constants/rag.constants';
import { LLMProviderError } from '../../errors/RagErrors';
import { logger } from '../../utils/logger';

export class GeminiClient implements ILLMClient {
  private ai: GoogleGenerativeAI;
  private modelName = RAG_CONFIG.CHAT_MODEL;

  constructor() {
    if (!env.GEMINI_API_KEY) {
      throw new LLMProviderError('Google Gemini API Key is missing. Please configure GEMINI_API_KEY in backend .env');
    }
    this.ai = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  public async generateResponse(
    systemInstruction: string,
    userPayload: string,
  ): Promise<LLMResponse> {
    const t0 = Date.now();

    try {
      const model = this.ai.getGenerativeModel({
        model: this.modelName,
        systemInstruction,
      });

      const response = await model.generateContent(userPayload);
      const durationMs = Date.now() - t0;
      const text = response.response.text() || RAG_CONFIG.REFUSAL_MESSAGE;

      const promptTokens = Math.ceil((systemInstruction.length + userPayload.length) / 4);
      const completionTokens = Math.ceil(text.length / 4);

      return {
        text,
        finishReason: 'STOP',
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
        durationMs,
      };
    } catch (err: any) {
      logger.error({ err }, 'Google Gemini API call failed.');
      throw new LLMProviderError(
        err.message?.includes('API_KEY')
          ? 'Google Gemini API Key is invalid or expired. Please check GEMINI_API_KEY in backend .env'
          : `Google Gemini LLM API failed: ${err.message || 'Unknown API error'}`
      );
    }
  }

  public getModelName(): string {
    return this.modelName;
  }
}
