import { IContextCompressor, CompressedContext } from '../interfaces/IContextCompressor';
import { ScoredChunk } from '../interfaces/IRetriever';

export class ContextCompressor implements IContextCompressor {
  private maxTokens: number;

  constructor(maxTokens = 3500) {
    this.maxTokens = maxTokens;
  }

  public compress(chunks: ScoredChunk[], maxTokenBudget?: number): CompressedContext {
    const budget = maxTokenBudget || this.maxTokens;
    const seenChecksums = new Set<string>();
    const acceptedChunks: ScoredChunk[] = [];
    
    let currentTokens = 0;
    let rejectedCount = 0;

    for (const chunk of chunks) {
      // Deduplicate identical content
      if (seenChecksums.has(chunk.checksum)) {
        rejectedCount++;
        continue;
      }

      const chunkTokens = chunk.token_count || Math.ceil(chunk.content.length / 4);

      if (currentTokens + chunkTokens <= budget) {
        seenChecksums.add(chunk.checksum);
        acceptedChunks.push(chunk);
        currentTokens += chunkTokens;
      } else {
        rejectedCount++;
      }
    }

    const mergedChunks = this.mergeAdjacentChunks(acceptedChunks);

    return {
      chunks: mergedChunks,
      totalTokens: currentTokens,
      rejectedChunkCount: rejectedCount,
    };
  }

  public mergeAdjacentChunks(chunks: ScoredChunk[]): ScoredChunk[] {
    if (chunks.length <= 1) return chunks;

    // Group chunks by document_id and page_number
    const result: ScoredChunk[] = [];
    let currentGroup: ScoredChunk | null = null;

    // Sort by document_id, page_number, chunk_index for sequential merging
    const sorted = [...chunks].sort((a, b) => {
      if (a.document_id !== b.document_id) return a.document_id.localeCompare(b.document_id);
      if ((a.page_number || 0) !== (b.page_number || 0)) return (a.page_number || 0) - (b.page_number || 0);
      return a.chunk_index - b.chunk_index;
    });

    for (const chunk of sorted) {
      if (!currentGroup) {
        currentGroup = { ...chunk };
        continue;
      }

      const isSameDoc = currentGroup.document_id === chunk.document_id;
      const isSamePage = (currentGroup.page_number || 0) === (chunk.page_number || 0);
      const isAdjacent = Math.abs(chunk.chunk_index - currentGroup.chunk_index) <= 1;

      if (isSameDoc && isSamePage && isAdjacent) {
        // Merge content
        currentGroup.content = `${currentGroup.content}\n\n${chunk.content}`;
        currentGroup.token_count = (currentGroup.token_count || 0) + (chunk.token_count || 0);
        currentGroup.chunk_index = Math.min(currentGroup.chunk_index, chunk.chunk_index);
      } else {
        result.push(currentGroup);
        currentGroup = { ...chunk };
      }
    }

    if (currentGroup) {
      result.push(currentGroup);
    }

    return result;
  }
}
