import { IHybridRetriever, IVectorRetriever, IKeywordRetriever, ScoredChunk } from '../interfaces/IRetriever';
import { IReranker } from '../interfaces/IReranker';
import { VectorRetriever } from './VectorRetriever';
import { KeywordRetriever } from './KeywordRetriever';
import { RrfReranker } from '../reranking/RrfReranker';

export class HybridRetriever implements IHybridRetriever {
  private vectorRetriever: IVectorRetriever;
  private keywordRetriever: IKeywordRetriever;
  private reranker: IReranker;

  constructor(
    vectorRetriever?: IVectorRetriever,
    keywordRetriever?: IKeywordRetriever,
    reranker?: IReranker,
  ) {
    this.vectorRetriever = vectorRetriever || new VectorRetriever();
    this.keywordRetriever = keywordRetriever || new KeywordRetriever();
    this.reranker = reranker || new RrfReranker();
  }

  public async retrieveHybrid(
    workspaceId: string,
    queryEmbedding: number[],
    queryText: string,
    limit = 5,
  ): Promise<ScoredChunk[]> {
    const [vectorResults, keywordResults] = await Promise.all([
      this.vectorRetriever.retrieveVector(workspaceId, queryEmbedding, 15),
      this.keywordRetriever.retrieveKeyword(workspaceId, queryText, 15),
    ]);

    return this.reranker.rerank(vectorResults, keywordResults, limit);
  }
}
