#!/usr/bin/env python3
"""
Comprehensive RAG (Retrieval-Augmented Generation) Pipeline for Banking Use Cases

This pipeline provides a complete RAG implementation with:
- Ollama integration for LLM generation and embeddings
- Document chunking (text, CSV, JSON)
- Token management
- Embedding pipeline with fallbacks
- Vector database (FAISS, ChromaDB, SQLite fallback)
- Query caching
- Pre-retrieval (query expansion, intent classification)
- Post-retrieval (reranking, filtering, deduplication)
- Output evaluation (groundedness, hallucination detection)
- Scheduled ingestion jobs
"""

import os
import sys
import json
import sqlite3
import hashlib
import logging
import argparse
import requests
import re
import time
import pickle
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import numpy as np

# Add script directory to path for local imports
_SCRIPT_DIR = Path(__file__).resolve().parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))

# Import centralized configuration
from config import (
    VECTOR_STORE_DIR, RAG_CACHE_DB, RESULTS_DB, USE_CASES_DIR,
    OLLAMA_BASE_URL, OLLAMA_MODEL, LOG_LEVEL, LOG_FORMAT,
    get_db_connection, validate_use_case_key, get_log_file
)

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT,
    handlers=[
        logging.FileHandler(get_log_file('rag_pipeline')),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Optional dependencies - gracefully handle missing imports
try:
    from sentence_transformers import SentenceTransformer, CrossEncoder
    SENTENCE_TRANSFORMERS_AVAILABLE = True
    logger.info("sentence-transformers loaded successfully")
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    logger.warning("sentence-transformers not available, will use fallback embeddings")

try:
    import faiss
    FAISS_AVAILABLE = True
    logger.info("FAISS loaded successfully")
except ImportError:
    FAISS_AVAILABLE = False
    logger.warning("FAISS not available, will use SQLite vector store")

try:
    import chromadb
    CHROMADB_AVAILABLE = True
    logger.info("ChromaDB loaded successfully")
except ImportError:
    CHROMADB_AVAILABLE = False
    logger.warning("ChromaDB not available")

try:
    import tiktoken
    TIKTOKEN_AVAILABLE = True
    logger.info("tiktoken loaded successfully")
except ImportError:
    TIKTOKEN_AVAILABLE = False
    logger.warning("tiktoken not available, will use word-based token estimation")

try:
    import nltk
    NLTK_AVAILABLE = True
    logger.info("nltk loaded successfully")
except ImportError:
    NLTK_AVAILABLE = False
    logger.warning("nltk not available, will use regex-based sentence splitting")

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False
    logger.warning("pandas not available, will use csv module for CSV parsing")

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity as sklearn_cosine_similarity
    SKLEARN_AVAILABLE = True
    logger.info("sklearn loaded successfully")
except ImportError:
    SKLEARN_AVAILABLE = False
    logger.warning("sklearn not available")


# ==================== Ollama Client ====================
class OllamaClient:
    """Client for interacting with local Ollama instance."""

    def __init__(self, base_url: str = None, model: str = None):
        self.base_url = base_url or OLLAMA_BASE_URL
        self.model = model or OLLAMA_MODEL
        self.timeout = 120
        logger.info(f"Initialized OllamaClient with model: {self.model}")

    def is_available(self) -> bool:
        """Check if Ollama service is running."""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except requests.exceptions.ConnectionError:
            logger.debug("Ollama service not reachable")
            return False
        except requests.exceptions.Timeout:
            logger.debug("Ollama service timeout")
            return False
        except requests.exceptions.RequestException as e:
            logger.debug(f"Ollama request error: {e}")
            return False

    def generate(self, prompt: str, system_prompt: Optional[str] = None,
                 temperature: float = 0.7, max_tokens: int = 2048) -> str:
        """Generate text using Ollama."""
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens
                }
            }

            if system_prompt:
                payload["system"] = system_prompt

            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=self.timeout
            )
            response.raise_for_status()

            result = response.json()
            return result.get("response", "")

        except requests.exceptions.ConnectionError:
            logger.error("Cannot connect to Ollama. Ensure Ollama is running.")
            return ""
        except requests.exceptions.Timeout:
            logger.error(f"Ollama request timeout after {self.timeout}s")
            return ""
        except requests.exceptions.HTTPError as e:
            logger.error(f"Ollama HTTP error: {e.response.status_code} - {e.response.text[:200]}")
            return ""
        except requests.exceptions.RequestException as e:
            logger.error(f"Ollama request error: {e}")
            return ""
        except ValueError as e:
            logger.error(f"Ollama response parsing error: {e}")
            return ""

    def embed(self, text: str) -> Optional[np.ndarray]:
        """Generate embeddings using Ollama."""
        try:
            response = requests.post(
                f"{self.base_url}/api/embeddings",
                json={"model": self.model, "prompt": text},
                timeout=30
            )
            response.raise_for_status()

            result = response.json()
            embedding = result.get("embedding", [])
            return np.array(embedding) if embedding else None

        except requests.exceptions.ConnectionError:
            logger.debug("Cannot connect to Ollama for embeddings")
            return None
        except requests.exceptions.Timeout:
            logger.debug("Ollama embedding request timeout")
            return None
        except requests.exceptions.HTTPError as e:
            logger.debug(f"Ollama embedding HTTP error: {e.response.status_code}")
            return None
        except requests.exceptions.RequestException as e:
            logger.debug(f"Ollama embedding request error: {e}")
            return None
        except (ValueError, KeyError) as e:
            logger.debug(f"Ollama embedding response parsing error: {e}")
            return None


# ==================== Token Manager ====================
class TokenManager:
    """Manages token counting and truncation."""

    def __init__(self, model_name: str = "llama3.2"):
        self.model_name = model_name

        if TIKTOKEN_AVAILABLE:
            try:
                # Try to get encoding for the model
                self.encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")
                self.use_tiktoken = True
                logger.info("Using tiktoken for token counting")
            except Exception:
                self.use_tiktoken = False
                logger.info("Using word-based token estimation")
        else:
            self.use_tiktoken = False
            logger.info("Using word-based token estimation")

    def count_tokens(self, text: str) -> int:
        """Count tokens in text."""
        if self.use_tiktoken:
            return len(self.encoding.encode(text))
        else:
            # Simple estimation: ~1.3 tokens per word
            words = len(text.split())
            return int(words * 1.3)

    def truncate_to_tokens(self, text: str, max_tokens: int) -> str:
        """Truncate text to fit within token limit."""
        current_tokens = self.count_tokens(text)

        if current_tokens <= max_tokens:
            return text

        # Binary search for the right length
        words = text.split()
        ratio = max_tokens / current_tokens
        estimated_words = int(len(words) * ratio * 0.9)  # 0.9 for safety margin

        truncated = ' '.join(words[:estimated_words])

        # Fine-tune if needed
        while self.count_tokens(truncated) > max_tokens and estimated_words > 0:
            estimated_words -= 10
            truncated = ' '.join(words[:estimated_words])

        return truncated

    def fits_context(self, texts: List[str], max_context: int = 4096) -> bool:
        """Check if combined texts fit in context window."""
        total_tokens = sum(self.count_tokens(text) for text in texts)
        return total_tokens <= max_context

    def estimate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """Estimate cost for API-based models (placeholder)."""
        # For local Ollama, cost is 0
        return 0.0


