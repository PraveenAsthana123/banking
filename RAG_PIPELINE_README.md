# RAG Pipeline for Banking Use Cases

A comprehensive Retrieval-Augmented Generation (RAG) pipeline designed for banking use cases, featuring multiple backend options, intelligent query processing, and quality evaluation.

## Features

### 1. Ollama Integration
- Local LLM support via Ollama
- Generation and embedding capabilities
- Graceful fallback when unavailable

### 2. Document Processing
- **Chunking Strategies**: Fixed, recursive, sentence-based, semantic
- **File Support**: CSV, JSON, TXT, MD, LOG files
- **Token Management**: Count, truncate, context window checks

### 3. Embedding Pipeline
- **Primary**: sentence-transformers (all-MiniLM-L6-v2)
- **Fallback 1**: Ollama embeddings
- **Fallback 2**: TF-IDF vectors
- Batch processing with progress tracking

### 4. Vector Storage
- **FAISS**: High-performance similarity search (if available)
- **ChromaDB**: Persistent vector database (if available)
- **SQLite**: Fallback implementation with numpy cosine similarity
- Metadata filtering support

### 5. Intelligent Caching
- Query cache with semantic similarity matching
- Embedding cache to avoid recomputation
- TTL-based expiration
- Hit rate tracking

### 6. Pre-Retrieval Processing
- **Query Expansion**: Generate alternative phrasings
- **Intent Classification**: Factual, analytical, comparative, procedural
- **Entity Extraction**: Account numbers, amounts, dates, domains
- **Query Rewriting**: Add context for better retrieval

### 7. Post-Retrieval Processing
- **Reranking**: Cross-encoder or keyword-based
- **Filtering**: Remove low-relevance results
- **Deduplication**: Remove near-duplicate chunks
- **Context Building**: Combine chunks with source attribution

### 8. Output Evaluation
- **Relevance Score**: Does response answer the query?
- **Groundedness Score**: Is response supported by sources?
- **Hallucination Detection**: Does response contain unsupported claims?
- **Completeness**: Does response cover all query aspects?
- **Coherence**: Is response well-structured?

### 9. Scheduled Ingestion
- Periodic re-ingestion jobs
- Incremental updates (hash-based change detection)
- Status tracking in SQLite

## Installation

### Required Dependencies
```bash
pip install numpy requests
```

### Optional Dependencies (for enhanced functionality)
```bash
# For better embeddings
pip install sentence-transformers

# For high-performance vector search
pip install faiss-cpu  # or faiss-gpu for GPU support

# For persistent vector database
pip install chromadb

# For accurate token counting
pip install tiktoken

# For advanced text processing
pip install nltk

# For data processing
pip install pandas scikit-learn
```

### Ollama Setup
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.2

# Start Ollama service
ollama serve
```

## Usage

### 1. Ingest All Use Cases
```bash
python3 rag_pipeline.py --ingest
```

### 2. Ingest Specific Use Case
```bash
python3 rag_pipeline.py --ingest-uc /mnt/deepa/Banking/5_Star_UseCases/.../UC-GOV-01
```

### 3. Query the RAG System
```bash
python3 rag_pipeline.py --query "What are the data governance policies?"
```

### 4. Query with Filters
```bash
python3 rag_pipeline.py --query "Explain fraud detection" --use-case-filter UC-FR-01 --top-k 10
```

### 5. Check Status
```bash
python3 rag_pipeline.py --status
```

### 6. Run Scheduled Jobs
```bash
python3 rag_pipeline.py --schedule
```

### 7. Evaluate Performance
```bash
python3 rag_pipeline.py --evaluate
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RAG Pipeline Query Flow                   │
└─────────────────────────────────────────────────────────────┘

1. Query Input
   ↓
2. Cache Check ────→ [Cache Hit] ────→ Return Cached Response
   ↓ [Cache Miss]
3. Pre-Retrieval
   ├─ Query Expansion
   ├─ Intent Classification
   ├─ Entity Extraction
   └─ Build Filters
   ↓
4. Query Embedding
   ↓
5. Vector Search (across collections)
   ↓
6. Post-Retrieval
   ├─ Reranking
   ├─ Filtering (min relevance)
   ├─ Deduplication
   └─ Context Building
   ↓
7. LLM Generation (Ollama)
   ↓
8. Output Evaluation
   ├─ Relevance
   ├─ Groundedness
   ├─ Hallucination Check
   ├─ Completeness
   └─ Coherence
   ↓
9. Cache Response
   ↓
10. Return Result with Sources & Scores
```

## Configuration

The pipeline can be configured via a config dictionary:

```python
from rag_pipeline import RAGPipeline

config = {
    'ollama_model': 'llama3.2',           # Ollama model name
    'embedding_model': 'all-MiniLM-L6-v2', # Embedding model
    'chunk_size': 512,                     # Tokens per chunk
    'chunk_overlap': 50,                   # Overlap between chunks
    'chunking_strategy': 'recursive',      # fixed|recursive|sentence|semantic
    'vector_engine': 'faiss',              # faiss|chromadb|sqlite
    'vector_db_path': '/path/to/vectors',  # Vector store location
    'cache_db_path': '/path/to/cache.db',  # Cache database location
    'base_path': '/path/to/use/cases'      # Base directory for use cases
}

