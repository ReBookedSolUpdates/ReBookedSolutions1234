-- Add metadata JSONB column to books table for storing ai_assisted flag and other metadata
ALTER TABLE books
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add comment explaining the metadata column
COMMENT ON COLUMN books.metadata IS 'JSONB metadata for books including ai_assisted flag for AI-generated listings';

-- Create index for faster metadata queries
CREATE INDEX IF NOT EXISTS idx_books_metadata_ai_assisted ON books USING GIN((metadata->'ai_assisted'));