# ==================== Document Chunker ====================
class DocumentChunker:
    """Chunks documents using various strategies."""

    def __init__(self, chunk_size: int = 512, chunk_overlap: int = 50,
                 strategy: str = "recursive"):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.strategy = strategy
        self.token_manager = TokenManager()
        logger.info(f"Initialized DocumentChunker with strategy: {strategy}")

    def chunk_text(self, text: str, metadata: Optional[Dict] = None) -> List[Dict]:
        """Chunk text using the configured strategy."""
        if not text or not text.strip():
            return []

        metadata = metadata or {}

        if self.strategy == "fixed":
            chunks = self._chunk_fixed(text)
        elif self.strategy == "recursive":
            chunks = self._chunk_recursive(text)
        elif self.strategy == "sentence":
            chunks = self._chunk_sentence(text)
        elif self.strategy == "semantic":
            chunks = self._chunk_semantic(text)
        else:
            chunks = self._chunk_recursive(text)

        # Add metadata and IDs
        result = []
        for i, chunk_text in enumerate(chunks):
            chunk_dict = {
                'text': chunk_text,
                'metadata': metadata.copy(),
                'chunk_id': f"{metadata.get('source', 'unknown')}_{i}",
                'token_count': self.token_manager.count_tokens(chunk_text),
                'chunk_index': i
            }
            result.append(chunk_dict)

        return result

    def _chunk_fixed(self, text: str) -> List[str]:
        """Split text into fixed-size chunks."""
        words = text.split()
        chunks = []

        for i in range(0, len(words), self.chunk_size - self.chunk_overlap):
            chunk = ' '.join(words[i:i + self.chunk_size])
            if chunk.strip():
                chunks.append(chunk)

        return chunks

    def _chunk_recursive(self, text: str) -> List[str]:
        """Split text recursively: paragraph -> sentence -> word."""
        chunks = []

        # Split by paragraphs first
        paragraphs = text.split('\n\n')

        for para in paragraphs:
            if not para.strip():
                continue

            para_tokens = self.token_manager.count_tokens(para)

            if para_tokens <= self.chunk_size:
                chunks.append(para)
            else:
                # Split by sentences
                sentences = self._split_sentences(para)
                current_chunk = []
                current_size = 0

                for sent in sentences:
                    sent_tokens = self.token_manager.count_tokens(sent)

                    if current_size + sent_tokens <= self.chunk_size:
                        current_chunk.append(sent)
                        current_size += sent_tokens
                    else:
                        if current_chunk:
                            chunks.append(' '.join(current_chunk))
                        current_chunk = [sent]
                        current_size = sent_tokens

                if current_chunk:
                    chunks.append(' '.join(current_chunk))

        return chunks

    def _chunk_sentence(self, text: str) -> List[str]:
        """Split text by sentences, grouping to fit chunk size."""
        sentences = self._split_sentences(text)
        chunks = []
        current_chunk = []
        current_size = 0

        for sent in sentences:
            sent_tokens = self.token_manager.count_tokens(sent)

            if current_size + sent_tokens <= self.chunk_size:
                current_chunk.append(sent)
                current_size += sent_tokens
            else:
                if current_chunk:
                    chunks.append(' '.join(current_chunk))
                current_chunk = [sent]
                current_size = sent_tokens

        if current_chunk:
            chunks.append(' '.join(current_chunk))

        return chunks

    def _chunk_semantic(self, text: str) -> List[str]:
        """Group sentences by semantic similarity (simplified)."""
        # Fallback to sentence chunking if embeddings not available
        return self._chunk_sentence(text)

    def _split_sentences(self, text: str) -> List[str]:
        """Split text into sentences."""
        if NLTK_AVAILABLE:
            try:
                import nltk.data
                tokenizer = nltk.data.load('tokenizers/punkt/english.pickle')
                return tokenizer.tokenize(text)
            except Exception:
                pass

        # Fallback: simple regex-based sentence splitting
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]

    def chunk_csv(self, csv_path: str, text_columns: Optional[List[str]] = None) -> List[Dict]:
        """Chunk CSV file - each row or combined columns becomes a chunk."""
        chunks = []

        try:
            if PANDAS_AVAILABLE:
                df = pd.read_csv(csv_path)

                for idx, row in df.iterrows():
                    if text_columns:
                        text = ' | '.join([str(row[col]) for col in text_columns if col in df.columns])
                    else:
                        text = ' | '.join([f"{col}: {val}" for col, val in row.items()])

                    metadata = {
                        'source': csv_path,
                        'row_index': idx,
                        'file_type': 'csv'
                    }

                    chunk = {
                        'text': text,
                        'metadata': metadata,
                        'chunk_id': f"{Path(csv_path).stem}_row_{idx}",
                        'token_count': self.token_manager.count_tokens(text),
                        'chunk_index': idx
                    }
                    chunks.append(chunk)
            else:
                # Fallback: use csv module
                import csv
                with open(csv_path, 'r', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    for idx, row in enumerate(reader):
                        if text_columns:
                            text = ' | '.join([str(row.get(col, '')) for col in text_columns])
                        else:
                            text = ' | '.join([f"{k}: {v}" for k, v in row.items()])

                        metadata = {
                            'source': csv_path,
                            'row_index': idx,
                            'file_type': 'csv'
                        }

                        chunk = {
                            'text': text,
                            'metadata': metadata,
                            'chunk_id': f"{Path(csv_path).stem}_row_{idx}",
                            'token_count': self.token_manager.count_tokens(text),
                            'chunk_index': idx
                        }
                        chunks.append(chunk)

        except Exception as e:
            logger.error(f"Error chunking CSV {csv_path}: {e}")

        return chunks

    def chunk_json(self, json_path: str) -> List[Dict]:
        """Chunk JSON file - flatten and create chunks from key-value pairs."""
        chunks = []

        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            def flatten_json(obj, parent_key='', sep='_'):
                """Flatten nested JSON structure."""
                items = []
                if isinstance(obj, dict):
                    for k, v in obj.items():
                        new_key = f"{parent_key}{sep}{k}" if parent_key else k
                        if isinstance(v, (dict, list)):
                            items.extend(flatten_json(v, new_key, sep=sep).items())
                        else:
                            items.append((new_key, v))
                elif isinstance(obj, list):
                    for i, item in enumerate(obj):
                        new_key = f"{parent_key}{sep}{i}"
                        if isinstance(item, (dict, list)):
                            items.extend(flatten_json(item, new_key, sep=sep).items())
                        else:
                            items.append((new_key, item))
                return dict(items)

            flattened = flatten_json(data)

            # Group items into chunks
            current_chunk = []
            current_size = 0

            for key, value in flattened.items():
                text = f"{key}: {value}"
                tokens = self.token_manager.count_tokens(text)

                if current_size + tokens <= self.chunk_size:
                    current_chunk.append(text)
                    current_size += tokens
                else:
                    if current_chunk:
                        chunk_text = '\n'.join(current_chunk)
                        chunks.append({
                            'text': chunk_text,
                            'metadata': {
                                'source': json_path,
                                'file_type': 'json'
                            },
                            'chunk_id': f"{Path(json_path).stem}_{len(chunks)}",
                            'token_count': current_size,
                            'chunk_index': len(chunks)
                        })
                    current_chunk = [text]
                    current_size = tokens

            if current_chunk:
                chunk_text = '\n'.join(current_chunk)
                chunks.append({
                    'text': chunk_text,
                    'metadata': {
                        'source': json_path,
                        'file_type': 'json'
                    },
                    'chunk_id': f"{Path(json_path).stem}_{len(chunks)}",
                    'token_count': current_size,
                    'chunk_index': len(chunks)
                })

        except Exception as e:
            logger.error(f"Error chunking JSON {json_path}: {e}")

        return chunks

    def chunk_file(self, file_path: str) -> List[Dict]:
        """Auto-detect format and chunk accordingly."""
        path = Path(file_path)
        suffix = path.suffix.lower()

        try:
            if suffix == '.csv':
                return self.chunk_csv(file_path)
            elif suffix == '.json':
                return self.chunk_json(file_path)
            elif suffix in ['.txt', '.md', '.log']:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
                metadata = {
                    'source': file_path,
                    'file_type': suffix[1:]
                }
                return self.chunk_text(text, metadata)
            else:
                logger.warning(f"Unsupported file type: {suffix}")
                return []
        except Exception as e:
            logger.error(f"Error chunking file {file_path}: {e}")
            return []


# ==================== Embedding Pipeline ====================
class EmbeddingPipeline:
    """Generates embeddings with multiple fallback options."""

    def __init__(self, model_name: str = "all-MiniLM-L6-v2", device: str = "cpu"):
        self.model_name = model_name
        self.device = device
        self.model = None
        self.ollama_client = None
        self.tfidf_vectorizer = None
        self.use_method = None

        # Try sentence-transformers first
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                self.model = SentenceTransformer(model_name, device=device)
                self.use_method = "sentence-transformers"
                logger.info(f"Using sentence-transformers model: {model_name}")
            except Exception as e:
                logger.warning(f"Failed to load sentence-transformers: {e}")

        # Try Ollama embeddings
        if not self.use_method:
            self.ollama_client = OllamaClient()
            if self.ollama_client.is_available():
                self.use_method = "ollama"
                logger.info("Using Ollama for embeddings")

        # Fallback to TF-IDF
        if not self.use_method and SKLEARN_AVAILABLE:
            self.tfidf_vectorizer = TfidfVectorizer(max_features=384)
            self.use_method = "tfidf"
            logger.info("Using TF-IDF for embeddings (fallback)")

        if not self.use_method:
            logger.error("No embedding method available!")

    def embed_text(self, text: str) -> Optional[np.ndarray]:
        """Generate embedding for a single text."""
        if not text or not text.strip():
            return None

        try:
            if self.use_method == "sentence-transformers":
                embedding = self.model.encode(text, show_progress_bar=False)
                return np.array(embedding)

            elif self.use_method == "ollama":
                embedding = self.ollama_client.embed(text)
                return embedding

            elif self.use_method == "tfidf":
                # TF-IDF requires fitting first, will be done in embed_batch
                return None

        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return None

    def embed_batch(self, texts: List[str], batch_size: int = 32) -> List[np.ndarray]:
        """Generate embeddings for multiple texts."""
        if not texts:
            return []

        embeddings = []

        try:
            if self.use_method == "sentence-transformers":
                logger.info(f"Embedding {len(texts)} texts with sentence-transformers...")
                embeddings = self.model.encode(
                    texts,
                    batch_size=batch_size,
                    show_progress_bar=True
                )
                embeddings = [np.array(emb) for emb in embeddings]

            elif self.use_method == "ollama":
                logger.info(f"Embedding {len(texts)} texts with Ollama...")
                for i, text in enumerate(texts):
                    if i % 10 == 0:
                        logger.info(f"Progress: {i}/{len(texts)}")
                    emb = self.embed_text(text)
                    embeddings.append(emb if emb is not None else np.zeros(384))

            elif self.use_method == "tfidf":
                logger.info(f"Embedding {len(texts)} texts with TF-IDF...")
                # Fit and transform
                tfidf_matrix = self.tfidf_vectorizer.fit_transform(texts)
                embeddings = [np.array(tfidf_matrix[i].toarray()[0]) for i in range(len(texts))]

        except Exception as e:
            logger.error(f"Error in batch embedding: {e}")

        return embeddings

    def embed_chunks(self, chunks: List[Dict]) -> List[Dict]:
        """Add embeddings to chunks."""
        if not chunks:
            return chunks

        texts = [chunk['text'] for chunk in chunks]
        embeddings = self.embed_batch(texts)

        for chunk, embedding in zip(chunks, embeddings):
            chunk['embedding'] = embedding

        return chunks

    def similarity(self, emb1: np.ndarray, emb2: np.ndarray) -> float:
        """Compute cosine similarity between two embeddings."""
        if emb1 is None or emb2 is None:
            return 0.0

        # Normalize
        norm1 = np.linalg.norm(emb1)
        norm2 = np.linalg.norm(emb2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return np.dot(emb1, emb2) / (norm1 * norm2)


# ==================== Vector Store ====================
class VectorStore:
    """Vector database with multiple backend options."""

    def __init__(self, db_path: str = None,
                 engine: str = "faiss"):
        db_path = db_path or str(VECTOR_STORE_DIR)
        self.db_path = db_path
        self.engine = engine
        Path(db_path).mkdir(parents=True, exist_ok=True)

        # Initialize based on available engines
        if engine == "faiss" and FAISS_AVAILABLE:
            self.backend = "faiss"
            self.indices = {}  # collection_name -> faiss index
            self.metadata_store = {}  # collection_name -> list of metadata
            logger.info("Using FAISS vector store")
        elif engine == "chromadb" and CHROMADB_AVAILABLE:
            self.backend = "chromadb"
            self.client = chromadb.PersistentClient(path=db_path)
            logger.info("Using ChromaDB vector store")
        else:
            self.backend = "sqlite"
            self.conn = sqlite3.connect(f"{db_path}/vectors.db")
            self._init_sqlite_schema()
            logger.info("Using SQLite vector store (fallback)")

    def _init_sqlite_schema(self):
        """Initialize SQLite schema for vector storage."""
        cursor = self.conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS vectors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                collection TEXT NOT NULL,
                chunk_id TEXT NOT NULL,
                text TEXT NOT NULL,
                metadata_json TEXT,
                embedding_blob BLOB,
                embedding_shape TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_collection
            ON vectors(collection)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_chunk_id
            ON vectors(chunk_id)
        """)
        self.conn.commit()

    def add_documents(self, chunks_with_embeddings: List[Dict],
                     collection_name: str = "default"):
        """Add documents to vector store."""
        if not chunks_with_embeddings:
            return

        logger.info(f"Adding {len(chunks_with_embeddings)} documents to collection '{collection_name}'")

        if self.backend == "faiss":
            self._add_to_faiss(chunks_with_embeddings, collection_name)
        elif self.backend == "chromadb":
            self._add_to_chromadb(chunks_with_embeddings, collection_name)
        else:
            self._add_to_sqlite(chunks_with_embeddings, collection_name)

    def _add_to_faiss(self, chunks: List[Dict], collection: str):
        """Add to FAISS index."""
        embeddings = np.array([chunk['embedding'] for chunk in chunks])
        dim = embeddings.shape[1]

        if collection not in self.indices:
            # Create new index
            self.indices[collection] = faiss.IndexFlatIP(dim)  # Inner product (cosine after normalization)
            self.metadata_store[collection] = []

        # Normalize embeddings for cosine similarity
        faiss.normalize_L2(embeddings)

        # Add to index
        self.indices[collection].add(embeddings)

        # Store metadata
        for chunk in chunks:
            self.metadata_store[collection].append({
                'chunk_id': chunk['chunk_id'],
                'text': chunk['text'],
                'metadata': chunk['metadata'],
                'token_count': chunk.get('token_count', 0)
            })

        # Save index to disk
        index_path = f"{self.db_path}/{collection}.faiss"
        faiss.write_index(self.indices[collection], index_path)

        # Save metadata as JSON (safer than pickle - avoids code execution risk)
        metadata_path = f"{self.db_path}/{collection}_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(self.metadata_store[collection], f)

    def _add_to_chromadb(self, chunks: List[Dict], collection: str):
        """Add to ChromaDB."""
        coll = self.client.get_or_create_collection(collection)

        ids = [chunk['chunk_id'] for chunk in chunks]
        documents = [chunk['text'] for chunk in chunks]
        embeddings = [chunk['embedding'].tolist() for chunk in chunks]
        metadatas = [chunk['metadata'] for chunk in chunks]

        coll.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

    def _add_to_sqlite(self, chunks: List[Dict], collection: str):
        """Add to SQLite."""
        cursor = self.conn.cursor()

        for chunk in chunks:
            # Use numpy's tobytes for safer serialization (vs pickle code execution risk)
            emb_array = np.asarray(chunk['embedding'], dtype=np.float32)
            embedding_blob = emb_array.tobytes()
            metadata_json = json.dumps(chunk['metadata'])
            # Store shape info for reconstruction
            shape_json = json.dumps(list(emb_array.shape))

            cursor.execute("""
                INSERT INTO vectors (collection, chunk_id, text, metadata_json, embedding_blob, embedding_shape)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (collection, chunk['chunk_id'], chunk['text'], metadata_json, embedding_blob, shape_json))

        self.conn.commit()

    def search(self, query_embedding: np.ndarray, top_k: int = 5,
               collection_name: str = "default",
               filters: Optional[Dict] = None) -> List[Tuple[Dict, float]]:
        """Search for similar documents."""
        if self.backend == "faiss":
            return self._search_faiss(query_embedding, top_k, collection_name, filters)
        elif self.backend == "chromadb":
            return self._search_chromadb(query_embedding, top_k, collection_name, filters)
        else:
            return self._search_sqlite(query_embedding, top_k, collection_name, filters)

    def _search_faiss(self, query_emb: np.ndarray, top_k: int,
                      collection: str, filters: Optional[Dict]) -> List[Tuple[Dict, float]]:
        """Search FAISS index."""
        if collection not in self.indices:
            # Try to load from disk
            index_path = f"{self.db_path}/{collection}.faiss"
            metadata_path = f"{self.db_path}/{collection}_metadata.json"
            # Also check for legacy pickle format
            legacy_metadata_path = f"{self.db_path}/{collection}_metadata.pkl"

            if Path(index_path).exists():
                self.indices[collection] = faiss.read_index(index_path)
                if Path(metadata_path).exists():
                    with open(metadata_path, 'r') as f:
                        self.metadata_store[collection] = json.load(f)
                elif Path(legacy_metadata_path).exists():
                    # WARNING: Loading legacy pickle - security risk from untrusted files
                    logger.warning(f"Loading legacy pickle metadata for {collection} - consider re-indexing")
                    with open(legacy_metadata_path, 'rb') as f:
                        self.metadata_store[collection] = pickle.load(f)
                else:
                    logger.warning(f"Metadata not found for collection '{collection}'")
                    return []
            else:
                logger.warning(f"Collection '{collection}' not found")
                return []

        # Normalize query
        query_emb = query_emb.reshape(1, -1)
        faiss.normalize_L2(query_emb)

        # Search
        scores, indices = self.indices[collection].search(query_emb, top_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.metadata_store[collection]):
                continue

            doc = self.metadata_store[collection][idx]

            # Apply filters
            if filters:
                match = all(
                    doc['metadata'].get(k) == v
                    for k, v in filters.items()
                )
                if not match:
                    continue

            results.append((doc, float(score)))

        return results

    def _search_chromadb(self, query_emb: np.ndarray, top_k: int,
                         collection: str, filters: Optional[Dict]) -> List[Tuple[Dict, float]]:
        """Search ChromaDB."""
        try:
            coll = self.client.get_collection(collection)

            where_filter = filters if filters else None

            results = coll.query(
                query_embeddings=[query_emb.tolist()],
                n_results=top_k,
                where=where_filter
            )

            output = []
            for i, (doc, metadata, distance) in enumerate(zip(
                results['documents'][0],
                results['metadatas'][0],
                results['distances'][0]
            )):
                output.append(({
                    'text': doc,
                    'metadata': metadata,
                    'chunk_id': results['ids'][0][i]
                }, 1.0 - distance))  # Convert distance to similarity

            return output

        except Exception as e:
            logger.error(f"ChromaDB search error: {e}")
            return []

    def _search_sqlite(self, query_emb: np.ndarray, top_k: int,
                       collection: str, filters: Optional[Dict]) -> List[Tuple[Dict, float]]:
        """Search SQLite with numpy cosine similarity."""
        cursor = self.conn.cursor()

        cursor.execute("""
            SELECT chunk_id, text, metadata_json, embedding_blob, embedding_shape
            FROM vectors
            WHERE collection = ?
        """, (collection,))

        results = []
        for row in cursor.fetchall():
            chunk_id, text, metadata_json, embedding_blob, embedding_shape = row

            # Reconstruct embedding from bytes (safer than pickle)
            if embedding_shape:
                shape = tuple(json.loads(embedding_shape))
                stored_emb = np.frombuffer(embedding_blob, dtype=np.float32).reshape(shape)
            else:
                # Legacy fallback for old data stored with pickle
                stored_emb = pickle.loads(embedding_blob)
            metadata = json.loads(metadata_json)

            # Apply filters
            if filters:
                match = all(metadata.get(k) == v for k, v in filters.items())
                if not match:
                    continue

            # Compute similarity
            similarity = self._cosine_similarity(query_emb, stored_emb)

            results.append(({
                'chunk_id': chunk_id,
                'text': text,
                'metadata': metadata
            }, similarity))

        # Sort by similarity and return top_k
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]

    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """Compute cosine similarity."""
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)

        if norm_a == 0 or norm_b == 0:
            return 0.0

        return np.dot(a, b) / (norm_a * norm_b)

    def delete_collection(self, collection_name: str):
        """Delete a collection."""
        if self.backend == "faiss":
            if collection_name in self.indices:
                del self.indices[collection_name]
                del self.metadata_store[collection_name]

            # Delete files
            index_path = f"{self.db_path}/{collection_name}.faiss"
            metadata_path = f"{self.db_path}/{collection_name}_metadata.pkl"
            Path(index_path).unlink(missing_ok=True)
            Path(metadata_path).unlink(missing_ok=True)

        elif self.backend == "chromadb":
            try:
                self.client.delete_collection(collection_name)
            except Exception:
                pass

        else:
            cursor = self.conn.cursor()
            cursor.execute("DELETE FROM vectors WHERE collection = ?", (collection_name,))
            self.conn.commit()

    def list_collections(self) -> List[str]:
        """List all collections."""
        if self.backend == "faiss":
            return list(self.indices.keys())
        elif self.backend == "chromadb":
            return [c.name for c in self.client.list_collections()]
        else:
            cursor = self.conn.cursor()
            cursor.execute("SELECT DISTINCT collection FROM vectors")
            return [row[0] for row in cursor.fetchall()]

    def get_stats(self) -> Dict:
        """Get vector store statistics."""
        stats = {
            'backend': self.backend,
            'collections': self.list_collections(),
            'total_collections': len(self.list_collections())
        }

        if self.backend == "faiss":
            stats['total_documents'] = sum(
                len(self.metadata_store.get(c, []))
                for c in stats['collections']
            )
        elif self.backend == "chromadb":
            stats['total_documents'] = sum(
                self.client.get_collection(c).count()
                for c in stats['collections']
            )
        else:
            cursor = self.conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM vectors")
            stats['total_documents'] = cursor.fetchone()[0]

        return stats


