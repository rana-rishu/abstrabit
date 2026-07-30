import { RagEvaluator } from '../rag/eval/RagEvaluator';

describe('RagEvaluator Metric Calculation Unit Tests', () => {
  it('should correctly calculate Precision@K, Recall@K, MRR, and nDCG for perfect retrieval', () => {
    const retrieved = ['chunk-1', 'chunk-2', 'chunk-3'];
    const relevant = ['chunk-1', 'chunk-2', 'chunk-3'];

    const res = RagEvaluator.evaluateRetrieval(retrieved, relevant, 5);

    expect(res.precision).toBe(1.0);
    expect(res.recall).toBe(1.0);
    expect(res.rr).toBe(1.0); // Rank 1
    expect(res.ndcg).toBe(1.0);
  });

  it('should calculate correct metrics when relevant chunk is at rank 2', () => {
    const retrieved = ['irrelevant-chunk', 'chunk-1'];
    const relevant = ['chunk-1'];

    const res = RagEvaluator.evaluateRetrieval(retrieved, relevant, 5);

    expect(res.precision).toBe(0.5);
    expect(res.recall).toBe(1.0);
    expect(res.rr).toBe(0.5); // Rank 2 reciprocal rank = 1/2
  });

  it('should execute full benchmark suite and compute aggregate evaluation metrics', () => {
    const cases = [
      {
        query: 'Sample query 1',
        expectedRelevantChunkIds: ['c1', 'c2'],
        expectedRefusal: false,
      },
      {
        query: 'Sample query 2 (Negative query)',
        expectedRelevantChunkIds: [],
        expectedRefusal: true,
      },
    ];

    const evalRes = RagEvaluator.runBenchmarkSuite(cases);

    expect(evalRes.precisionAtK).toBeGreaterThan(0);
    expect(evalRes.mrr).toBeGreaterThan(0);
    expect(evalRes.citationCoverage).toBeGreaterThan(95.0);
    expect(evalRes.hallucinationRate).toBe(0.0);
    expect(evalRes.workspaceIsolationVerified).toBe(true);
  });
});
