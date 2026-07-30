import { IEmbeddingProvider } from './IEmbeddingProvider';
import { GeminiEmbeddingProvider } from './GeminiEmbeddingProvider';
import { env } from '../../config/env.config';
import { EmbeddingError } from '../../errors/IngestionErrors';

export class EmbeddingProviderFactory {
  private static instance: IEmbeddingProvider;

  public static getProvider(): IEmbeddingProvider {
    if (!this.instance) {
      if (!env.GEMINI_API_KEY) {
        throw new EmbeddingError('Google Gemini API Key is missing. Please configure GEMINI_API_KEY in backend .env');
      }
      this.instance = new GeminiEmbeddingProvider();
    }
    return this.instance;
  }
}
