import { logger } from '../../utils/logger';

export interface IEmbeddingCache {
  get(checksum: string, modelName: string): Promise<number[] | null>;
  set(checksum: string, modelName: string, embedding: number[]): Promise<void>;
  getStats(): { hits: number; misses: number };
}

export class InMemoryEmbeddingCache implements IEmbeddingCache {
  private cache = new Map<string, number[]>();
  private hits = 0;
  private misses = 0;

  public async get(checksum: string, modelName: string): Promise<number[] | null> {
    const key = `${modelName}:${checksum}`;
    const cached = this.cache.get(key);

    if (cached) {
      this.hits++;
      logger.debug({ checksum, modelName }, 'Embedding cache HIT');
      return cached;
    }

    this.misses++;
    return null;
  }

  public async set(checksum: string, modelName: string, embedding: number[]): Promise<void> {
    const key = `${modelName}:${checksum}`;
    this.cache.set(key, embedding);
  }

  public getStats(): { hits: number; misses: number } {
    return { hits: this.hits, misses: this.misses };
  }
}

export const defaultEmbeddingCache = new InMemoryEmbeddingCache();