rag = RAGPipeline(config)
```

## Data Structure

Expected directory structure for use cases:

```
5_Star_UseCases/
├── Domain_A/
│   └── Category_1/
│       └── data/
│           ├── UC-XYZ-01/
│           │   ├── csv/
│           │   │   └── data.csv
│           │   └── text/
│           │       ├── policy.json
│           │       └── document.txt
│           └── UC-XYZ-02/
│               └── ...
└── Domain_B/
    └── ...
```

## Database Schema

### Vector Store (SQLite Fallback)
```sql
CREATE TABLE vectors (
    id INTEGER PRIMARY KEY,
    collection TEXT NOT NULL,
    chunk_id TEXT NOT NULL,
    text TEXT NOT NULL,
    metadata_json TEXT,
    embedding_blob BLOB,
    created_at TIMESTAMP
);
```

### Query Cache
```sql
CREATE TABLE query_cache (
    id INTEGER PRIMARY KEY,
    query_hash TEXT UNIQUE,
    query_text TEXT,
    response TEXT,
    embedding_blob BLOB,
    created_at TIMESTAMP,
    ttl_seconds INTEGER,
    hit_count INTEGER
);
```

### Embedding Cache
```sql
CREATE TABLE embedding_cache (
    id INTEGER PRIMARY KEY,
    text_hash TEXT UNIQUE,
    text TEXT,
    embedding_blob BLOB,
    model_name TEXT,
    created_at TIMESTAMP
);
```

### Ingestion Schedule
```sql
CREATE TABLE vector_db_jobs (
    job_id INTEGER PRIMARY KEY,
    use_case TEXT UNIQUE,
    status TEXT,
    last_ingested TIMESTAMP,
    next_scheduled TIMESTAMP,
    chunk_count INTEGER,
    error TEXT,
    frequency TEXT,
    file_hashes TEXT
);
```

## Performance Tips

1. **Use FAISS** for large collections (>10k documents)
2. **Enable sentence-transformers** for better embeddings
3. **Run Ollama on GPU** for faster generation
4. **Adjust chunk_size** based on your data (512 is a good default)
5. **Use cache** for repeated queries
6. **Filter by use_case** to reduce search space
7. **Increase top_k** for better recall

## Evaluation Metrics

### Relevance Score (0-1)
Measures if response answers the query

### Groundedness Score (0-1)
Percentage of sentences with supporting evidence

### Hallucination Score (0-1)
Inverse of groundedness (lower is better)

### Completeness Score (0-1)
Checks response length and keyword coverage

### Coherence Score (0-1)
Evaluates sentence structure and formatting

## Troubleshooting

### "Cannot connect to Ollama"
- Ensure Ollama is running: `ollama serve`
- Check Ollama is accessible: `curl http://localhost:11434/api/tags`

### "No embedding method available"
- Install sentence-transformers: `pip install sentence-transformers`
- Or ensure Ollama is running

### "No relevant documents found"
- Check if data has been ingested: `python3 rag_pipeline.py --status`
- Run ingestion: `python3 rag_pipeline.py --ingest`
- Try broader query terms

### Slow Performance
- Use FAISS instead of SQLite for vector store
- Reduce chunk_size or top_k
- Enable GPU acceleration for embeddings
- Use cache for repeated queries

## Advanced Usage

### Programmatic Usage

```python
from rag_pipeline import RAGPipeline

# Initialize
rag = RAGPipeline()

# Ingest specific use case
result = rag.ingest_use_case('/path/to/UC-GOV-01')
print(f"Ingested {result['chunks']} chunks")

# Query
result = rag.query(
    "What are the fraud detection policies?",
    use_case_filter="UC-FR-01",
    top_k=5
)

print(f"Answer: {result['response']}")
print(f"Sources: {len(result['sources'])}")
print(f"Quality Scores: {result['scores']}")

# Batch evaluation
test_queries = [
    {'query': 'What is KYC?', 'ground_truth': None},
    {'query': 'Explain AML compliance', 'ground_truth': None}
]
eval_results = rag.batch_evaluate(test_queries)
print(f"Average relevance: {eval_results['aggregated_metrics']['relevance_score']['mean']}")
```

### Custom Chunking

```python
from rag_pipeline import DocumentChunker

chunker = DocumentChunker(
    chunk_size=1024,
    chunk_overlap=100,
    strategy='sentence'
)

# Chunk text
chunks = chunker.chunk_text(
    "Your long document text...",
    metadata={'source': 'policy_doc.txt', 'category': 'compliance'}
)

# Chunk file
chunks = chunker.chunk_file('/path/to/document.csv')
```

### Direct Vector Search

```python
from rag_pipeline import VectorStore, EmbeddingPipeline

embedder = EmbeddingPipeline()
vector_store = VectorStore(engine='faiss')

# Add documents
chunks = [...]  # Your chunks with text and metadata
chunks_with_embeddings = embedder.embed_chunks(chunks)
vector_store.add_documents(chunks_with_embeddings, collection_name='my_collection')

# Search
query_emb = embedder.embed_text("What is fraud detection?")
results = vector_store.search(query_emb, top_k=5, collection_name='my_collection')

for doc, score in results:
    print(f"Score: {score:.3f} - {doc['text'][:100]}")
```

## License

This RAG pipeline is part of the Banking ML/AI Use Case Framework.

## Support

For issues or questions, please refer to the main project documentation or contact the development team.
