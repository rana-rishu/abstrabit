-- Migration 006: Add section_id and paragraph_index to doc_chunks
ALTER TABLE doc_chunks ADD COLUMN IF NOT EXISTS section_id VARCHAR(50) DEFAULT NULL;
ALTER TABLE doc_chunks ADD COLUMN IF NOT EXISTS paragraph_index INT DEFAULT NULL;
