import { ScoredChunk } from '../interfaces/IRetriever';

export interface ExtractedQuote {
  sentence: string;
  chunkId: string;
  documentId: string;
  pageNumber?: number;
  sectionTitle?: string;
  score: number;
}

export class QuoteExtractor {
  public extractRelevantQuotes(
    chunks: ScoredChunk[],
    query: string,
    maxQuotes = 6,
  ): { extractedQuotes: ExtractedQuote[]; textPayload: string } {
    if (!chunks || chunks.length === 0) {
      return { extractedQuotes: [], textPayload: '' };
    }

    const queryTerms = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((t) => t.length > 2);

    const scoredSentences: ExtractedQuote[] = [];

    chunks.forEach((chunk) => {
      // Split chunk content into sentences
      const sentences = chunk.content
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 10);

      sentences.forEach((sentence) => {
        const lowerSent = sentence.toLowerCase();
        let sentenceScore = 0;

        queryTerms.forEach((term) => {
          if (lowerSent.includes(term)) {
            sentenceScore += 1;
          }
        });

        // Add chunk similarity weighting
        const baseScore = sentenceScore + (chunk.vectorSimilarity || chunk.similarity || 0);

        scoredSentences.push({
          sentence,
          chunkId: chunk.id,
          documentId: chunk.document_id,
          pageNumber: chunk.page_number || undefined,
          sectionTitle: chunk.section_title || undefined,
          score: baseScore,
        });
      });
    });

    // Sort by relevance score descending
    scoredSentences.sort((a, b) => b.score - a.score);

    // Pick top unique sentences
    const selectedQuotes: ExtractedQuote[] = [];
    const seenSentences = new Set<string>();

    for (const q of scoredSentences) {
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
}
