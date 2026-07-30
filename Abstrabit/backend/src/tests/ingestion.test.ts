import { normalizeText, computeSha256 } from '../utils/textNormalizer';
import { PdfExtractor } from '../services/extractors/PdfExtractor';
import { SemanticChunker } from '../rag/chunking/semanticChunker';
import { InMemoryEmbeddingCache } from '../rag/embeddings/EmbeddingCache';
import { ExtractedDocument } from '../services/extractors/IDocumentExtractor';

describe('Text Normalizer & SHA-256 Checksum Unit Tests', () => {
  it('should clean line endings, unicode, and collapse blank lines', () => {
    const raw = "Header Text\r\n\r\nLine 1\r\n\r\n\r\n\r\nLine 2 \t\t  with spaces";
    const cleaned = normalizeText(raw);

    expect(cleaned).toContain("Header Text\n\nLine 1\n\nLine 2 with spaces");
    expect(cleaned.includes('\r')).toBe(false);
  });

  it('should compute deterministic SHA-256 checksums', () => {
    const content = 'Test Document Content';
    const hash1 = computeSha256(content);
    const hash2 = computeSha256(Buffer.from(content));

    expect(hash1).toEqual(hash2);
    expect(hash1.length).toBe(64);
  });
});

describe('PDF Extractor Unit Tests', () => {
  it('should instantiate PdfExtractor for PDF processing', () => {
    const pdfExtractor = new PdfExtractor();
    expect(pdfExtractor).toBeDefined();
  });
});

describe('Semantic Chunker & Multi-Page Preservation Unit Tests', () => {
  it('should chunk document page-by-page and preserve page numbers', () => {
    const doc: ExtractedDocument = {
      pages: [
        { pageNumber: 1, text: '# Developer Guide\n\n```typescript\nfunction calculateSum(a: number, b: number): number {\n  return a + b;\n}\n```' },
        { pageNumber: 2, text: '# Pricing Table\n\n| Tier | Price |\n| --- | --- |\n| Free | $0 |\n| Pro | $20 |' },
      ],
      metadata: { pageCount: 2, wordCount: 30, characterCount: 200, readingTimeMinutes: 1 },
    };

    const chunker = new SemanticChunker({ targetChunkSize: 200, overlapSize: 20 });
    const chunks = chunker.chunk(doc);

    expect(chunks.length).toBe(2);
    expect(chunks[0].pageNumber).toBe(1);
    expect(chunks[0].content).toContain('function calculateSum');
    expect(chunks[1].pageNumber).toBe(2);
    expect(chunks[1].content).toContain('| Pricing Table');
  });
});

describe('Embedding Cache Unit Tests', () => {
  it('should correctly record cache hits and misses', async () => {
    const cache = new InMemoryEmbeddingCache();
    const checksum = 'checksum_123';
    const model = 'text-embedding-004';
    const vector = [0.1, 0.2, 0.3];

    const miss = await cache.get(checksum, model);
    expect(miss).toBeNull();

    await cache.set(checksum, model, vector);
    const hit = await cache.get(checksum, model);
    expect(hit).toEqual(vector);

    const stats = cache.getStats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
  });
});