# ==================== Cache Database ====================
class CacheDB:
    """SQLite-based cache for queries and embeddings."""

    def __init__(self, db_path: str = None):
        db_path = db_path or str(RAG_CACHE_DB)
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path)
        self._init_schema()
        logger.info(f"Initialized CacheDB at {db_path}")

    def _init_schema(self):
        """Initialize cache tables."""
        cursor = self.conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS query_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query_hash TEXT UNIQUE NOT NULL,
                query_text TEXT NOT NULL,
                response TEXT,
                embedding_blob BLOB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ttl_seconds INTEGER DEFAULT 3600,
                hit_count INTEGER DEFAULT 0
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS embedding_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text_hash TEXT UNIQUE NOT NULL,
                text TEXT NOT NULL,
                embedding_blob BLOB,
                embedding_shape TEXT,
                model_name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        self.conn.commit()

    def _hash_text(self, text: str) -> str:
        """Generate hash for text."""
        return hashlib.sha256(text.encode()).hexdigest()

    def get_cached_response(self, query: str, similarity_threshold: float = 0.95) -> Optional[str]:
        """Get cached response for similar query."""
        query_hash = self._hash_text(query)

        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT response, created_at, ttl_seconds
            FROM query_cache
            WHERE query_hash = ?
        """, (query_hash,))

        row = cursor.fetchone()
        if row:
            response, created_at, ttl = row

            # Check if expired
            created_time = datetime.fromisoformat(created_at)
            if datetime.now() - created_time > timedelta(seconds=ttl):
                return None

            # Update hit count
            cursor.execute("""
                UPDATE query_cache
                SET hit_count = hit_count + 1
                WHERE query_hash = ?
            """, (query_hash,))
            self.conn.commit()

            logger.info(f"Cache hit for query: {query[:50]}...")
            return response

        return None

    def cache_response(self, query: str, response: str,
                       query_embedding: Optional[np.ndarray] = None,
                       ttl: int = 3600):
        """Cache query-response pair."""
        query_hash = self._hash_text(query)

        # Use numpy's safer serialization instead of pickle
        if query_embedding is not None:
            emb_array = np.asarray(query_embedding, dtype=np.float32)
            embedding_blob = emb_array.tobytes()
            shape_json = json.dumps(list(emb_array.shape))
        else:
            embedding_blob = None
            shape_json = None

        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO query_cache
            (query_hash, query_text, response, embedding_blob, ttl_seconds)
            VALUES (?, ?, ?, ?, ?)
        """, (query_hash, query, response, embedding_blob, ttl))

        self.conn.commit()

    def get_cached_embedding(self, text: str) -> Optional[np.ndarray]:
        """Get cached embedding."""
        text_hash = self._hash_text(text)

        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT embedding_blob
            FROM embedding_cache
            WHERE text_hash = ?
        """, (text_hash,))

        row = cursor.fetchone()
        if row and row[0]:
            # Try to get shape info for safe deserialization
            cursor.execute("""
                SELECT embedding_shape FROM embedding_cache WHERE text_hash = ?
            """, (text_hash,))
            shape_row = cursor.fetchone()
            if shape_row and shape_row[0]:
                shape = tuple(json.loads(shape_row[0]))
                return np.frombuffer(row[0], dtype=np.float32).reshape(shape)
            else:
                # Legacy fallback - pickle (for old cached data)
                return pickle.loads(row[0])

        return None

    def cache_embedding(self, text: str, embedding: np.ndarray, model_name: str):
        """Cache text embedding."""
        text_hash = self._hash_text(text)
        # Use numpy's safer serialization
        emb_array = np.asarray(embedding, dtype=np.float32)
        embedding_blob = emb_array.tobytes()
        shape_json = json.dumps(list(emb_array.shape))

        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO embedding_cache
            (text_hash, text, embedding_blob, embedding_shape, model_name)
            VALUES (?, ?, ?, ?, ?)
        """, (text_hash, text, embedding_blob, shape_json, model_name))

        self.conn.commit()

    def clear_expired(self):
        """Remove expired cache entries."""
        cursor = self.conn.cursor()

        cursor.execute("""
            DELETE FROM query_cache
            WHERE datetime(created_at, '+' || ttl_seconds || ' seconds') < datetime('now')
        """)

        deleted = cursor.rowcount
        self.conn.commit()

        logger.info(f"Cleared {deleted} expired cache entries")
        return deleted

    def get_stats(self) -> Dict:
        """Get cache statistics."""
        cursor = self.conn.cursor()

        cursor.execute("SELECT COUNT(*), SUM(hit_count) FROM query_cache")
        query_count, total_hits = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) FROM embedding_cache")
        embedding_count = cursor.fetchone()[0]

        hit_rate = (total_hits / query_count) if query_count > 0 else 0

        return {
            'query_cache_entries': query_count,
            'embedding_cache_entries': embedding_count,
            'total_cache_hits': total_hits or 0,
            'cache_hit_rate': hit_rate
        }


