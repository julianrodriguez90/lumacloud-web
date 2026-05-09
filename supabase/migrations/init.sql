-- Extensión vectorial
CREATE EXTENSION IF NOT EXISTS vector;

-- Corpus RAG (fuentes autorizadas)
CREATE TABLE rag_corpus (
  id          BIGSERIAL PRIMARY KEY,
  silo        TEXT,          -- ciberseguridad|backup|cloud|soc|educacion
  source_name TEXT,
  source_url  TEXT,
  chunk_text  TEXT,
  embedding   vector(1024),  -- bge-m3
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Páginas pSEO generadas
CREATE TABLE pseo_pages (
  id          BIGSERIAL PRIMARY KEY,
  slug        TEXT UNIQUE,
  silo        TEXT,
  keyword     TEXT,
  ciudad      TEXT,
  sector      TEXT,
  content_md  TEXT,
  meta_title  TEXT,
  meta_desc   TEXT,
  published   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índice HNSW para búsqueda vectorial (cosine similarity)
CREATE INDEX ON rag_corpus USING hnsw (embedding vector_cosine_ops);

-- Función para búsqueda de similitud
CREATE OR REPLACE FUNCTION match_corpus (
  query_embedding vector(1024),
  match_threshold float,
  filter_silo text,
  match_count int
)
RETURNS TABLE (
  id bigint,
  silo text,
  source_name text,
  source_url text,
  chunk_text text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id,
    rc.silo,
    rc.source_name,
    rc.source_url,
    rc.chunk_text,
    1 - (rc.embedding <=> query_embedding) AS similarity
  FROM rag_corpus rc
  WHERE (rc.silo = filter_silo OR filter_silo IS NULL)
    AND 1 - (rc.embedding <=> query_embedding) > match_threshold
  ORDER BY rc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
