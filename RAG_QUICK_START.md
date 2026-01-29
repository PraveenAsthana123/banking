# RAG Pipeline - Quick Start Guide

## Installation & Setup

### 1. Basic Setup (No Optional Dependencies)
The pipeline works out-of-the-box with just Python standard library + numpy:

```bash
pip install numpy requests
```

### 2. Enhanced Setup (Recommended)
For better performance, install optional dependencies:

```bash
pip install sentence-transformers faiss-cpu pandas scikit-learn
```

### 3. Install Ollama (for LLM capabilities)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.2

# Start service
ollama serve
```

## Quick Start Commands

### Check Status
```bash
python3 /mnt/deepa/Banking/rag_pipeline.py --status
```

### Ingest All Use Cases
```bash
python3 /mnt/deepa/Banking/rag_pipeline.py --ingest
```

This will:
- Find all UC-* directories under 5_Star_UseCases
- Chunk CSV, JSON, and text files
- Generate embeddings
- Store in vector database

### Ingest Single Use Case
```bash
python3 /mnt/deepa/Banking/rag_pipeline.py \
  --ingest-uc /mnt/deepa/Banking/5_Star_UseCases/.../UC-GOV-01
```

### Query the System
```bash
python3 /mnt/deepa/Banking/rag_pipeline.py \
  --query "What are the fraud detection policies?"
```

### Query with Filters
```bash
python3 /mnt/deepa/Banking/rag_pipeline.py \
  --query "Explain data governance" \
  --use-case-filter UC-GOV-01 \
  --top-k 10
```

### Run Evaluation
```bash
python3 /mnt/deepa/Banking/rag_pipeline.py --evaluate
```

## Python API Usage

### Basic Query
```python
from rag_pipeline import RAGPipeline

# Initialize
rag = RAGPipeline()

# Query
result = rag.query("What is fraud detection?", top_k=5)

print(result['response'])
print(result['sources'])
print(result['scores'])
```

### Custom Configuration
```python
config = {
    'chunk_size': 512,
    'chunk_overlap': 50,
    'chunking_strategy': 'recursive',
    'vector_engine': 'faiss',
    'ollama_model': 'llama3.2'
}

rag = RAGPipeline(config)
```

### Ingest Data
```python
# Ingest specific use case
result = rag.ingest_use_case('/path/to/UC-GOV-01')
print(f"Ingested {result['chunks']} chunks")

# Ingest all
results = rag.ingest_all()
```

### Check System Status
```python
# Vector store stats
vector_stats = rag.vector_store.get_stats()
print(f"Backend: {vector_stats['backend']}")
print(f"Collections: {vector_stats['total_collections']}")
print(f"Documents: {vector_stats['total_documents']}")

# Cache stats
cache_stats = rag.cache.get_stats()
print(f"Cache hit rate: {cache_stats['cache_hit_rate']:.1%}")
```

## Component Usage

### Document Chunking
```python
from rag_pipeline import DocumentChunker

chunker = DocumentChunker(chunk_size=512, strategy='recursive')

# Chunk text
chunks = chunker.chunk_text("Your text...", metadata={'source': 'doc.txt'})

# Chunk file (auto-detect format)
chunks = chunker.chunk_file('/path/to/file.csv')
```

### Embeddings
```python
from rag_pipeline import EmbeddingPipeline

embedder = EmbeddingPipeline(model_name='all-MiniLM-L6-v2')

# Single embedding
emb = embedder.embed_text("Sample text")

# Batch embeddings
embs = embedder.embed_batch(["text 1", "text 2", "text 3"])

# Similarity
sim = embedder.similarity(emb1, emb2)
```

### Vector Store
```python
from rag_pipeline import VectorStore

store = VectorStore(db_path='/path/to/store', engine='faiss')

# Add documents
store.add_documents(chunks_with_embeddings, collection_name='my_collection')

# Search
results = store.search(query_embedding, top_k=5, collection_name='my_collection')

for doc, score in results:
    print(f"{score:.3f}: {doc['text'][:100]}")
```

### Pre-Retrieval
```python
from rag_pipeline import PreRetrieval

pre = PreRetrieval()

intent = pre.classify_intent("What is fraud detection?")  # 'factual'
entities = pre.extract_entities("Account 12345678 on 2024-01-01")
expanded = pre.expand_query("fraud detection")
```

### Post-Retrieval
```python
from rag_pipeline import PostRetrieval

post = PostRetrieval()

# Rerank results
reranked = post.rerank(query, retrieved_chunks, top_k=5)

# Filter low-relevance
filtered = post.filter_irrelevant(query, chunks, min_score=0.3)

# Remove duplicates
deduped = post.deduplicate(chunks, similarity_threshold=0.9)

# Build context
context = post.build_context(chunks, max_tokens=3000)
```

### Output Evaluation
```python
from rag_pipeline import OutputEvaluator

evaluator = OutputEvaluator()

scores = evaluator.evaluate_response(query, response, retrieved_chunks)