# ==================== Pre-Retrieval Processing ====================
class PreRetrieval:
    """Pre-retrieval query processing."""

    def __init__(self, ollama_client: Optional[OllamaClient] = None):
        self.ollama = ollama_client
        logger.info("Initialized PreRetrieval processor")

    def expand_query(self, query: str) -> List[str]:
        """Expand query with alternative phrasings."""
        queries = [query]

        if self.ollama and self.ollama.is_available():
            try:
                prompt = f"""Generate 3 alternative phrasings of this query:
"{query}"

Provide only the alternative phrasings, one per line."""

                response = self.ollama.generate(prompt, temperature=0.7, max_tokens=200)

                if response:
                    alternatives = [line.strip() for line in response.split('\n') if line.strip()]
                    queries.extend(alternatives[:3])
            except Exception as e:
                logger.debug(f"Query expansion failed: {e}")

        return queries

    def classify_intent(self, query: str) -> str:
        """Classify query intent."""
        query_lower = query.lower()

        # Keyword-based classification
        if any(word in query_lower for word in ['what', 'who', 'when', 'where', 'define']):
            return 'factual'
        elif any(word in query_lower for word in ['how', 'why', 'explain', 'describe']):
            return 'analytical'
        elif any(word in query_lower for word in ['compare', 'difference', 'versus', 'vs']):
            return 'comparative'
        elif any(word in query_lower for word in ['procedure', 'process', 'steps', 'how to']):
            return 'procedural'
        else:
            return 'general'

    def extract_entities(self, query: str) -> Dict[str, List[str]]:
        """Extract banking entities from query."""
        entities = {
            'account_numbers': [],
            'amounts': [],
            'dates': [],
            'product_names': [],
            'domains': []
        }

        # Account numbers (simplified pattern)
        account_pattern = r'\b\d{8,16}\b'
        entities['account_numbers'] = re.findall(account_pattern, query)

        # Amounts
        amount_pattern = r'\$?\d+(?:,\d{3})*(?:\.\d{2})?'
        entities['amounts'] = re.findall(amount_pattern, query)

        # Dates
        date_pattern = r'\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b|\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b'
        entities['dates'] = re.findall(date_pattern, query)

        # Banking domains
        domains = {
            'fraud': ['fraud', 'suspicious', 'anomal'],
            'credit': ['credit', 'loan', 'lending'],
            'compliance': ['compliance', 'aml', 'kyc', 'regulation'],
            'collection': ['collection', 'recovery', 'delinquent'],
            'governance': ['governance', 'policy', 'procedure']
        }

        query_lower = query.lower()
        for domain, keywords in domains.items():
            if any(kw in query_lower for kw in keywords):
                entities['domains'].append(domain)

        return entities

    def build_filters(self, query: str, intent: str, entities: Dict) -> Optional[Dict]:
        """Build metadata filters for vector search."""
        filters = {}

        # Domain-based filtering
        if entities.get('domains'):
            # Map domains to use case patterns
            domain_map = {
                'fraud': 'UC-FR',
                'credit': 'UC-CR',
                'compliance': 'UC-AML',
                'collection': 'UC-COL',
                'governance': 'UC-GOV'
            }

            for domain in entities['domains']:
                if domain in domain_map:
                    filters['use_case_prefix'] = domain_map[domain]
                    break

        return filters if filters else None

    def rewrite_query(self, query: str, intent: str) -> str:
        """Rewrite query for better retrieval."""
        # Add banking context
        if intent == 'factual':
            prefix = "In the context of banking operations: "
        elif intent == 'procedural':
            prefix = "What is the procedure for "
        elif intent == 'analytical':
            prefix = "Explain in banking context: "
        else:
            prefix = ""

        return prefix + query if prefix else query


