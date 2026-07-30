import { GoogleGenerativeAI } from '@google/generative-ai';
import { IEmbeddingProvider } from './IEmbeddingProvider';
import { env } from '../../config/env.config';
import { RAG_CONFIG } from '../../constants/rag.constants';
import { EmbeddingError } from '../../errors/IngestionErrors';
import { logger } from '../../utils/logger';

export class GeminiEmbeddingProvider implements IEmbeddingProvider {
  private ai: GoogleGenerativeAI;
  private modelName = RAG_CONFIG.EMBEDDING_MODEL;
  private dimension = RAG_CONFIG.EMBEDDING_DIMENSION;

  constructor() {
    if (!env.GEMINI_API_KEY) {
      throw new EmbeddingError('Google Gemini API Key is missing. Please configure GEMINI_API_KEY in backend .env');
    }
    this.ai = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    try {
      const model = this.ai.getGenerativeModel({ model: this.modelName });
      const response = await model.embedContent({
        content: { parts: [{ text }], role: 'user' },
        outputDimensionality: this.dimension,
      } as any);

      if (!response.embedding?.values) {
        throw new EmbeddingError('Gemini Embedding API returned empty embedding values.');
      }

      return response.embedding.values;
    } catch (err: any) {
      logger.error({ err }, 'Google Gemini Embedding API call failed.');
      throw new EmbeddingError(
        err.message?.includes('API_KEY')
          ? 'Google Gemini API Key is invalid or expired. Please check GEMINI_API_KEY in backend .env'
          : `Google Gemini Embedding API failed: ${err.message || 'Unknown API error'}`
      );
    }
  }

  public async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.generateEmbedding(t)));
  }

  public getDimension(): number {
    return this.dimension;
  }

  public getModelName(): string {
    return this.modelName;
  }
}
