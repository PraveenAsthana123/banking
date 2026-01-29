#!/usr/bin/env python3
"""
Example usage of the RAG Pipeline for Banking Use Cases

This script demonstrates various ways to use the RAG pipeline.
"""

import sys
from pathlib import Path

# Add current directory to path
_SCRIPT_DIR = Path(__file__).resolve().parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))

from config import USE_CASES_DIR
from rag_pipeline import RAGPipeline


def example_1_basic_query():
    """Example 1: Basic query without ingestion (empty database)."""
    print("\n" + "="*70)
    print("EXAMPLE 1: Basic Query")
    print("="*70)

    rag = RAGPipeline()

    # Try a query (will return no results if nothing ingested)
    result = rag.query("What is data governance?", top_k=3)

    print(f"\nQuestion: What is data governance?")
    print(f"\nAnswer: {result['response']}")
    print(f"\nNumber of sources: {len(result['sources'])}")
    print(f"Quality scores: {result['scores']}")
    print(f"Metadata: {result['metadata']}")


def example_2_ingest_and_query():
    """Example 2: Ingest a use case and query it."""
    print("\n" + "="*70)
    print("EXAMPLE 2: Ingest Use Case and Query")
    print("="*70)

    rag = RAGPipeline()

    # Find a use case to ingest
    use_cases_base = USE_CASES_DIR

    # Try to find a governance use case
    uc_paths = list(use_cases_base.glob("**/UC-GOV-01"))

    if uc_paths:
        uc_path = uc_paths[0]
        print(f"\nIngesting: {uc_path}")

        # Ingest the use case
        result = rag.ingest_use_case(str(uc_path))

        print(f"Ingestion result: {result}")

        if result['status'] == 'success':
            # Now query
            print("\nQuerying the ingested data...")
            query_result = rag.query(
                "What metrics are monitored for data quality?",
                use_case_filter="UC-GOV-01",
                top_k=3
            )

            print(f"\nQuestion: What metrics are monitored for data quality?")
            print(f"\nAnswer: {query_result['response']}")

            print(f"\nSources ({len(query_result['sources'])}):")
            for i, source in enumerate(query_result['sources'][:3], 1):
                print(f"\n{i}. Score: {source['score']:.3f}")
                print(f"   Use Case: {source['use_case']}")
                print(f"   Text: {source['text'][:150]}...")

            print(f"\nQuality Scores:")
            for metric, value in query_result['scores'].items():
                print(f"  {metric}: {value:.3f}")
    else:
        print("No use case found for this example.")


def example_3_multiple_collections():
    """Example 3: Search across multiple collections."""
    print("\n" + "="*70)
    print("EXAMPLE 3: Search Across Multiple Collections")
    print("="*70)

    rag = RAGPipeline()

    # Check what collections exist
    collections = rag.vector_store.list_collections()
    print(f"\nAvailable collections: {collections}")

    if collections:
        # Query without filter (searches all collections)
        result = rag.query(
            "What are the key governance policies?",
            top_k=5
        )

        print(f"\nQuestion: What are the key governance policies?")
        print(f"\nAnswer: {result['response']}")

        # Group sources by use case
        sources_by_uc = {}
        for source in result['sources']:
            uc = source['use_case']
            if uc not in sources_by_uc:
                sources_by_uc[uc] = []
            sources_by_uc[uc].append(source)

        print(f"\nSources from {len(sources_by_uc)} use cases:")
        for uc, sources in sources_by_uc.items():
            print(f"  {uc}: {len(sources)} chunks")
    else:
        print("\nNo collections available. Run ingestion first.")


def example_4_custom_config():
    """Example 4: Use custom configuration."""
    print("\n" + "="*70)
    print("EXAMPLE 4: Custom Configuration")
    print("="*70)

    # Custom configuration
    config = {
        'ollama_model': 'llama3.2',
        'embedding_model': 'all-MiniLM-L6-v2',
        'chunk_size': 256,  # Smaller chunks
        'chunk_overlap': 25,
        'chunking_strategy': 'sentence',  # Sentence-based chunking
        'vector_engine': 'sqlite',  # Force SQLite backend
        'base_path': str(USE_CASES_DIR)
    }

    rag = RAGPipeline(config)

    print(f"\nConfiguration:")
    print(f"  Chunk size: {rag.chunker.chunk_size}")
    print(f"  Chunk overlap: {rag.chunker.chunk_overlap}")
    print(f"  Chunking strategy: {rag.chunker.strategy}")
    print(f"  Vector backend: {rag.vector_store.backend}")
    print(f"  Embedding method: {rag.embedder.use_method}")