# ==================== Post-Retrieval Processing ====================
class PostRetrieval:
    """Post-retrieval processing and reranking."""

    def __init__(self, ollama_client: Optional[OllamaClient] = None):
        self.ollama = ollama_client
        self.cross_encoder = None

        # Try to load cross-encoder for reranking
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                self.cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
                logger.info("Loaded cross-encoder for reranking")
            except Exception:
                logger.info("Cross-encoder not available, will use alternative reranking")

    def rerank(self, query: str, retrieved_chunks: List[Tuple[Dict, float]],
               top_k: int = 5) -> List[Tuple[Dict, float]]:
        """Rerank retrieved chunks by relevance."""
        if not retrieved_chunks:
            return []

        if self.cross_encoder:
            return self._rerank_cross_encoder(query, retrieved_chunks, top_k)
        else:
            return self._rerank_keyword(query, retrieved_chunks, top_k)

    def _rerank_cross_encoder(self, query: str, chunks: List[Tuple[Dict, float]],
                              top_k: int) -> List[Tuple[Dict, float]]:
        """Rerank using cross-encoder model."""
        try:
            pairs = [(query, chunk[0]['text']) for chunk in chunks]
            scores = self.cross_encoder.predict(pairs)

            # Combine with original scores
            reranked = []
            for (chunk, orig_score), new_score in zip(chunks, scores):
                combined_score = 0.3 * orig_score + 0.7 * float(new_score)
                reranked.append((chunk, combined_score))

            reranked.sort(key=lambda x: x[1], reverse=True)
            return reranked[:top_k]

        except Exception as e:
            logger.error(f"Cross-encoder reranking failed: {e}")
            return chunks[:top_k]

    def _rerank_keyword(self, query: str, chunks: List[Tuple[Dict, float]],
                        top_k: int) -> List[Tuple[Dict, float]]:
        """Rerank using keyword overlap and original scores."""
        query_words = set(query.lower().split())

        reranked = []
        for chunk, orig_score in chunks:
            text_words = set(chunk['text'].lower().split())
            overlap = len(query_words & text_words) / len(query_words) if query_words else 0

            # Combine scores: 50% original similarity, 50% keyword overlap
            combined_score = 0.5 * orig_score + 0.5 * overlap
            reranked.append((chunk, combined_score))

        reranked.sort(key=lambda x: x[1], reverse=True)
        return reranked[:top_k]

    def filter_irrelevant(self, query: str, chunks: List[Tuple[Dict, float]],
                          min_score: float = 0.3) -> List[Tuple[Dict, float]]:
        """Remove chunks below relevance threshold."""
        return [(chunk, score) for chunk, score in chunks if score >= min_score]

    def deduplicate(self, chunks: List[Tuple[Dict, float]],
                    similarity_threshold: float = 0.9) -> List[Tuple[Dict, float]]:
        """Remove near-duplicate chunks."""
        if not chunks:
            return []

        deduplicated = [chunks[0]]

        for chunk, score in chunks[1:]:
            is_duplicate = False

            for existing_chunk, _ in deduplicated:
                # Simple text similarity check
                text1 = chunk['text'].lower()
                text2 = existing_chunk['text'].lower()

                # Jaccard similarity
                words1 = set(text1.split())
                words2 = set(text2.split())

                if words1 and words2:
                    similarity = len(words1 & words2) / len(words1 | words2)
                    if similarity >= similarity_threshold:
                        is_duplicate = True
                        break

            if not is_duplicate:
                deduplicated.append((chunk, score))

        return deduplicated

    def build_context(self, chunks: List[Tuple[Dict, float]],
                     max_tokens: int = 3000) -> str:
        """Combine chunks into context string with source attribution."""
        context_parts = []
        token_manager = TokenManager()
        current_tokens = 0

        for i, (chunk, score) in enumerate(chunks):
            source = chunk['metadata'].get('source', 'unknown')
            source_name = Path(source).stem if source != 'unknown' else 'unknown'

            chunk_text = chunk['text']
            chunk_tokens = token_manager.count_tokens(chunk_text)

            if current_tokens + chunk_tokens > max_tokens:
                break

            # Add source attribution
            attributed_text = f"[Source {i+1}: {source_name}, relevance: {score:.2f}]\n{chunk_text}\n"
            context_parts.append(attributed_text)
            current_tokens += chunk_tokens

        return "\n".join(context_parts)


