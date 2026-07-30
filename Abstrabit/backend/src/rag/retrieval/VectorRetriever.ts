import { IVectorRetriever, ScoredChunk } from '../interfaces/IRetriever';
import { IChunkRepository } from '../../repositories/interfaces/IChunkRepository';
import { ChunkRepository } from '../../repositories/ChunkRepository';

export class VectorRetriever implements IVectorRetriever {
  private chunkRepo: IChunkRepository;

  constructor(chunkRepo?: IChunkRepository) {
    this.chunkRepo = chunkRepo || new ChunkRepository();
  }

  public async retrieveVector(
    workspaceId: string,
    queryEmbedding: number[],
    limit = 20,
  ): Promise<ScoredChunk[]> {
    // Enforces strict workspace isolation at the SQL query layer
    const results = await this.chunkRepo.searchVector(workspaceId, queryEmbedding, limit);
    return results.map((chunk, index) => ({
      ...chunk,
      vectorRank: index + 1,
    }));
  }
}
