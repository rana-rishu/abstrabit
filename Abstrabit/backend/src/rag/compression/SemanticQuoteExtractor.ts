import { ScoredChunk } from '../interfaces/IRetriever';
import { IEmbeddingProvider } from '../embeddings/IEmbeddingProvider';

export interface SemanticQuote {
  sentence: string;
  chunkId: string;
  documentId: string;
  pageNumber?: number;
  sectionId?: string;
  sectionTitle?: string;
  similarityScore: number;
}

export class SemanticQuoteExtractor {
  public async extractSemanticQuotes(
    chunks: ScoredChunk[],
    queryEmbedding: number[],
    embeddingProvider: IEmbeddingProvider,
    maxQuotes = 6,
  ): Promise<{ extractedQuotes: SemanticQuote[]; textPayload: string }> {
    if (!chunks || chunks.length === 0) {
      return { extractedQuotes: [], textPayload: '' };
    }

    const candidateSentences: Array<{
      sentence: string;
      chunkId: string;
      documentId: string;
      pageNumber?: number;
      sectionId?: string;
      sectionTitle?: string;
    }> = [];

    chunks.forEach((chunk) => {
      // Split chunk content into structural sentences
      const sentences = chunk.content
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 10);

      sentences.forEach((sentence) => {
        candidateSentences.push({
          sentence,
          chunkId: chunk.id,
          documentId: chunk.document_id,
          pageNumber: chunk.page_number || undefined,
          sectionId: chunk.section_id || undefined,
          sectionTitle: chunk.section_title || undefined,
        });
      });
    });

    if (candidateSentences.length === 0) {
      return {
        extractedQuotes: [],
        textPayload: chunks.map((c) => c.content).join('\n\n'),
      };
    }

    // Generate sentence embeddings for vector semantic similarity scoring
    const sentencesText = candidateSentences.map((cs) => cs.sentence);
    let sentenceEmbeddings: number[][] = [];
    try {
      sentenceEmbeddings = await embeddingProvider.generateBatchEmbeddings(sentencesText);
    } catch {
      // Fallback: If batch embedding fails, return top sentences as-is
      const fallbackQuotes: SemanticQuote[] = candidateSentences.slice(0, maxQuotes).map((cs) => ({
        ...cs,
        similarityScore: 0.8,
      }));
      return {
        extractedQuotes: fallbackQuotes,
        textPayload: fallbackQuotes.map((q) => q.sentence).join('\n\n'),
      };
    }

    // Compute Cosine Similarity between each sentence embedding and query embedding
    const scoredQuotes: SemanticQuote[] = candidateSentences.map((cs, idx) => {
      const sentVector = sentenceEmbeddings[idx];
      const similarity = sentVector ? this.cosineSimilarity(sentVector, queryEmbedding) : 0;
      return {
        ...cs,
        similarityScore: similarity,
      };
    });

    // Sort by vector similarity descending
    scoredQuotes.sort((a, b) => b.similarityScore - a.similarityScore);

    // Pick top unique sentences
    const selectedQuotes: SemanticQuote[] = [];
    const seenSentences = new Set<string>();

    for (const q of scoredQuotes) {
      if (selectedQuotes.length >= maxQuotes) break;
      if (!seenSentences.has(q.sentence)) {
        seenSentences.add(q.sentence);
        selectedQuotes.push(q);
      }
    }

    const textPayload = selectedQuotes.map((q) => q.sentence).join('\n\n');

    return {
      extractedQuotes: selectedQuotes,
      textPayload: textPayload || chunks.map((c) => c.content).join('\n\n'),
    };
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length || vecA.length === 0) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