# ==================== Output Evaluator ====================
class OutputEvaluator:
    """Evaluate RAG output quality."""

    def __init__(self):
        logger.info("Initialized OutputEvaluator")

    def evaluate_response(self, query: str, response: str,
                         retrieved_chunks: List[Tuple[Dict, float]]) -> Dict[str, float]:
        """Evaluate response quality."""
        scores = {
            'relevance_score': self._compute_relevance(query, response),
            'groundedness_score': self.check_groundedness(response, retrieved_chunks),
            'completeness_score': self._compute_completeness(query, response),
            'hallucination_score': self.detect_hallucination(response, retrieved_chunks),
            'coherence_score': self._compute_coherence(response)
        }

        return scores

    def _compute_relevance(self, query: str, response: str) -> float:
        """Check if response answers the query."""
        query_words = set(query.lower().split())
        response_words = set(response.lower().split())

        if not query_words:
            return 0.0

        # Keyword overlap
        overlap = len(query_words & response_words) / len(query_words)

        # Length check (not too short)
        length_score = min(len(response.split()) / 50, 1.0)

        return (overlap + length_score) / 2

    def check_groundedness(self, response: str,
                          chunks: List[Tuple[Dict, float]]) -> float:
        """Check if response is grounded in retrieved chunks."""
        if not chunks:
            return 0.0

        # Extract sentences from response
        sentences = self._split_sentences(response)
        if not sentences:
            return 0.0

        # Build corpus from chunks
        corpus_text = ' '.join([chunk[0]['text'].lower() for chunk in chunks])

        # Check how many sentences have supporting evidence
        grounded_count = 0
        for sentence in sentences:
            # Check if key phrases from sentence appear in corpus
            sentence_words = set(sentence.lower().split())
            # Remove common words
            sentence_words = sentence_words - {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at'}

            if len(sentence_words) < 2:
                continue

            # Check if at least 50% of content words appear in corpus
            found_words = sum(1 for word in sentence_words if word in corpus_text)
            if found_words / len(sentence_words) >= 0.5:
                grounded_count += 1

        return grounded_count / len(sentences)

    def detect_hallucination(self, response: str,
                            chunks: List[Tuple[Dict, float]]) -> float:
        """Detect hallucinations (info not in chunks). Lower is better."""
        # Inverse of groundedness
        groundedness = self.check_groundedness(response, chunks)
        return 1.0 - groundedness

    def _compute_completeness(self, query: str, response: str) -> float:
        """Check if response is complete."""
        # Simple heuristics

        # Length check
        if len(response.split()) < 20:
            length_score = 0.5
        else:
            length_score = 1.0

        # Check for query keywords in response
        query_words = set(query.lower().split())
        response_words = set(response.lower().split())
        coverage = len(query_words & response_words) / len(query_words) if query_words else 0

        return (length_score + coverage) / 2

    def _compute_coherence(self, response: str) -> float:
        """Check if response is well-structured."""
        sentences = self._split_sentences(response)

        if not sentences:
            return 0.0

        # Check for reasonable sentence length
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences)
        length_score = 1.0 if 10 <= avg_sentence_length <= 30 else 0.5

        # Check for proper capitalization and punctuation
        formatting_score = sum(
            1 for s in sentences
            if s[0].isupper() and s[-1] in '.!?'
        ) / len(sentences)

        return (length_score + formatting_score) / 2

    def _split_sentences(self, text: str) -> List[str]:
        """Split text into sentences."""
        if NLTK_AVAILABLE:
            try:
                import nltk.data
                tokenizer = nltk.data.load('tokenizers/punkt/english.pickle')
                return tokenizer.tokenize(text)
            except Exception:
                pass

        # Fallback: regex-based
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]

    def compute_metrics(self, query: str, response: str,
                       chunks: List[Tuple[Dict, float]],
                       ground_truth: Optional[str] = None) -> Dict[str, float]:
        """Compute all metrics."""
        metrics = self.evaluate_response(query, response, chunks)

        # Add ground truth metrics if available
        if ground_truth:
            # Simple word overlap metrics
            response_words = set(response.lower().split())
            truth_words = set(ground_truth.lower().split())

            precision = len(response_words & truth_words) / len(response_words) if response_words else 0
            recall = len(response_words & truth_words) / len(truth_words) if truth_words else 0
            f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

            metrics['precision'] = precision
            metrics['recall'] = recall
            metrics['f1_score'] = f1

        return metrics


