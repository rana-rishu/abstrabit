-- Migration 004: pgvector Vector Extension & Indexes
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add Vector Embedding Column (768 dimensions for Gemini text-embedding-004)
ALTER TABLE doc_chunks 
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Add TSVECTOR column for Hybrid Full-Text Keyword Search
ALTER TABLE doc_chunks 
ADD COLUMN IF NOT EXISTS tsv TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;

-- Full-Text GIN Index
CREATE INDEX IF NOT EXISTS idx_doc_chunks_tsv 
ON doc_chunks USING gin(tsv);

-- HNSW Vector Cosine Similarity Index
CREATE INDEX IF NOT EXISTS idx_doc_chunks_hnsw_vector 
ON doc_chunks 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);
