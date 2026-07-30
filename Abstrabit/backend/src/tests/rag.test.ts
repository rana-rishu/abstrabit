import { RrfReranker } from '../rag/reranking/RrfReranker';
import { ContextCompressor } from '../rag/compression/ContextCompressor';
import { PromptBuilder } from '../rag/prompts/PromptBuilder';
import { CitationMapper } from '../rag/citations/CitationMapper';
import { ScoredChunk } from '../rag/interfaces/IRetriever';

describe('RRF Reranker Unit Tests', () => {
  it('should correctly combine vector and keyword ranks using RRF formula', () => {
    const chunk1: ScoredChunk = {
      id: 'c1',
      workspace_id: 'w1',
      document_id: 'd1',
      chunk_index: 0,
      content: 'Vector Search Result 1',
      token_count: 10,
      checksum: 'hash1',
      created_at: new Date(),
    };

    const chunk2: ScoredChunk = {
      id: 'c2',
      workspace_id: 'w1',
      document_id: 'd1',
      chunk_index: 1,
      content: 'Keyword Search Result 1',
      token_count: 10,
      checksum: 'hash2',
      created_at: new Date(),
    };

    const reranker = new RrfReranker(60);
    const reranked = reranker.rerank([chunk1], [chunk2, chunk1], 2);

    expect(reranked.length).toBe(2);
    // chunk1 appears in BOTH vector and keyword results, so it should rank first with higher RRF fusion score
    expect(reranked[0].id).toBe('c1');
    expect(reranked[0].fusionScore).toBeGreaterThan(reranked[1].fusionScore || 0);
  });
});

describe('Context Compressor Unit Tests', () => {
  it('should deduplicate chunks with identical checksums and enforce token budget', () => {
    const chunk1: ScoredChunk = {
      id: 'c1',
      workspace_id: 'w1',
      document_id: 'd1',
      chunk_index: 0,
      content: 'Sample Evidence Text 1',
      token_count: 100,
      checksum: 'dup_hash',
      created_at: new Date(),
    };

    const chunk2Duplicate: ScoredChunk = {
      id: 'c2',
      workspace_id: 'w1',
      document_id: 'd1',
      chunk_index: 1,
      content: 'Sample Evidence Text 1',
      token_count: 100,
      checksum: 'dup_hash',
      created_at: new Date(),
    };

    const compressor = new ContextCompressor(500);
    const compressed = compressor.compress([chunk1, chunk2Duplicate], 500);

    expect(compressed.chunks.length).toBe(1);
    expect(compressed.rejectedChunkCount).toBe(1);
    expect(compressed.totalTokens).toBe(100);
  });
});

describe('Prompt Builder & Prompt Injection Defense Unit Tests', () => {
  it('should wrap retrieved chunks in <retrieved_data> tags and include grounding rules', () => {
    const builder = new PromptBuilder();
    const chunk: ScoredChunk = {
      id: 'c1',
      workspace_id: 'w1',
      document_id: 'd1',
      chunk_index: 0,
      content: 'System architecture uses PostgreSQL pgvector.',
      section_title: 'Architecture',
      token_count: 10,
      checksum: 'hash1',
      created_at: new Date(),
    };

    const prompt = builder.buildPrompt('What database is used?', [chunk]);

    expect(prompt.systemInstruction).toContain('UNTRUSTED USER DATA');
    expect(prompt.systemInstruction).toContain('I don\'t know based on the documents in this workspace');
    expect(prompt.userPayload).toContain('<retrieved_data>');
    expect(prompt.userPayload).toContain('System architecture uses PostgreSQL pgvector.');
    expect(prompt.userPayload).toContain('</retrieved_data>');
  });

  it('should format explicit fallback message when context is empty', () => {
    const builder = new PromptBuilder();
    const prompt = builder.buildPrompt('Unrelated query?', []);

    expect(prompt.userPayload).toContain('NO MATCHING DOCUMENTS FOUND IN THIS WORKSPACE.');
  });
});

describe('Citation Mapper Unit Tests', () => {
  it('should map evidence chunks to structured CitationReference DTOs', () => {
    const mapper = new CitationMapper();
    const chunk: ScoredChunk = {
      id: 'c1',
      workspace_id: 'w1',
      document_id: 'doc-uuid-1',
      chunk_index: 2,
      content: 'Evidence text',
      section_title: 'Security',
      page_number: 1,
      token_count: 10,
      checksum: 'hash1',
      similarity: 0.892,
      created_at: new Date(),
    };

    const docMap = new Map([['doc-uuid-1', { filename: 'security_audit.pdf' }]]);
    const citations = mapper.mapCitations([chunk], docMap);

    expect(citations.length).toBe(1);
    expect(citations[0].filename).toBe('security_audit.pdf');
    expect(citations[0].chunk_index).toBe(2);
    expect(citations[0].section_title).toBe('Security');
    expect(citations[0].similarity).toBe(0.892);
  });
});