# ==================== RAG Pipeline Orchestrator ====================
class RAGPipeline:
    """Main RAG pipeline orchestrator."""

    def __init__(self, config: Optional[Dict] = None):
        config = config or {}

        self.ollama = OllamaClient(
            model=config.get('ollama_model', 'llama3.2')
        )
        self.chunker = DocumentChunker(
            chunk_size=config.get('chunk_size', 512),
            chunk_overlap=config.get('chunk_overlap', 50),
            strategy=config.get('chunking_strategy', 'recursive')
        )
        self.token_mgr = TokenManager()
        self.embedder = EmbeddingPipeline(
            model_name=config.get('embedding_model', 'all-MiniLM-L6-v2')
        )
        self.vector_store = VectorStore(
            db_path=config.get('vector_db_path', str(VECTOR_STORE_DIR)),
            engine=config.get('vector_engine', 'faiss' if FAISS_AVAILABLE else 'sqlite')
        )
        self.cache = CacheDB(
            db_path=config.get('cache_db_path', str(RAG_CACHE_DB))
        )
        self.pre_retrieval = PreRetrieval(self.ollama)
        self.post_retrieval = PostRetrieval(self.ollama)
        self.evaluator = OutputEvaluator()

        self.base_path = Path(config.get('base_path', str(USE_CASES_DIR)))

        logger.info("RAG Pipeline initialized successfully")

    def ingest_use_case(self, use_case_path: str) -> Dict:
        """Ingest a single use case."""
        logger.info(f"Ingesting use case: {use_case_path}")

        use_case_path = Path(use_case_path)
        if not use_case_path.exists():
            logger.error(f"Use case path does not exist: {use_case_path}")
            return {'status': 'error', 'message': 'Path does not exist'}

        # Find all data files
        all_chunks = []

        # Look for csv and text directories
        for subdir in ['csv', 'text']:
            data_dir = use_case_path / subdir
            if not data_dir.exists():
                continue

            # Process all files
            for file_path in data_dir.glob('*'):
                if file_path.is_file():
                    logger.info(f"Processing file: {file_path}")

                    chunks = self.chunker.chunk_file(str(file_path))

                    # Add use case metadata
                    use_case_name = use_case_path.name
                    for chunk in chunks:
                        chunk['metadata']['use_case'] = use_case_name
                        chunk['metadata']['use_case_path'] = str(use_case_path)

                    all_chunks.extend(chunks)

        if not all_chunks:
            logger.warning(f"No data found in {use_case_path}")
            return {'status': 'warning', 'message': 'No data found', 'chunks': 0}

        logger.info(f"Created {len(all_chunks)} chunks, generating embeddings...")

        # Generate embeddings
        all_chunks = self.embedder.embed_chunks(all_chunks)

        # Store in vector database
        collection_name = use_case_path.name
        self.vector_store.add_documents(all_chunks, collection_name)

        logger.info(f"Successfully ingested {len(all_chunks)} chunks from {use_case_path.name}")

        return {
            'status': 'success',
            'use_case': use_case_path.name,
            'chunks': len(all_chunks),
            'collection': collection_name
        }

    def ingest_all(self) -> List[Dict]:
        """Ingest all use cases."""
        logger.info("Starting full ingestion of all use cases")

        results = []

        # Find all UC directories
        uc_paths = []

        # Search in multiple patterns
        patterns = [
            self.base_path / '*' / '*' / 'data' / 'UC-*',
            self.base_path / '*' / 'data' / 'UC-*',
        ]

        for pattern in patterns:
            for path in Path('/').glob(str(pattern)):
                if path.is_dir():
                    uc_paths.append(path)

        logger.info(f"Found {len(uc_paths)} use cases to ingest")

        for uc_path in uc_paths:
            try:
                result = self.ingest_use_case(str(uc_path))
                results.append(result)
            except Exception as e:
                logger.error(f"Failed to ingest {uc_path}: {e}")
                results.append({
                    'status': 'error',
                    'use_case': uc_path.name,
                    'message': str(e)
                })

        # Summary
        successful = sum(1 for r in results if r['status'] == 'success')
        total_chunks = sum(r.get('chunks', 0) for r in results)

        logger.info(f"Ingestion complete: {successful}/{len(results)} use cases, {total_chunks} total chunks")

        return results

    def query(self, question: str, use_case_filter: Optional[str] = None,
              top_k: int = 5) -> Dict:
        """Execute full RAG pipeline for a query."""
        logger.info(f"Processing query: {question}")

        start_time = time.time()

        # Step 1: Check cache
        cached_response = self.cache.get_cached_response(question)
        if cached_response:
            logger.info("Returning cached response")
            return {
                'response': cached_response,
                'sources': [],
                'scores': {},
                'metadata': {'cached': True, 'elapsed_time': time.time() - start_time}
            }

        # Step 2: Pre-retrieval processing
        intent = self.pre_retrieval.classify_intent(question)
        entities = self.pre_retrieval.extract_entities(question)
        filters = self.pre_retrieval.build_filters(question, intent, entities)

        # Add use case filter if specified
        if use_case_filter:
            filters = filters or {}
            filters['use_case'] = use_case_filter

        rewritten_query = self.pre_retrieval.rewrite_query(question, intent)

        logger.info(f"Query intent: {intent}, entities: {entities}")

        # Step 3: Embed query
        query_embedding = self.embedder.embed_text(rewritten_query)

        if query_embedding is None:
            logger.error("Failed to generate query embedding")
            return {
                'response': "Error: Could not generate query embedding",
                'sources': [],
                'scores': {},
                'metadata': {'error': True}
            }

        # Step 4: Vector search
        # Search across all collections if no filter
        if use_case_filter:
            collections = [use_case_filter]
        else:
            collections = self.vector_store.list_collections()

        all_results = []
        for collection in collections:
            try:
                results = self.vector_store.search(
                    query_embedding,
                    top_k=top_k * 2,  # Get more for reranking
                    collection_name=collection,
                    filters=filters
                )
                all_results.extend(results)
            except Exception as e:
                logger.debug(f"Search failed for collection {collection}: {e}")

        if not all_results:
            logger.warning("No relevant documents found")
            return {
                'response': "I could not find relevant information to answer your question.",
                'sources': [],
                'scores': {},
                'metadata': {'no_results': True}
            }

        # Sort by score
        all_results.sort(key=lambda x: x[1], reverse=True)
        all_results = all_results[:top_k * 2]

        logger.info(f"Retrieved {len(all_results)} candidates")

        # Step 5: Post-retrieval processing
        reranked = self.post_retrieval.rerank(question, all_results, top_k=top_k)
        filtered = self.post_retrieval.filter_irrelevant(question, reranked, min_score=0.2)
        deduplicated = self.post_retrieval.deduplicate(filtered)

        if not deduplicated:
            logger.warning("No relevant documents after post-processing")
            return {
                'response': "I could not find sufficiently relevant information to answer your question.",
                'sources': [],
                'scores': {},
                'metadata': {'filtered_out': True}
            }

        context = self.post_retrieval.build_context(deduplicated, max_tokens=3000)

        # Step 6: Generate response
        if self.ollama.is_available():
            system_prompt = """You are a helpful banking AI assistant. Answer the user's question based on the provided context.
If the context doesn't contain enough information, say so clearly.
Always ground your response in the provided sources."""

            prompt = f"""Context:
{context}

Question: {question}

Answer:"""

            response = self.ollama.generate(prompt, system_prompt=system_prompt, temperature=0.3)
        else:
            # Fallback: return context as response
            response = f"Based on the retrieved information:\n\n{context}"

        if not response:
            response = "I apologize, but I could not generate a response. Please try again."

        # Step 7: Evaluate output
        scores = self.evaluator.evaluate_response(question, response, deduplicated)

        logger.info(f"Response quality scores: {scores}")

        # Step 8: Cache result
        self.cache.cache_response(question, response, query_embedding, ttl=3600)

        # Prepare sources
        sources = []
        for chunk, score in deduplicated:
            sources.append({
                'text': chunk['text'][:200] + '...',
                'source': chunk['metadata'].get('source', 'unknown'),
                'use_case': chunk['metadata'].get('use_case', 'unknown'),
                'score': float(score)
            })

        elapsed_time = time.time() - start_time

        return {
            'response': response,
            'sources': sources,
            'scores': scores,
            'metadata': {
                'intent': intent,
                'entities': entities,
                'num_sources': len(sources),
                'elapsed_time': elapsed_time,
                'ollama_available': self.ollama.is_available()
            }
        }

    def batch_evaluate(self, test_queries: List[Dict]) -> Dict:
        """Evaluate RAG quality on test queries."""
        logger.info(f"Evaluating {len(test_queries)} test queries")

        results = []

        for i, test_item in enumerate(test_queries):
            query = test_item['query']
            ground_truth = test_item.get('ground_truth')

            logger.info(f"Evaluating query {i+1}/{len(test_queries)}: {query}")

            result = self.query(query)

            # Compute metrics
            chunks = [(
                {'text': src['text'], 'metadata': {}},
                src['score']
            ) for src in result['sources']]

            metrics = self.evaluator.compute_metrics(
                query,
                result['response'],
                chunks,
                ground_truth
            )

            results.append({
                'query': query,
                'response': result['response'],
                'metrics': metrics
            })

        # Aggregate metrics
        aggregated = {}
        metric_names = results[0]['metrics'].keys() if results else []

        for metric_name in metric_names:
            values = [r['metrics'][metric_name] for r in results if metric_name in r['metrics']]
            if values:
                aggregated[metric_name] = {
                    'mean': np.mean(values),
                    'std': np.std(values),
                    'min': np.min(values),
                    'max': np.max(values)
                }

        logger.info(f"Evaluation complete. Aggregate scores: {aggregated}")

        return {
            'individual_results': results,
            'aggregated_metrics': aggregated,
            'num_queries': len(test_queries)
        }