def example_5_cache_demo():
    """Example 5: Demonstrate caching."""
    print("\n" + "="*70)
    print("EXAMPLE 5: Caching Demonstration")
    print("="*70)

    rag = RAGPipeline()

    # Check cache stats before
    stats_before = rag.cache.get_stats()
    print(f"\nCache before query:")
    print(f"  Entries: {stats_before['query_cache_entries']}")
    print(f"  Hits: {stats_before['total_cache_hits']}")

    # First query (will be cached)
    query = "What is the purpose of data governance?"
    print(f"\nFirst query: {query}")

    import time
    start = time.time()
    result1 = rag.query(query, top_k=3)
    time1 = time.time() - start

    print(f"  Response: {result1['response'][:100]}...")
    print(f"  Time: {time1:.3f}s")
    print(f"  Cached: {result1['metadata'].get('cached', False)}")

    # Second query (should be from cache)
    print(f"\nSecond query (same): {query}")

    start = time.time()
    result2 = rag.query(query, top_k=3)
    time2 = time.time() - start

    print(f"  Response: {result2['response'][:100]}...")
    print(f"  Time: {time2:.3f}s")
    print(f"  Cached: {result2['metadata'].get('cached', False)}")

    if result2['metadata'].get('cached'):
        speedup = time1 / time2 if time2 > 0 else 0
        print(f"  Speedup: {speedup:.1f}x faster")

    # Check cache stats after
    stats_after = rag.cache.get_stats()
    print(f"\nCache after queries:")
    print(f"  Entries: {stats_after['query_cache_entries']}")
    print(f"  Hits: {stats_after['total_cache_hits']}")
    print(f"  Hit rate: {stats_after['cache_hit_rate']:.1%}")


def example_6_batch_evaluation():
    """Example 6: Batch evaluation on test queries."""
    print("\n" + "="*70)
    print("EXAMPLE 6: Batch Evaluation")
    print("="*70)

    rag = RAGPipeline()

    # Define test queries
    test_queries = [
        {
            'query': 'What is data governance?',
            'ground_truth': 'Data governance is the management of data availability, usability, integrity and security.'
        },
        {
            'query': 'How does model drift monitoring work?',
            'ground_truth': None  # No ground truth available
        },
        {
            'query': 'What are the key AI risk categories?',
            'ground_truth': None
        }
    ]

    print(f"\nEvaluating {len(test_queries)} test queries...")

    results = rag.batch_evaluate(test_queries)

    # Print aggregated metrics
    print(f"\nAggregated Metrics:")
    for metric, stats in results['aggregated_metrics'].items():
        print(f"\n{metric}:")
        print(f"  Mean: {stats['mean']:.3f}")
        print(f"  Std Dev: {stats['std']:.3f}")
        print(f"  Range: [{stats['min']:.3f}, {stats['max']:.3f}]")

    # Print individual results
    print(f"\nIndividual Results:")
    for i, result in enumerate(results['individual_results'], 1):
        print(f"\n{i}. Query: {result['query']}")
        print(f"   Response: {result['response'][:100]}...")
        print(f"   Metrics: {result['metrics']}")


def example_7_intent_classification():
    """Example 7: Query intent classification."""
    print("\n" + "="*70)
    print("EXAMPLE 7: Intent Classification and Entity Extraction")
    print("="*70)

    from rag_pipeline import PreRetrieval

    pre = PreRetrieval()

    # Test different query types
    queries = [
        "What is fraud detection?",  # Factual
        "How does credit risk assessment work?",  # Analytical
        "Compare AML and KYC procedures",  # Comparative
        "What are the steps for model validation?",  # Procedural
    ]

    print("\nClassifying query intents and extracting entities:\n")

    for query in queries:
        intent = pre.classify_intent(query)
        entities = pre.extract_entities(query)
        rewritten = pre.rewrite_query(query, intent)

        print(f"Query: {query}")
        print(f"  Intent: {intent}")
        print(f"  Entities: {entities}")
        print(f"  Rewritten: {rewritten}")
        print()


