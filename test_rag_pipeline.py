#!/usr/bin/env python3
"""
Test script for RAG pipeline - verifies basic functionality
"""

import sys
import logging
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from rag_pipeline import (
    OllamaClient, TokenManager, DocumentChunker,
    EmbeddingPipeline, VectorStore, CacheDB,
    PreRetrieval, PostRetrieval, OutputEvaluator,
    RAGPipeline
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_ollama_client():
    """Test Ollama client."""
    print("\n" + "="*60)
    print("TEST: OllamaClient")
    print("="*60)

    client = OllamaClient()
    available = client.is_available()
    print(f"Ollama available: {available}")

    if available:
        response = client.generate("Say hello", max_tokens=20)
        print(f"Generate test: {response[:50]}...")

        embedding = client.embed("test text")
        if embedding is not None:
            print(f"Embedding test: shape={embedding.shape}")
        else:
            print("Embedding test: Failed")

    return available


def test_token_manager():
    """Test token manager."""
    print("\n" + "="*60)
    print("TEST: TokenManager")
    print("="*60)

    mgr = TokenManager()

    text = "This is a test sentence with several words."
    count = mgr.count_tokens(text)
    print(f"Token count for '{text}': {count}")

    truncated = mgr.truncate_to_tokens(text * 100, max_tokens=50)
    print(f"Truncation test: {len(truncated)} chars from {len(text * 100)} chars")

    fits = mgr.fits_context([text, text, text], max_context=100)
    print(f"Context fit test: {fits}")

    return True


def test_document_chunker():
    """Test document chunker."""
    print("\n" + "="*60)
    print("TEST: DocumentChunker")
    print("="*60)

    chunker = DocumentChunker(chunk_size=100, chunk_overlap=10)

    text = "This is a test. " * 50
    chunks = chunker.chunk_text(text, metadata={'source': 'test.txt'})
    print(f"Created {len(chunks)} chunks from {len(text)} chars")

    if chunks:
        print(f"First chunk: {chunks[0]['text'][:50]}...")
        print(f"Chunk metadata: {chunks[0]['metadata']}")
        print(f"Token count: {chunks[0]['token_count']}")

    return len(chunks) > 0


def test_embedding_pipeline():
    """Test embedding pipeline."""
    print("\n" + "="*60)
    print("TEST: EmbeddingPipeline")
    print("="*60)

    embedder = EmbeddingPipeline()
    print(f"Embedding method: {embedder.use_method}")

    if embedder.use_method:
        text = "This is a test sentence."
        embedding = embedder.embed_text(text)

        if embedding is not None:
            print(f"Single embedding shape: {embedding.shape}")

            # Test batch
            texts = ["test 1", "test 2", "test 3"]
            embeddings = embedder.embed_batch(texts)
            print(f"Batch embeddings: {len(embeddings)} items")

            # Test similarity
            emb1 = embedder.embed_text("cat")
            emb2 = embedder.embed_text("dog")
            sim = embedder.similarity(emb1, emb2)
            print(f"Similarity between 'cat' and 'dog': {sim:.3f}")

            return True

    return False


def test_vector_store():
    """Test vector store."""
    print("\n" + "="*60)
    print("TEST: VectorStore")
    print("="*60)

    import tempfile
    import numpy as np

    with tempfile.TemporaryDirectory() as tmpdir:
        store = VectorStore(db_path=tmpdir, engine='sqlite')
        print(f"Vector store backend: {store.backend}")

        # Create test chunks with embeddings
        chunks = [
            {
                'text': 'This is about fraud detection.',
                'metadata': {'source': 'doc1.txt', 'category': 'fraud'},
                'chunk_id': 'chunk_1',
                'embedding': np.random.rand(384)
            },
            {
                'text': 'This is about credit risk.',
                'metadata': {'source': 'doc2.txt', 'category': 'credit'},
                'chunk_id': 'chunk_2',
                'embedding': np.random.rand(384)
            }
        ]

        # Add documents
        store.add_documents(chunks, collection_name='test_collection')
        print(f"Added {len(chunks)} documents")

        # Search
        query_emb = np.random.rand(384)
        results = store.search(query_emb, top_k=2, collection_name='test_collection')
        print(f"Search returned {len(results)} results")

        # Get stats
        stats = store.get_stats()
        print(f"Vector store stats: {stats}")

        return len(results) > 0


def test_cache_db():
    """Test cache database."""
    print("\n" + "="*60)
    print("TEST: CacheDB")
    print("="*60)

    import tempfile
    import numpy as np

    with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
        cache = CacheDB(db_path=tmp.name)

        # Cache a response
        query = "What is fraud detection?"
        response = "Fraud detection is..."
        embedding = np.random.rand(384)

        cache.cache_response(query, response, embedding, ttl=3600)
        print(f"Cached query: '{query}'")

        # Retrieve
        cached = cache.get_cached_response(query)
        print(f"Retrieved: '{cached}'")

        # Stats
        stats = cache.get_stats()
        print(f"Cache stats: {stats}")

        return cached == response


def test_pre_retrieval():
    """Test pre-retrieval processing."""
    print("\n" + "="*60)
    print("TEST: PreRetrieval")
    print("="*60)

    pre = PreRetrieval()

    query = "What are the fraud detection policies for account 12345678?"

    intent = pre.classify_intent(query)
    print(f"Intent: {intent}")

    entities = pre.extract_entities(query)
    print(f"Entities: {entities}")

    rewritten = pre.rewrite_query(query, intent)
    print(f"Rewritten: {rewritten}")

    return True


def test_post_retrieval():
    """Test post-retrieval processing."""
    print("\n" + "="*60)
    print("TEST: PostRetrieval")
    print("="*60)

    post = PostRetrieval()

    # Mock chunks
    chunks = [
        ({'text': 'Fraud detection involves monitoring...', 'metadata': {}}, 0.9),
        ({'text': 'Credit risk assessment...', 'metadata': {}}, 0.7),
        ({'text': 'Fraud detection system...', 'metadata': {}}, 0.85),
    ]

    # Rerank
    query = "fraud detection"
    reranked = post.rerank(query, chunks, top_k=2)
    print(f"Reranked to {len(reranked)} items")

    # Filter
    filtered = post.filter_irrelevant(query, chunks, min_score=0.75)
    print(f"Filtered to {len(filtered)} items")

    # Deduplicate
    deduped = post.deduplicate(chunks, similarity_threshold=0.9)
    print(f"Deduplicated to {len(deduped)} items")

    # Build context
    context = post.build_context(chunks, max_tokens=1000)
    print(f"Context length: {len(context)} chars")

    return True


def test_output_evaluator():
    """Test output evaluator."""
    print("\n" + "="*60)
    print("TEST: OutputEvaluator")
    print("="*60)

    evaluator = OutputEvaluator()

    query = "What is fraud detection?"
    response = "Fraud detection is a system that monitors transactions for suspicious activity."
    chunks = [
        ({'text': 'Fraud detection systems monitor transactions.', 'metadata': {}}, 0.9),
        ({'text': 'Suspicious activity is flagged for review.', 'metadata': {}}, 0.8),
    ]

    scores = evaluator.evaluate_response(query, response, chunks)
    print(f"Evaluation scores:")
    for metric, value in scores.items():
        print(f"  {metric}: {value:.3f}")

    return all(0 <= score <= 1 for score in scores.values())


def test_full_pipeline():
    """Test full RAG pipeline initialization."""
    print("\n" + "="*60)
    print("TEST: RAGPipeline (Initialization)")
    print("="*60)

    try:
        rag = RAGPipeline()
        print("Pipeline initialized successfully")

        # Check status
        stats = rag.vector_store.get_stats()
        print(f"Vector store: {stats['backend']}, {stats['total_collections']} collections")

        cache_stats = rag.cache.get_stats()
        print(f"Cache: {cache_stats['query_cache_entries']} queries cached")

        return True
    except Exception as e:
        print(f"Pipeline initialization failed: {e}")
        return False


def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("RAG PIPELINE TEST SUITE")
    print("="*60)

    tests = [
        ("Ollama Client", test_ollama_client),
        ("Token Manager", test_token_manager),
        ("Document Chunker", test_document_chunker),
        ("Embedding Pipeline", test_embedding_pipeline),
        ("Vector Store", test_vector_store),
        ("Cache Database", test_cache_db),
        ("Pre-Retrieval", test_pre_retrieval),
        ("Post-Retrieval", test_post_retrieval),
        ("Output Evaluator", test_output_evaluator),
        ("Full Pipeline", test_full_pipeline),
    ]

    results = []

    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result, None))
        except Exception as e:
            logger.error(f"Test '{name}' failed with exception: {e}")
            results.append((name, False, str(e)))

    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)

    passed = sum(1 for _, result, _ in results if result)
    total = len(results)

    for name, result, error in results:
        status = "PASS" if result else "FAIL"
        symbol = "✓" if result else "✗"
        print(f"{symbol} {name}: {status}")
        if error:
            print(f"  Error: {error}")

    print(f"\nPassed: {passed}/{total} ({100*passed/total:.1f}%)")

    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