# ==================== Vector DB Scheduler ====================
class VectorDBScheduler:
    """Schedule and manage vector DB ingestion jobs."""

    def __init__(self, rag_pipeline: RAGPipeline):
        self.rag = rag_pipeline
        self.db_path = str(RESULTS_DB)
        self.conn = sqlite3.connect(self.db_path)
        self.create_schedule_table()
        logger.info("Initialized VectorDBScheduler")

    def create_schedule_table(self):
        """Create scheduling table."""
        cursor = self.conn.cursor()

        # Check if table exists
        cursor.execute("""
            SELECT name FROM sqlite_master
            WHERE type='table' AND name='vector_db_jobs'
        """)

        if cursor.fetchone() is None:
            # Create new table
            cursor.execute("""
                CREATE TABLE vector_db_jobs (
                    job_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    use_case TEXT UNIQUE NOT NULL,
                    status TEXT DEFAULT 'pending',
                    last_ingested TIMESTAMP,
                    next_scheduled TIMESTAMP,
                    chunk_count INTEGER DEFAULT 0,
                    error TEXT,
                    frequency TEXT DEFAULT 'daily',
                    file_hashes TEXT
                )
            """)
        else:
            # Check and add missing columns if needed
            cursor.execute("PRAGMA table_info(vector_db_jobs)")
            columns = {row[1] for row in cursor.fetchall()}

            required_columns = {
                'last_ingested': 'TIMESTAMP',
                'next_scheduled': 'TIMESTAMP',
                'chunk_count': 'INTEGER DEFAULT 0',
                'error': 'TEXT',
                'frequency': 'TEXT DEFAULT "daily"',
                'file_hashes': 'TEXT'
            }

            for col_name, col_type in required_columns.items():
                if col_name not in columns:
                    try:
                        cursor.execute(f"ALTER TABLE vector_db_jobs ADD COLUMN {col_name} {col_type}")
                    except Exception as e:
                        logger.debug(f"Could not add column {col_name}: {e}")

        self.conn.commit()

    def schedule_ingestion(self, use_case: str, frequency: str = "daily"):
        """Schedule a use case for periodic ingestion."""
        cursor = self.conn.cursor()

        next_scheduled = datetime.now() + timedelta(days=1 if frequency == "daily" else 7)

        cursor.execute("""
            INSERT OR REPLACE INTO vector_db_jobs
            (use_case, frequency, next_scheduled, status)
            VALUES (?, ?, ?, 'scheduled')
        """, (use_case, frequency, next_scheduled))

        self.conn.commit()
        logger.info(f"Scheduled {use_case} for {frequency} ingestion")

    def run_pending_jobs(self):
        """Run all pending ingestion jobs."""
        cursor = self.conn.cursor()

        cursor.execute("""
            SELECT job_id, use_case
            FROM vector_db_jobs
            WHERE next_scheduled <= datetime('now')
            AND status != 'running'
        """)

        jobs = cursor.fetchall()

        logger.info(f"Running {len(jobs)} pending jobs")

        for job_id, use_case in jobs:
            try:
                # Mark as running
                cursor.execute("""
                    UPDATE vector_db_jobs
                    SET status = 'running'
                    WHERE job_id = ?
                """, (job_id,))
                self.conn.commit()

                # Run ingestion
                result = self.rag.ingest_use_case(use_case)

                # Update status
                if result['status'] == 'success':
                    next_scheduled = datetime.now() + timedelta(days=1)
                    cursor.execute("""
                        UPDATE vector_db_jobs
                        SET status = 'completed',
                            last_ingested = datetime('now'),
                            next_scheduled = ?,
                            chunk_count = ?,
                            error = NULL
                        WHERE job_id = ?
                    """, (next_scheduled, result.get('chunks', 0), job_id))
                else:
                    cursor.execute("""
                        UPDATE vector_db_jobs
                        SET status = 'failed',
                            error = ?
                        WHERE job_id = ?
                    """, (result.get('message', 'Unknown error'), job_id))

                self.conn.commit()

            except Exception as e:
                logger.error(f"Job {job_id} failed: {e}")
                cursor.execute("""
                    UPDATE vector_db_jobs
                    SET status = 'failed',
                        error = ?
                    WHERE job_id = ?
                """, (str(e), job_id))
                self.conn.commit()

    def run_incremental_update(self, use_case: str):
        """Run incremental update for a use case."""
        # Get stored file hashes
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT file_hashes
            FROM vector_db_jobs
            WHERE use_case = ?
        """, (use_case,))

        row = cursor.fetchone()
        stored_hashes = json.loads(row[0]) if row and row[0] else {}

        # Compute current hashes
        use_case_path = Path(use_case)
        current_hashes = {}

        for subdir in ['csv', 'text']:
            data_dir = use_case_path / subdir
            if not data_dir.exists():
                continue

            for file_path in data_dir.glob('*'):
                if file_path.is_file():
                    with open(file_path, 'rb') as f:
                        file_hash = hashlib.sha256(f.read()).hexdigest()
                    current_hashes[str(file_path)] = file_hash

        # Find changed files
        changed_files = []
        for file_path, file_hash in current_hashes.items():
            if file_path not in stored_hashes or stored_hashes[file_path] != file_hash:
                changed_files.append(file_path)

        if not changed_files:
            logger.info(f"No changes detected for {use_case}")
            return

        logger.info(f"Detected {len(changed_files)} changed files, re-ingesting...")

        # Re-ingest (for simplicity, re-ingest entire use case)
        result = self.rag.ingest_use_case(use_case)

        # Update stored hashes
        cursor.execute("""
            UPDATE vector_db_jobs
            SET file_hashes = ?,
                last_ingested = datetime('now')
            WHERE use_case = ?
        """, (json.dumps(current_hashes), use_case))
        self.conn.commit()

    def get_status(self) -> List[Dict]:
        """Get ingestion status for all use cases."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT use_case, status, last_ingested, next_scheduled, chunk_count, error
            FROM vector_db_jobs
            ORDER BY use_case
        """)

        results = []
        for row in cursor.fetchall():
            results.append({
                'use_case': row[0],
                'status': row[1],
                'last_ingested': row[2],
                'next_scheduled': row[3],
                'chunk_count': row[4],
                'error': row[5]
            })

        return results


# ==================== Main Function ====================
def main():
    parser = argparse.ArgumentParser(description="RAG Pipeline for Banking Use Cases")

    parser.add_argument('--ingest', action='store_true',
                       help='Ingest all use cases')
    parser.add_argument('--ingest-uc', type=str,
                       help='Ingest specific use case (provide path)')
    parser.add_argument('--query', type=str,
                       help='Run a query')
    parser.add_argument('--schedule', action='store_true',
                       help='Run scheduled ingestion jobs')
    parser.add_argument('--status', action='store_true',
                       help='Show vector DB status')
    parser.add_argument('--evaluate', action='store_true',
                       help='Run evaluation on test queries')
    parser.add_argument('--use-case-filter', type=str,
                       help='Filter query to specific use case')
    parser.add_argument('--top-k', type=int, default=5,
                       help='Number of results to retrieve (default: 5)')

    args = parser.parse_args()

    # Initialize RAG pipeline
    logger.info("Initializing RAG Pipeline...")
    rag = RAGPipeline()

    if args.ingest:
        logger.info("Starting full ingestion...")
        results = rag.ingest_all()

        print("\n" + "="*60)
        print("INGESTION RESULTS")
        print("="*60)

        for result in results:
            status_symbol = "✓" if result['status'] == 'success' else "✗"
            print(f"{status_symbol} {result.get('use_case', 'unknown')}: "
                  f"{result.get('chunks', 0)} chunks ({result['status']})")
            if result.get('message'):
                print(f"  └─ {result['message']}")

        successful = sum(1 for r in results if r['status'] == 'success')
        total_chunks = sum(r.get('chunks', 0) for r in results)
        print(f"\nSummary: {successful}/{len(results)} use cases, {total_chunks} total chunks")

    elif args.ingest_uc:
        logger.info(f"Ingesting use case: {args.ingest_uc}")
        result = rag.ingest_use_case(args.ingest_uc)

        print("\n" + "="*60)
        print("INGESTION RESULT")
        print("="*60)
        print(f"Status: {result['status']}")
        print(f"Chunks: {result.get('chunks', 0)}")
        if result.get('message'):
            print(f"Message: {result['message']}")

    elif args.query:
        logger.info(f"Processing query: {args.query}")
        result = rag.query(
            args.query,
            use_case_filter=args.use_case_filter,
            top_k=args.top_k
        )

        print("\n" + "="*60)
        print("QUERY RESPONSE")
        print("="*60)
        print(f"\nQuestion: {args.query}\n")
        print(f"Answer: {result['response']}\n")

        print("Sources:")
        for i, source in enumerate(result['sources'], 1):
            print(f"\n{i}. Use Case: {source['use_case']}")
            print(f"   Score: {source['score']:.3f}")
            print(f"   Text: {source['text']}")

        print(f"\nQuality Scores:")
        for metric, value in result['scores'].items():
            print(f"  {metric}: {value:.3f}")

        print(f"\nMetadata:")
        for key, value in result['metadata'].items():
            print(f"  {key}: {value}")

    elif args.schedule:
        logger.info("Running scheduled jobs...")
        scheduler = VectorDBScheduler(rag)
        scheduler.run_pending_jobs()
        print("Scheduled jobs completed")

    elif args.status:
        print("\n" + "="*60)
        print("VECTOR STORE STATUS")
        print("="*60)

        stats = rag.vector_store.get_stats()
        print(f"\nBackend: {stats['backend']}")
        print(f"Collections: {stats['total_collections']}")
        print(f"Total Documents: {stats.get('total_documents', 'N/A')}")
        print(f"\nCollections:")
        for collection in stats['collections']:
            print(f"  - {collection}")

        print("\n" + "="*60)
        print("CACHE STATUS")
        print("="*60)

        cache_stats = rag.cache.get_stats()
        print(f"\nQuery Cache Entries: {cache_stats['query_cache_entries']}")
        print(f"Embedding Cache Entries: {cache_stats['embedding_cache_entries']}")
        print(f"Total Cache Hits: {cache_stats['total_cache_hits']}")
        print(f"Cache Hit Rate: {cache_stats['cache_hit_rate']:.2%}")

        # Scheduler status
        print("\n" + "="*60)
        print("INGESTION SCHEDULE")
        print("="*60)

        scheduler = VectorDBScheduler(rag)
        schedule_status = scheduler.get_status()

        if schedule_status:
            for job in schedule_status:
                print(f"\nUse Case: {job['use_case']}")
                print(f"  Status: {job['status']}")
                print(f"  Last Ingested: {job['last_ingested'] or 'Never'}")
                print(f"  Next Scheduled: {job['next_scheduled'] or 'Not scheduled'}")
                print(f"  Chunk Count: {job['chunk_count']}")
                if job['error']:
                    print(f"  Error: {job['error']}")
        else:
            print("\nNo scheduled jobs")

    elif args.evaluate:
        # Sample test queries
        test_queries = [
            {
                'query': 'What are the fraud detection policies?',
                'ground_truth': None
            },
            {
                'query': 'How does the collections process work?',
                'ground_truth': None
            },
            {
                'query': 'What compliance requirements must be met?',
                'ground_truth': None
            }
        ]

        logger.info("Running evaluation...")
        results = rag.batch_evaluate(test_queries)

        print("\n" + "="*60)
        print("EVALUATION RESULTS")
        print("="*60)

        print(f"\nNumber of Queries: {results['num_queries']}\n")

        print("Aggregated Metrics:")
        for metric, stats in results['aggregated_metrics'].items():
            print(f"\n{metric}:")
            print(f"  Mean: {stats['mean']:.3f}")
            print(f"  Std: {stats['std']:.3f}")
            print(f"  Min: {stats['min']:.3f}")
            print(f"  Max: {stats['max']:.3f}")

        print("\n" + "="*60)
        print("INDIVIDUAL RESULTS")
        print("="*60)

        for i, result in enumerate(results['individual_results'], 1):
            print(f"\nQuery {i}: {result['query']}")
            print(f"Response: {result['response'][:200]}...")
            print(f"Metrics: {result['metrics']}")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