print(f"Relevance: {scores['relevance_score']:.3f}")
print(f"Groundedness: {scores['groundedness_score']:.3f}")
print(f"Hallucination: {scores['hallucination_score']:.3f}")
```

## Files Created

1. **rag_pipeline.py** (2,227 lines, 80KB)
   - Complete RAG implementation
   - All components included
   - Graceful fallbacks for missing dependencies

2. **test_rag_pipeline.py** (9.6KB)
   - Comprehensive test suite
   - Tests all major components
   - Run with: `python3 test_rag_pipeline.py`

3. **example_rag_usage.py** (13KB)
   - 9 practical examples
   - Demonstrates various use cases
   - Run with: `python3 example_rag_usage.py`

4. **RAG_PIPELINE_README.md** (11KB)
   - Complete documentation
   - Architecture diagrams
   - Database schemas
   - Troubleshooting guide

5. **RAG_QUICK_START.md** (this file)
   - Quick reference
   - Common commands
   - Code snippets

## System Architecture

```
RAG Pipeline Components:
├── Ollama Client          → LLM generation & embeddings
├── Token Manager          → Token counting & truncation
├── Document Chunker       → Text/CSV/JSON chunking (4 strategies)
├── Embedding Pipeline     → sentence-transformers / Ollama / TF-IDF
├── Vector Store           → FAISS / ChromaDB / SQLite
├── Cache DB               → Query & embedding caching
├── Pre-Retrieval          → Query expansion, intent, entities
├── Post-Retrieval         → Reranking, filtering, deduplication
├── Output Evaluator       → Quality metrics (5 scores)
└── Scheduler              → Periodic ingestion jobs
```

## Database Files Created

After running the pipeline:

```
/mnt/deepa/Banking/
├── vector_store/              # Vector database
│   ├── vectors.db            # SQLite vector store (if FAISS not available)
│   ├── UC-GOV-01.faiss       # FAISS index (if FAISS available)
│   └── UC-GOV-01_metadata.pkl
├── rag_cache.db              # Query & embedding cache
└── ml_pipeline_results.db    # Ingestion schedule (if exists)
```

## Performance Characteristics

### With Full Dependencies (FAISS + sentence-transformers)
- **Ingestion**: ~1-5 minutes for typical use case (1000 chunks)
- **Query**: ~1-3 seconds (without cache)
- **Query (cached)**: ~50-100ms
- **Embedding**: ~30 chunks/second

### With Fallbacks Only (SQLite + TF-IDF)
- **Ingestion**: ~2-10 minutes
- **Query**: ~2-5 seconds (linear search)
- **Query (cached)**: ~50-100ms
- **Embedding**: ~100 chunks/second (TF-IDF is fast)

### Memory Usage
- **Small dataset** (<10k chunks): ~500MB
- **Medium dataset** (10k-100k chunks): ~2-5GB
- **Large dataset** (>100k chunks): Consider using FAISS with IVF index

## Common Use Cases

### 1. Policy Q&A
```bash
python3 rag_pipeline.py --query "What are the AML compliance requirements?" --use-case-filter UC-AML-01
```

### 2. Fraud Investigation
```bash
python3 rag_pipeline.py --query "How to investigate suspicious transactions?" --use-case-filter UC-FR-04
```

### 3. Governance Lookup
```bash
python3 rag_pipeline.py --query "What are the data quality metrics?" --use-case-filter UC-GOV-01
```

### 4. Multi-Domain Search
```bash
python3 rag_pipeline.py --query "Compliance requirements across all domains" --top-k 10
```

## Troubleshooting

### Issue: "No embedding method available"
**Solution**: Install sentence-transformers OR start Ollama
```bash
pip install sentence-transformers
# OR
ollama serve
```

### Issue: "Cannot connect to Ollama"
**Solution**: Start Ollama service
```bash
ollama serve
```

### Issue: "No relevant documents found"
**Solution**: Ingest data first
```bash
python3 rag_pipeline.py --ingest
```

### Issue: Slow performance
**Solutions**:
1. Install FAISS: `pip install faiss-cpu`
2. Use cache: Repeat queries are fast
3. Reduce top_k: `--top-k 3` instead of 10
4. Filter by use case: `--use-case-filter UC-GOV-01`

## Next Steps

1. **Test the installation**:
   ```bash
   python3 test_rag_pipeline.py
   ```

2. **Run examples**:
   ```bash
   python3 example_rag_usage.py
   ```

3. **Ingest your data**:
   ```bash
   python3 rag_pipeline.py --ingest
   ```

4. **Start querying**:
   ```bash
   python3 rag_pipeline.py --query "Your question here"
   ```

5. **Check status**:
   ```bash
   python3 rag_pipeline.py --status
   ```

## Support & Documentation

- **Full Documentation**: RAG_PIPELINE_README.md
- **Test Suite**: test_rag_pipeline.py
- **Examples**: example_rag_usage.py
- **Main Script**: rag_pipeline.py

For detailed architecture, database schemas, and advanced usage, see RAG_PIPELINE_README.md