def example_8_status_report():
    """Example 8: Generate comprehensive status report."""
    print("\n" + "="*70)
    print("EXAMPLE 8: System Status Report")
    print("="*70)

    rag = RAGPipeline()

    # Vector store status
    vector_stats = rag.vector_store.get_stats()
    print("\nVector Store:")
    print(f"  Backend: {vector_stats['backend']}")
    print(f"  Collections: {vector_stats['total_collections']}")
    print(f"  Total Documents: {vector_stats.get('total_documents', 'N/A')}")

    if vector_stats['collections']:
        print(f"  Collection Names:")
        for coll in vector_stats['collections'][:10]:  # Show first 10
            print(f"    - {coll}")

    # Cache status
    cache_stats = rag.cache.get_stats()
    print("\nCache:")
    print(f"  Query Cache Entries: {cache_stats['query_cache_entries']}")
    print(f"  Embedding Cache Entries: {cache_stats['embedding_cache_entries']}")
    print(f"  Total Hits: {cache_stats['total_cache_hits']}")
    print(f"  Hit Rate: {cache_stats['cache_hit_rate']:.1%}")

    # Component status
    print("\nComponents:")
    print(f"  Ollama Available: {rag.ollama.is_available()}")
    print(f"  Embedding Method: {rag.embedder.use_method}")
    print(f"  Chunking Strategy: {rag.chunker.strategy}")
    print(f"  Token Counting: {'tiktoken' if rag.token_mgr.use_tiktoken else 'word-based'}")


def example_9_chunking_strategies():
    """Example 9: Compare different chunking strategies."""
    print("\n" + "="*70)
    print("EXAMPLE 9: Chunking Strategies Comparison")
    print("="*70)

    from rag_pipeline import DocumentChunker

    # Sample text
    text = """Data governance is a critical aspect of modern banking operations.
It involves the management of data availability, usability, integrity, and security.
Effective data governance ensures regulatory compliance and drives business value.

Key components include data quality monitoring, data lineage tracking, and access controls.
Organizations must establish clear policies and procedures for data management.
Regular audits and assessments help maintain governance standards."""

    strategies = ['fixed', 'recursive', 'sentence']

    print(f"\nOriginal text ({len(text)} chars):")
    print(f"{text}\n")

    for strategy in strategies:
        chunker = DocumentChunker(
            chunk_size=50,  # Small for demo
            chunk_overlap=10,
            strategy=strategy
        )

        chunks = chunker.chunk_text(text, metadata={'source': 'example.txt'})

        print(f"\nStrategy: {strategy}")
        print(f"  Chunks created: {len(chunks)}")
        print(f"  Average chunk size: {sum(len(c['text']) for c in chunks) / len(chunks):.0f} chars")

        for i, chunk in enumerate(chunks[:2], 1):  # Show first 2
            print(f"  Chunk {i}: {chunk['text'][:60]}...")


def main():
    """Run all examples."""
    print("\n" + "="*70)
    print("RAG PIPELINE - USAGE EXAMPLES")
    print("="*70)

    examples = [
        ("Basic Query", example_1_basic_query),
        ("Ingest and Query", example_2_ingest_and_query),
        ("Multiple Collections", example_3_multiple_collections),
        ("Custom Configuration", example_4_custom_config),
        ("Caching Demo", example_5_cache_demo),
        ("Batch Evaluation", example_6_batch_evaluation),
        ("Intent Classification", example_7_intent_classification),
        ("Status Report", example_8_status_report),
        ("Chunking Strategies", example_9_chunking_strategies),
    ]

    print("\nAvailable examples:")
    for i, (name, _) in enumerate(examples, 1):
        print(f"  {i}. {name}")

    print("\nRunning selected examples...\n")

    # Run examples that don't require prior ingestion
    selected = [
        example_4_custom_config,
        example_7_intent_classification,
        example_8_status_report,
        example_9_chunking_strategies,
    ]

    for example_func in selected:
        try:
            example_func()
        except Exception as e:
            print(f"\nExample failed: {e}")

    print("\n" + "="*70)
    print("Examples completed!")
    print("="*70)
    print("\nTo run all examples (including ingestion):")
    print("  1. First ingest data: python3 rag_pipeline.py --ingest")
    print("  2. Then run: python3 example_rag_usage.py")
    print("\nFor full pipeline usage:")
    print("  python3 rag_pipeline.py --help")


if __name__ == "__main__":
    main()
