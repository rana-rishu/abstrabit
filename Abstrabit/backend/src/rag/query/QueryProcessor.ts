import { normalizeText } from '../../utils/textNormalizer';

export interface ProcessedQuery {
  rawQuery: string;
  normalizedQuery: string;
  tokenEstimate: number;
  extractedKeywords: string[];
}

export interface IQueryExpander {
  expand(query: string): Promise<string[]>;
}

export class DefaultQueryExpander implements IQueryExpander {
  public async expand(query: string): Promise<string[]> {
    // Architecture abstraction placeholder for AI query rewriting / expansion
    return [query];
  }
}

export class QueryProcessor {
  private expander: IQueryExpander;

  constructor(expander?: IQueryExpander) {
    this.expander = expander || new DefaultQueryExpander();
  }

  public async process(rawQuery: string): Promise<ProcessedQuery> {
    const normalizedQuery = normalizeText(rawQuery);
    const tokenEstimate = Math.max(1, Math.ceil(normalizedQuery.length / 4));
    
    // Extract non-stopword keywords for TSVECTOR search
    const keywords = normalizedQuery
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    return {
      rawQuery,
      normalizedQuery,
      tokenEstimate,
      extractedKeywords: [...new Set(keywords)],
    };
  }
}
