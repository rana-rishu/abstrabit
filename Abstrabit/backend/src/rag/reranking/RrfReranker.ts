import { IReranker } from '../interfaces/IReranker';
import { ScoredChunk } from '../interfaces/IRetriever';

export class RrfReranker implements IReranker {
  private kConstant: number;

  constructor(kConstant = 60) {
    this.kConstant = kConstant;
  }

  public rerank(
    vectorResults: ScoredChunk[],
    keywordResults: ScoredChunk[],
    topK = 10,
  ): ScoredChunk[] {
    const chunkMap = new Map<string, ScoredChunk>();

    // 1. Accumulate vector search ranks
    vectorResults.forEach((chunk, index) => {
      const vRank = index + 1;
      const rrfScore = 1.0 / (this.kConstant + vRank);
      chunkMap.set(chunk.id, {
        ...chunk,
        vectorRank: vRank,
        vectorSimilarity: chunk.similarity,
        fusionScore: rrfScore,
      });
    });

    // 2. Accumulate keyword search ranks
    keywordResults.forEach((chunk, index) => {
      const kRank = index + 1;
      const kRrf = 1.0 / (this.kConstant + kRank);

      if (chunkMap.has(chunk.id)) {
        const existing = chunkMap.get(chunk.id)!;
        existing.keywordRank = kRank;
        existing.fusionScore = (existing.fusionScore || 0) + kRrf;
      } else {
        chunkMap.set(chunk.id, {
          ...chunk,
          keywordRank: kRank,
          vectorSimilarity: chunk.similarity || 0.5,
          fusionScore: kRrf,
        });
      }
    });

    // 3. Sort by Reciprocal Rank Fusion Score descending
    const sorted = Array.from(chunkMap.values()).sort(
      (a, b) => (b.fusionScore || 0) - (a.fusionScore || 0),
    );

    // 4. Assign explicit retrievalRank (#1, #2, #3...)
    const finalCandidates = sorted.slice(0, topK).map((item, idx) => ({
      ...item,
      retrievalRank: idx + 1,
    }));

    return finalCandidates;
  }
}
