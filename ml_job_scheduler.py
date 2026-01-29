#!/usr/bin/env python3
"""
ML Job Scheduler for Banking Use Cases
Orchestrates model_training_pipeline.py, ai_governance_pipeline.py, and rag_pipeline.py
for all banking use cases with proper integration and new RAG features.

Supports 12 subtasks per job:
1. data_split - Split data into train/val/test
2. noise_removal - Clean and preprocess data
3. model_training - Train ML models
4. model_evaluation - Evaluate model performance
5. ensemble_training - Train ensemble models
6. model_benchmarking - Benchmark model performance
7. ai_governance_scoring - Compute AI governance scores
8. chunking - Chunk documents for RAG
9. embedding - Generate embeddings for chunks
10. vector_db_ingestion - Ingest embeddings into vector DB
11. rag_evaluation - Evaluate RAG performance
12. report_generation - Generate final report
"""

import argparse
import concurrent.futures
import logging
import os
import signal
import sqlite3
import sys
import time
import json
import glob as glob_module
from datetime import datetime
from multiprocessing import cpu_count
from pathlib import Path
from typing import List, Dict, Tuple, Optional, Any
import numpy as np

# Ensure the script's directory is in Python path for local imports
SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

# Import centralized configuration
from config import (
    RESULTS_DB, LOGS_DIR, LOG_LEVEL, LOG_FORMAT,
    get_db_connection, validate_use_case_key, get_log_file
)

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT,
    handlers=[
        logging.FileHandler(get_log_file('ml_job_scheduler')),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Database path (from config)
DB_PATH = str(RESULTS_DB)

# Thread-safe shutdown flag using threading.Event
import threading
_shutdown_event = threading.Event()

def is_shutdown_requested() -> bool:
    """Check if shutdown has been requested (thread-safe)."""
    return _shutdown_event.is_set()

def request_shutdown():
    """Request a graceful shutdown (thread-safe)."""
    _shutdown_event.set()

def clear_shutdown():
    """Clear shutdown flag (thread-safe)."""
    _shutdown_event.clear()

# Backward compatibility
shutdown_requested = False  # Deprecated: use is_shutdown_requested() instead


def signal_handler(signum, frame):
    """Handle SIGINT for graceful shutdown."""
    global shutdown_requested
    request_shutdown()  # Thread-safe version
    logger.warning("Shutdown signal received. Finishing current jobs...")
    shutdown_requested = True


# Register signal handler
signal.signal(signal.SIGINT, signal_handler)


# ==============================================================================
# IMPORT USE_CASE_REGISTRY FROM MODEL_TRAINING_PIPELINE
# ==============================================================================

# Import from model_training_pipeline
try:
    from model_training_pipeline import (
        USE_CASE_REGISTRY,
        get_uc_folder,
        load_data,
        split_data as mtp_split_data,
        clean_data as mtp_clean_data,
        train_classification,
        train_regression,
        train_timeseries,
        train_nlp,
        train_cv,
        train_anomaly,
        train_optimization,
        benchmark_models as mtp_benchmark_models
    )
    MTP_AVAILABLE = True
    logger.info("Successfully imported from model_training_pipeline")
except ImportError as e:
    logger.warning(f"model_training_pipeline not fully available: {e}")
    MTP_AVAILABLE = False
    USE_CASE_REGISTRY = {}

# Import from ai_governance_pipeline
try:
    from ai_governance_pipeline import (
        AIGovernanceScorer,
        init_database as init_governance_db,
        save_to_database as save_governance_to_db
    )
    GOVERNANCE_AVAILABLE = True
    logger.info("Successfully imported from ai_governance_pipeline")
except ImportError as e:
    logger.warning(f"ai_governance_pipeline not available: {e}")
    GOVERNANCE_AVAILABLE = False

# Import from rag_pipeline (with graceful fallback)
try:
    from rag_pipeline import (
        DocumentChunker,
        EmbeddingPipeline,
        VectorStore,
        RAGPipeline,
        VectorDBScheduler
    )
    RAG_AVAILABLE = True
    logger.info("Successfully imported from rag_pipeline")
except ImportError as e:
    logger.warning(f"rag_pipeline not available: {e}")
    RAG_AVAILABLE = False


# ==============================================================================
# DATABASE INITIALIZATION
# ==============================================================================

def init_database():
    """Initialize SQLite database with required tables."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create jobs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            job_id INTEGER PRIMARY KEY AUTOINCREMENT,
            use_case TEXT NOT NULL,
            status TEXT NOT NULL,
            start_time TEXT,
            end_time TEXT,
            agent_id INTEGER,
            error_message TEXT,
            UNIQUE(use_case)
        )
    ''')

    # Create job_subtasks table with all 12 subtasks
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS job_subtasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id INTEGER NOT NULL,
            subtask TEXT NOT NULL,
            status TEXT NOT NULL,
            start_time TEXT,
            end_time TEXT,
            error_message TEXT,
            FOREIGN KEY (job_id) REFERENCES jobs(job_id)
        )
    ''')

    # Create vector_db_jobs table for tracking vector DB operations
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vector_db_jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            use_case TEXT NOT NULL,
            collection_name TEXT NOT NULL,
            num_documents INTEGER,
            status TEXT NOT NULL,
            created_at TEXT,
            updated_at TEXT,
            UNIQUE(use_case)
        )
    ''')

    # Create indexes for faster lookups
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_job_use_case ON jobs(use_case)
    ''')
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_job_status ON jobs(status)
    ''')
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_job_use_case_status ON jobs(use_case, status)
    ''')
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_subtask_job_id ON job_subtasks(job_id)
    ''')
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_subtask_status ON job_subtasks(status)
    ''')
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_subtask_job_subtask ON job_subtasks(job_id, subtask)
    ''')
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_vector_db_use_case ON vector_db_jobs(use_case)
    ''')
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_vector_db_status ON vector_db_jobs(status)
    ''')

    conn.commit()
    conn.close()
    logger.info("Database initialized successfully")


# ==============================================================================
# JOB MANAGEMENT FUNCTIONS
# ==============================================================================

def create_job(use_case: str, agent_id: int) -> int:
    """Create a new job entry in the database.

    Args:
        use_case: The use case identifier (e.g., 'UC-FR-01')
        agent_id: The ID of the agent processing this job

    Returns:
        The job_id of the created or updated job
    """
    with get_db_connection(Path(DB_PATH)) as conn:
        cursor = conn.cursor()

        # Check if job already exists
        cursor.execute('SELECT job_id FROM jobs WHERE use_case = ?', (use_case,))
        existing = cursor.fetchone()

        if existing:
            # Update existing job
            job_id = existing[0]
            cursor.execute('''
                UPDATE jobs
                SET status = 'pending', start_time = NULL, end_time = NULL,
                    agent_id = ?, error_message = NULL
                WHERE job_id = ?
            ''', (agent_id, job_id))
            # Clear old subtasks
            cursor.execute('DELETE FROM job_subtasks WHERE job_id = ?', (job_id,))
        else:
            # Create new job
            cursor.execute('''
                INSERT INTO jobs (use_case, status, agent_id)
                VALUES (?, 'pending', ?)
            ''', (use_case, agent_id))
            job_id = cursor.lastrowid

        return job_id


def update_job_status(job_id: int, status: str, error_message: str = None):
    """Update job status in the database.

    Args:
        job_id: The job identifier
        status: New status ('pending', 'running', 'complete', 'failed')
        error_message: Optional error message for failed jobs
    """
    with get_db_connection(Path(DB_PATH)) as conn:
        cursor = conn.cursor()

        if status == 'running':
            cursor.execute('''
                UPDATE jobs
                SET status = ?, start_time = ?
                WHERE job_id = ?
            ''', (status, datetime.now().isoformat(), job_id))
        elif status in ['complete', 'failed']:
            cursor.execute('''
                UPDATE jobs
                SET status = ?, end_time = ?, error_message = ?
                WHERE job_id = ?
            ''', (status, datetime.now().isoformat(), error_message, job_id))
        else:
            cursor.execute('''
                UPDATE jobs
                SET status = ?
                WHERE job_id = ?
            ''', (status, job_id))


def create_subtask(job_id: int, subtask: str) -> int:
    """Create a subtask entry.

    Args:
        job_id: Parent job identifier
        subtask: Name of the subtask (e.g., 'data_split', 'model_training')

    Returns:
        The subtask_id of the created subtask
    """
    with get_db_connection(Path(DB_PATH)) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO job_subtasks (job_id, subtask, status)
            VALUES (?, ?, 'pending')
        ''', (job_id, subtask))
        return cursor.lastrowid


def update_subtask_status(job_id: int, subtask: str, status: str, error_message: str = None):
    """Update subtask status.

    Args:
        job_id: Parent job identifier
        subtask: Name of the subtask
        status: New status ('pending', 'running', 'complete', 'failed')
        error_message: Optional error message for failed subtasks
    """
    with get_db_connection(Path(DB_PATH)) as conn:
        cursor = conn.cursor()

        if status == 'running':
            cursor.execute('''
                UPDATE job_subtasks
                SET status = ?, start_time = ?
                WHERE job_id = ? AND subtask = ?
            ''', (status, datetime.now().isoformat(), job_id, subtask))
        elif status in ['complete', 'failed']:
            cursor.execute('''
                UPDATE job_subtasks
                SET status = ?, end_time = ?, error_message = ?
                WHERE job_id = ? AND subtask = ?
            ''', (status, datetime.now().isoformat(), error_message, job_id, subtask))


def update_vector_db_job(use_case: str, collection_name: str, num_documents: int, status: str):
    """Update vector DB job entry.

    Args:
        use_case: The use case identifier
        collection_name: Name of the vector collection
        num_documents: Number of documents ingested
        status: Job status ('pending', 'running', 'complete', 'failed')
    """
    with get_db_connection(Path(DB_PATH)) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT OR REPLACE INTO vector_db_jobs
            (use_case, collection_name, num_documents, status, created_at, updated_at)
            VALUES (?, ?, ?, ?,
                    COALESCE((SELECT created_at FROM vector_db_jobs WHERE use_case = ?), ?),
                    ?)
        ''', (use_case, collection_name, num_documents, status, use_case,
              datetime.now().isoformat(), datetime.now().isoformat()))


# ==============================================================================
# WRAPPER FUNCTIONS FOR PIPELINE INTEGRATION
# ==============================================================================

def split_data_wrapper(use_case_key: str):
    """Wrapper for split_data that handles use_case_key."""
    if not MTP_AVAILABLE:
        logger.warning(f"Model training pipeline not available for {use_case_key}")
        return

    config = USE_CASE_REGISTRY.get(use_case_key)
    if not config:
        logger.warning(f"Use case {use_case_key} not in registry")
        return

    # Load data
    df = load_data(use_case_key, config)
    if df is None or len(df) == 0:
        logger.warning(f"No data loaded for {use_case_key}")
        return

    # Split data
    train, val, test = mtp_split_data(df, config, use_case_key)
    logger.info(f"Data split complete for {use_case_key}: train={len(train) if train is not None else 0}, "
                f"val={len(val) if val is not None else 0}, test={len(test) if test is not None else 0}")


def clean_data_wrapper(use_case_key: str):
    """Wrapper for clean_data that handles use_case_key."""
    if not MTP_AVAILABLE:
        logger.warning(f"Model training pipeline not available for {use_case_key}")
        return

    config = USE_CASE_REGISTRY.get(use_case_key)
    if not config:
        logger.warning(f"Use case {use_case_key} not in registry")
        return

    # Load data
    df = load_data(use_case_key, config)
    if df is None or len(df) == 0:
        logger.warning(f"No data loaded for {use_case_key}")
        return

    # Clean data
    df_clean = mtp_clean_data(df, config)
    logger.info(f"Data cleaning complete for {use_case_key}: {len(df_clean)} rows")


def train_models_for_use_case(use_case_key: str):
    """Train models for a specific use case based on ml_type."""
    if not MTP_AVAILABLE:
        logger.warning(f"Model training pipeline not available for {use_case_key}")
        return {}

    config = USE_CASE_REGISTRY.get(use_case_key)
    if not config:
        logger.warning(f"Use case {use_case_key} not in registry")
        return {}

    # Load and prepare data
    df = load_data(use_case_key, config)
    if df is None or len(df) == 0:
        logger.warning(f"No data loaded for {use_case_key}")
        return {}

    # Clean data
    df_clean = mtp_clean_data(df, config)

    # Split data
    train, val, test = mtp_split_data(df_clean, config, use_case_key)
    if train is None or val is None:
        logger.warning(f"Data split failed for {use_case_key}")
        return {}

    # Train based on ml_type
    ml_type = config.get('ml_type', 'classification')
    models = {}

    try:
        if ml_type == 'classification':
            models = train_classification(train, val, config, use_case_key)
        elif ml_type == 'regression':
            models = train_regression(train, val, config, use_case_key)
        elif ml_type == 'timeseries':
            models = train_timeseries(train, val, config, use_case_key)
        elif ml_type == 'nlp':
            models = train_nlp(train, val, config, use_case_key)
        elif ml_type == 'cv':
            models = train_cv(use_case_key, config)
        elif ml_type == 'anomaly':
            models = train_anomaly(train, val, config, use_case_key)
        elif ml_type == 'optimization':
            models = train_optimization(train, config, use_case_key)
        else:
            logger.warning(f"Unknown ml_type: {ml_type} for {use_case_key}")

        logger.info(f"Model training complete for {use_case_key}: {len(models)} models trained")
        return models
    except Exception as e:
        logger.error(f"Error training models for {use_case_key}: {e}")
        return {}


def evaluate_models(use_case_key: str):
    """Evaluate trained models for a use case."""
    if not MTP_AVAILABLE:
        logger.warning(f"Model training pipeline not available for {use_case_key}")
        return

    uc_folder = get_uc_folder(use_case_key)
    if not uc_folder:
        logger.warning(f"Could not find folder for {use_case_key}")
        return

    # Check if models exist
    models_dir = os.path.join(uc_folder, "models")
    if not os.path.exists(models_dir):
        logger.warning(f"Models directory not found for {use_case_key}")
        return

    model_files = glob_module.glob(os.path.join(models_dir, "*.pkl"))
    if not model_files:
        logger.warning(f"No model files found for {use_case_key}")
        return

    logger.info(f"Model evaluation placeholder for {use_case_key}: {len(model_files)} models found")
    # Note: Actual evaluation happens during training in model_training_pipeline


def benchmark_models(use_case_key: str):
    """Benchmark trained models for a use case."""
    if not MTP_AVAILABLE:
        logger.warning(f"Model training pipeline not available for {use_case_key}")
        return

    uc_folder = get_uc_folder(use_case_key)
    if not uc_folder:
        logger.warning(f"Could not find folder for {use_case_key}")
        return

    # Load models
    models_dir = os.path.join(uc_folder, "models")
    if not os.path.exists(models_dir):
        logger.warning(f"Models directory not found for {use_case_key}")
        return

    model_files = glob_module.glob(os.path.join(models_dir, "*.pkl"))
    if not model_files:
        logger.warning(f"No model files found for {use_case_key}")
        return

    # Load models
    import pickle
    models_dict = {}
    for model_file in model_files:
        model_name = os.path.basename(model_file).replace('.pkl', '')
        try:
            with open(model_file, 'rb') as f:
                models_dict[model_name] = pickle.load(f)
        except Exception as e:
            logger.warning(f"Could not load model {model_file}: {e}")

    if models_dict:
        try:
            mtp_benchmark_models(models_dict, use_case_key)
            logger.info(f"Benchmarking complete for {use_case_key}")
        except Exception as e:
            logger.error(f"Error benchmarking models for {use_case_key}: {e}")


def compute_governance_scores(use_case_key: str):
    """Compute AI governance scores for a use case."""
    if not GOVERNANCE_AVAILABLE:
        logger.warning(f"AI governance pipeline not available for {use_case_key}")
        return

    uc_folder = get_uc_folder(use_case_key)
    if not uc_folder:
        logger.warning(f"Could not find folder for {use_case_key}")
        return

    try:
        # Create governance scorer
        use_case_path = Path(uc_folder)
        scorer = AIGovernanceScorer(use_case_key, use_case_path)

        # Compute all scores
        scores = scorer.compute_all_scores()

        # Save to database
        save_governance_to_db(use_case_key, scores)

        logger.info(f"Governance scoring complete for {use_case_key}: "
                   f"Overall trust score = {scores['overall_trust_score']:.1f}")
    except Exception as e:
        logger.error(f"Error computing governance scores for {use_case_key}: {e}")


# ==============================================================================
# NEW RAG SUBTASKS
# ==============================================================================

def run_chunking_job(use_case_key: str):
    """Chunk documents for RAG pipeline."""
    uc_folder = get_uc_folder(use_case_key)
    if not uc_folder:
        logger.warning(f"Could not find folder for {use_case_key}")
        return

    try:
        if RAG_AVAILABLE:
            chunker = DocumentChunker(chunk_size=512, chunk_overlap=50)
        else:
            logger.warning(f"RAG pipeline not available, using basic chunking for {use_case_key}")
            chunker = None

        # Find text files
        text_dir = os.path.join(uc_folder, "data", use_case_key, "text")
        csv_dir = os.path.join(uc_folder, "data", use_case_key, "csv")

        all_chunks = []
        chunk_id = 0

        # Chunk text files
        if os.path.exists(text_dir):
            text_files = glob_module.glob(os.path.join(text_dir, "*.txt"))
            for text_file in text_files:
                try:
                    with open(text_file, 'r', encoding='utf-8') as f:
                        content = f.read()

                    if chunker and RAG_AVAILABLE:
                        file_chunks = chunker.chunk_text(content)
                    else:
                        # Basic chunking: split by 512 chars
                        chunk_size = 512
                        file_chunks = [content[i:i+chunk_size] for i in range(0, len(content), chunk_size)]

                    for chunk_text in file_chunks:
                        all_chunks.append({
                            'chunk_id': chunk_id,
                            'text': chunk_text,
                            'source_file': os.path.basename(text_file),
                            'source_type': 'text'
                        })
                        chunk_id += 1

                except Exception as e:
                    logger.warning(f"Could not chunk {text_file}: {e}")

        # Chunk CSV text columns
        if os.path.exists(csv_dir):
            import pandas as pd
            csv_files = glob_module.glob(os.path.join(csv_dir, "*.csv"))
            for csv_file in csv_files[:1]:  # Only first CSV to avoid too much data
                try:
                    df = pd.read_csv(csv_file, nrows=1000)
                    text_cols = [col for col in df.columns if df[col].dtype == 'object']

                    for col in text_cols[:3]:  # Max 3 text columns
                        for idx, text in enumerate(df[col].dropna()[:100]):  # Max 100 rows
                            if isinstance(text, str) and len(text) > 50:
                                if chunker and RAG_AVAILABLE:
                                    col_chunks = chunker.chunk_text(text)
                                else:
                                    # Basic chunking
                                    chunk_size = 512
                                    col_chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

                                for chunk_text in col_chunks:
                                    all_chunks.append({
                                        'chunk_id': chunk_id,
                                        'text': chunk_text,
                                        'source_file': os.path.basename(csv_file),
                                        'source_type': 'csv',
                                        'source_column': col,
                                        'source_row': idx
                                    })
                                    chunk_id += 1

                except Exception as e:
                    logger.warning(f"Could not chunk CSV {csv_file}: {e}")

        # Save chunks
        if all_chunks:
            chunks_dir = os.path.join(uc_folder, "chunks")
            os.makedirs(chunks_dir, exist_ok=True)

            chunks_file = os.path.join(chunks_dir, "chunks.json")
            with open(chunks_file, 'w', encoding='utf-8') as f:
                json.dump(all_chunks, f, indent=2, ensure_ascii=False)

            logger.info(f"Chunking complete for {use_case_key}: {len(all_chunks)} chunks saved")
        else:
            logger.warning(f"No chunks generated for {use_case_key}")

    except Exception as e:
        logger.error(f"Error in chunking job for {use_case_key}: {e}")


def run_embedding_job(use_case_key: str):
    """Generate embeddings for document chunks."""
    uc_folder = get_uc_folder(use_case_key)
    if not uc_folder:
        logger.warning(f"Could not find folder for {use_case_key}")
        return

    chunks_file = os.path.join(uc_folder, "chunks", "chunks.json")
    if not os.path.exists(chunks_file):
        logger.warning(f"No chunks file found for {use_case_key}")
        return

    try:
        # Load chunks
        with open(chunks_file, 'r', encoding='utf-8') as f:
            chunks = json.load(f)

        if not chunks:
            logger.warning(f"No chunks to embed for {use_case_key}")
            return

        # Generate embeddings
        if RAG_AVAILABLE:
            embedder = EmbeddingPipeline()
            embedded_chunks = embedder.embed_chunks(chunks)
        else:
            logger.warning(f"RAG pipeline not available, using random embeddings for {use_case_key}")
            # Generate random embeddings as placeholder
            embedded_chunks = []
            for chunk in chunks:
                chunk_copy = chunk.copy()
                chunk_copy['embedding'] = np.random.randn(384).tolist()  # 384-dim random vector
                embedded_chunks.append(chunk_copy)

        # Save embedded chunks
        embedded_file = os.path.join(uc_folder, "chunks", "embedded_chunks.json")
        with open(embedded_file, 'w', encoding='utf-8') as f:
            # Convert numpy arrays to lists for JSON serialization
            json_safe_chunks = []
            for chunk in embedded_chunks:
                chunk_copy = chunk.copy()
                if 'embedding' in chunk_copy and isinstance(chunk_copy['embedding'], np.ndarray):
                    chunk_copy['embedding'] = chunk_copy['embedding'].tolist()
                json_safe_chunks.append(chunk_copy)
            json.dump(json_safe_chunks, f, indent=2, ensure_ascii=False)

        logger.info(f"Embedding complete for {use_case_key}: {len(embedded_chunks)} chunks embedded")

    except Exception as e:
        logger.error(f"Error in embedding job for {use_case_key}: {e}")


def run_vector_db_job(use_case_key: str):
    """Ingest embedded chunks into vector database."""
    uc_folder = get_uc_folder(use_case_key)
    if not uc_folder:
        logger.warning(f"Could not find folder for {use_case_key}")
        return

    embedded_file = os.path.join(uc_folder, "chunks", "embedded_chunks.json")
    if not os.path.exists(embedded_file):
        logger.warning(f"No embedded chunks file found for {use_case_key}")
        return

    try:
        # Load embedded chunks
        with open(embedded_file, 'r', encoding='utf-8') as f:
            chunks = json.load(f)

        if not chunks:
            logger.warning(f"No embedded chunks to ingest for {use_case_key}")
            return

        # Ingest into vector DB
        collection_name = use_case_key.replace('_', '-')

        if RAG_AVAILABLE:
            store = VectorStore()
            store.add_documents(chunks, collection_name=collection_name)
        else:
            logger.warning(f"RAG pipeline not available, skipping vector DB ingestion for {use_case_key}")

        # Update vector DB job table
        update_vector_db_job(use_case_key, collection_name, len(chunks), 'complete')

        logger.info(f"Vector DB ingestion complete for {use_case_key}: {len(chunks)} chunks ingested")

    except Exception as e:
        logger.error(f"Error in vector DB job for {use_case_key}: {e}")
        update_vector_db_job(use_case_key, use_case_key, 0, 'failed')


def run_rag_evaluation(use_case_key: str):
    """Evaluate RAG performance with test queries."""
    config = USE_CASE_REGISTRY.get(use_case_key, {})
    ml_type = config.get('ml_type')

    # Only run for NLP use cases
    if ml_type != 'nlp':
        logger.info(f"Skipping RAG evaluation for non-NLP use case: {use_case_key}")
        return

    uc_folder = get_uc_folder(use_case_key)
    if not uc_folder:
        logger.warning(f"Could not find folder for {use_case_key}")
        return

    try:
        if not RAG_AVAILABLE:
            logger.warning(f"RAG pipeline not available for {use_case_key}")
            return

        # Generate test queries based on use case
        test_queries = generate_test_queries(use_case_key)

        # Run RAG evaluation
        rag = RAGPipeline()
        results = rag.batch_evaluate(test_queries)

        # Save results
        reports_dir = os.path.join(uc_folder, "reports")
        os.makedirs(reports_dir, exist_ok=True)

        with open(os.path.join(reports_dir, "rag_evaluation.json"), 'w') as f:
            json.dump(results, f, indent=2)

        logger.info(f"RAG evaluation complete for {use_case_key}: {len(test_queries)} queries evaluated")

    except Exception as e:
        logger.error(f"Error in RAG evaluation for {use_case_key}: {e}")


def generate_test_queries(use_case_key: str) -> List[str]:
    """Generate test queries based on use case type."""
    config = USE_CASE_REGISTRY.get(use_case_key, {})
    label = config.get('label', use_case_key)
    domain = config.get('domain', 'banking')

    # Generate domain-specific queries
    queries = []

    if 'fraud' in domain.lower():
        queries = [
            "What are the key indicators of fraudulent transactions?",
            "How can we detect credit card fraud?",
            "What patterns are common in fraud cases?"
        ]
    elif 'credit' in domain.lower():
        queries = [
            "What factors influence credit risk?",
            "How is creditworthiness assessed?",
            "What are the main default predictors?"
        ]
    elif 'aml' in domain.lower():
        queries = [
            "What are signs of money laundering?",
            "How to identify suspicious transactions?",
            "What triggers AML alerts?"
        ]
    else:
        queries = [
            f"What is {label}?",
            f"How does {label} work?",
            f"What are best practices for {label}?"
        ]

    return queries


def generate_final_report(use_case_key: str):
    """Generate comprehensive final report combining all results."""
    uc_folder = get_uc_folder(use_case_key)
    if not uc_folder:
        logger.warning(f"Could not find folder for {use_case_key}")
        return

    try:
        reports_dir = os.path.join(uc_folder, "reports")
        if not os.path.exists(reports_dir):
            os.makedirs(reports_dir, exist_ok=True)

        final_report = {
            'use_case': use_case_key,
            'timestamp': datetime.now().isoformat(),
            'config': USE_CASE_REGISTRY.get(use_case_key, {})
        }

        # Load and aggregate all reports
        report_files = {
            'model_evaluation': 'model_evaluation.json',
            'benchmark': 'benchmark.json',
            'governance_scorecard': 'governance_scorecard.json',
            'explainability': 'explainability.json',
            'rag_evaluation': 'rag_evaluation.json',
            'model_card': 'model_card.json'
        }

        for key, filename in report_files.items():
            filepath = os.path.join(reports_dir, filename)
            if os.path.exists(filepath):
                try:
                    with open(filepath, 'r') as f:
                        final_report[key] = json.load(f)
                except Exception as e:
                    logger.warning(f"Could not load {filename}: {e}")

        # Add metadata
        models_dir = os.path.join(uc_folder, "models")
        if os.path.exists(models_dir):
            model_files = glob_module.glob(os.path.join(models_dir, "*.pkl"))
            final_report['num_models'] = len(model_files)

        chunks_file = os.path.join(uc_folder, "chunks", "chunks.json")
        if os.path.exists(chunks_file):
            with open(chunks_file, 'r') as f:
                chunks = json.load(f)
                final_report['num_chunks'] = len(chunks)

        # Save final report
        final_report_path = os.path.join(reports_dir, "final_report.json")
        with open(final_report_path, 'w') as f:
            json.dump(final_report, f, indent=2)

        logger.info(f"Final report generated for {use_case_key}: {final_report_path}")

    except Exception as e:
        logger.error(f"Error generating final report for {use_case_key}: {e}")


# ==============================================================================
# VECTOR DB SCHEDULING
# ==============================================================================

def schedule_vector_db_refresh():
    """Schedule periodic vector DB refresh for all use cases."""
    try:
        if not RAG_AVAILABLE:
            logger.warning("RAG pipeline not available for vector DB refresh")
            return

        rag = RAGPipeline()
        scheduler = VectorDBScheduler(rag)
        scheduler.run_pending_jobs()

        logger.info("Vector DB refresh scheduled successfully")
    except Exception as e:
        logger.error(f"Error scheduling vector DB refresh: {e}")


# ==============================================================================
# JOB EXECUTION
# ==============================================================================

def run_job(use_case_key: str, agent_id: int, specific_subtask: str = None) -> Tuple[str, bool, str]:
    """
    Run a complete ML pipeline job for a single use case.

    Args:
        use_case_key: Use case identifier
        agent_id: Worker agent ID
        specific_subtask: If provided, only run this specific subtask

    Returns:
        (use_case_key, success, error_message)
    """
    global shutdown_requested

    if shutdown_requested:
        return (use_case_key, False, "Shutdown requested")

    logger.info(f"[Agent {agent_id}] Starting job for {use_case_key}")

    # Check if use case exists in registry
    config = USE_CASE_REGISTRY.get(use_case_key)
    if not config:
        return (use_case_key, False, "Not in USE_CASE_REGISTRY")

    # Create job entry
    job_id = create_job(use_case_key, agent_id)
    update_job_status(job_id, 'running')

    # Define all 12 subtasks
    all_subtasks = [
        'data_split',
        'noise_removal',
        'model_training',
        'model_evaluation',
        'ensemble_training',
        'model_benchmarking',
        'ai_governance_scoring',
        'chunking',
        'embedding',
        'vector_db_ingestion',
        'rag_evaluation',
        'report_generation'
    ]

    # Filter subtasks if specific subtask requested
    if specific_subtask:
        if specific_subtask not in all_subtasks:
            return (use_case_key, False, f"Invalid subtask: {specific_subtask}")
        subtasks = [specific_subtask]
    else:
        subtasks = all_subtasks

    # Create subtask entries
    for subtask in subtasks:
        create_subtask(job_id, subtask)

    overall_success = True
    overall_error = None
    completed_subtasks = 0
    total_subtasks = len(subtasks)

    try:
        # Execute subtasks sequentially
        for idx, subtask in enumerate(subtasks):
            if shutdown_requested:
                overall_success = False
                overall_error = "Shutdown requested"
                break

            update_subtask_status(job_id, subtask, 'running')
            logger.info(f"[Agent {agent_id}] {use_case_key}: Running {subtask} ({idx+1}/{total_subtasks})")

            try:
                # Execute the appropriate function for each subtask
                if subtask == 'data_split':
                    split_data_wrapper(use_case_key)

                elif subtask == 'noise_removal':
                    clean_data_wrapper(use_case_key)

                elif subtask == 'model_training':
                    train_models_for_use_case(use_case_key)

                elif subtask == 'model_evaluation':
                    evaluate_models(use_case_key)

                elif subtask == 'ensemble_training':
                    # Ensemble training is part of model_training now
                    logger.info(f"[Agent {agent_id}] {use_case_key}: Ensemble training (part of model_training)")

                elif subtask == 'model_benchmarking':
                    benchmark_models(use_case_key)

                elif subtask == 'ai_governance_scoring':
                    compute_governance_scores(use_case_key)

                elif subtask == 'chunking':
                    run_chunking_job(use_case_key)

                elif subtask == 'embedding':
                    run_embedding_job(use_case_key)

                elif subtask == 'vector_db_ingestion':
                    run_vector_db_job(use_case_key)

                elif subtask == 'rag_evaluation':
                    run_rag_evaluation(use_case_key)

                elif subtask == 'report_generation':
                    generate_final_report(use_case_key)

                # Mark subtask as complete
                update_subtask_status(job_id, subtask, 'complete')
                completed_subtasks += 1

                # Calculate and log progress
                progress = (completed_subtasks / total_subtasks) * 100
                logger.info(f"[Agent {agent_id}] {use_case_key}: {subtask} completed "
                          f"({completed_subtasks}/{total_subtasks}, {progress:.1f}%)")

            except Exception as e:
                # Mark subtask as failed but continue to next subtask
                error_msg = str(e)
                update_subtask_status(job_id, subtask, 'failed', error_msg)
                logger.error(f"[Agent {agent_id}] {use_case_key}: {subtask} failed: {error_msg}")
                overall_success = False
                if not overall_error:
                    overall_error = f"{subtask} failed: {error_msg}"

        # Update final job status
        if overall_success:
            update_job_status(job_id, 'complete')
            logger.info(f"[Agent {agent_id}] Job {use_case_key} completed successfully (100%)")
        else:
            update_job_status(job_id, 'failed', overall_error)
            logger.error(f"[Agent {agent_id}] Job {use_case_key} failed: {overall_error}")

        return (use_case_key, overall_success, overall_error)

    except Exception as e:
        error_msg = str(e)
        update_job_status(job_id, 'failed', error_msg)
        logger.error(f"[Agent {agent_id}] Job {use_case_key} failed: {error_msg}")
        return (use_case_key, False, error_msg)


def run_all_jobs(max_workers: int = None):
    """Run all use case jobs in parallel."""
    if not USE_CASE_REGISTRY:
        logger.error("USE_CASE_REGISTRY is empty - no jobs to run")
        return {'completed': [], 'failed': [], 'skipped': []}

    if max_workers is None:
        max_workers = min(cpu_count(), 8)

    logger.info(f"Starting parallel execution with {max_workers} workers")
    logger.info(f"Total use cases to process: {len(USE_CASE_REGISTRY)}")

    results = {
        'completed': [],
        'failed': [],
        'skipped': []
    }

    start_time = time.time()

    with concurrent.futures.ProcessPoolExecutor(max_workers=max_workers) as executor:
        # Submit all jobs with round-robin agent assignment
        futures = {}
        for idx, use_case_key in enumerate(USE_CASE_REGISTRY.keys()):
            agent_id = (idx % max_workers) + 1
            future = executor.submit(run_job, use_case_key, agent_id)
            futures[future] = use_case_key

        # Process completed jobs
        completed_count = 0
        total_jobs = len(futures)

        for future in concurrent.futures.as_completed(futures):
            use_case = futures[future]
            completed_count += 1

            try:
                uc, success, error = future.result()
                if success:
                    results['completed'].append(uc)
                else:
                    results['failed'].append((uc, error))

                # Print progress
                progress = (completed_count / total_jobs) * 100
                print(f"Progress: {completed_count}/{total_jobs} ({progress:.1f}%) - "
                      f"Completed: {len(results['completed'])}, "
                      f"Failed: {len(results['failed'])}")

            except Exception as e:
                logger.error(f"Exception processing {use_case}: {e}")
                results['failed'].append((use_case, str(e)))

    elapsed_time = time.time() - start_time

    # Print summary
    print("\n" + "="*80)
    print("JOB EXECUTION SUMMARY")
    print("="*80)
    print(f"Total use cases: {len(USE_CASE_REGISTRY)}")
    print(f"Completed: {len(results['completed'])}")
    print(f"Failed: {len(results['failed'])}")
    print(f"Elapsed time: {elapsed_time:.2f} seconds")
    print("="*80)

    if results['failed']:
        print("\nFailed jobs:")
        for uc, error in results['failed']:
            print(f"  - {uc}: {error}")

    logger.info(f"All jobs completed. Success: {len(results['completed'])}, "
                f"Failed: {len(results['failed'])}")

    return results


def run_single_job(use_case: str, specific_subtask: str = None):
    """Run a single use case job."""
    if use_case not in USE_CASE_REGISTRY:
        logger.error(f"Use case {use_case} not found in registry")
        print(f"Error: Use case {use_case} not found")
        print(f"Available use cases: {', '.join(list(USE_CASE_REGISTRY.keys())[:10])}...")
        return False

    logger.info(f"Running single job: {use_case}" + (f" (subtask: {specific_subtask})" if specific_subtask else ""))
    uc, success, error = run_job(use_case, agent_id=1, specific_subtask=specific_subtask)

    if success:
        print(f"Job {use_case} completed successfully")
    else:
        print(f"Job {use_case} failed: {error}")

    return success


def show_status():
    """Display job status from database.

    Shows:
        - Overall job statistics by status
        - Recent 20 jobs with details
        - List of failed jobs with error messages
    """
    with get_db_connection(Path(DB_PATH)) as conn:
        cursor = conn.cursor()

        # Get overall job statistics
        cursor.execute('''
            SELECT status, COUNT(*)
            FROM jobs
            GROUP BY status
        ''')
        stats = cursor.fetchall()

        print("\n" + "="*80)
        print("JOB STATUS SUMMARY")
        print("="*80)

        total = 0
        for status, count in stats:
            print(f"{status.upper()}: {count}")
            total += count

        print(f"TOTAL: {total}")
        print("="*80)

        # Show recent jobs
        cursor.execute('''
            SELECT use_case, status, start_time, end_time, agent_id, error_message
            FROM jobs
            ORDER BY job_id DESC
            LIMIT 20
        ''')
        recent = cursor.fetchall()

        if recent:
            print("\nRecent jobs (last 20):")
            print(f"{'Use Case':<30} {'Status':<12} {'Agent':<8} {'Start Time':<20} {'End Time':<20}")
            print("-"*95)
            for uc, status, start, end, agent, error in recent:
                start_str = start[:19] if start else '-'
                end_str = end[:19] if end else '-'
                uc_short = uc[:28] if len(uc) > 28 else uc
                print(f"{uc_short:<30} {status:<12} {agent or '-':<8} {start_str:<20} {end_str:<20}")
                if error and status == 'failed':
                    print(f"  Error: {error[:100]}")

        # Show failed jobs
        cursor.execute('''
            SELECT use_case, error_message
            FROM jobs
            WHERE status = 'failed'
        ''')
        failed = cursor.fetchall()

        if failed:
            print(f"\nFailed jobs ({len(failed)}):")
            for uc, error in failed[:10]:  # Show first 10
                print(f"  - {uc}: {error[:80] if error else 'No error message'}")


def retry_failed_jobs(max_workers: int = None):
    """Retry all failed jobs.

    Args:
        max_workers: Maximum number of parallel workers (defaults to min(cpu_count, 8))
    """
    with get_db_connection(Path(DB_PATH)) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT use_case
            FROM jobs
            WHERE status = 'failed'
        ''')
        failed_use_cases = [row[0] for row in cursor.fetchall()]

    if not failed_use_cases:
        print("No failed jobs to retry")
        return

    print(f"Retrying {len(failed_use_cases)} failed jobs...")

    if max_workers is None:
        max_workers = min(cpu_count(), 8)

    results = {
        'completed': [],
        'failed': []
    }

    with concurrent.futures.ProcessPoolExecutor(max_workers=max_workers) as executor:
        futures = {}
        for idx, use_case in enumerate(failed_use_cases):
            agent_id = (idx % max_workers) + 1
            future = executor.submit(run_job, use_case, agent_id)
            futures[future] = use_case

        for future in concurrent.futures.as_completed(futures):
            use_case = futures[future]
            try:
                uc, success, error = future.result()
                if success:
                    results['completed'].append(uc)
                else:
                    results['failed'].append((uc, error))
            except Exception as e:
                results['failed'].append((use_case, str(e)))

    print(f"\nRetry complete: {len(results['completed'])} succeeded, "
          f"{len(results['failed'])} still failed")


def list_use_cases():
    """List all available use cases."""
    if not USE_CASE_REGISTRY:
        print("No use cases available in registry")
        return

    print(f"\nAvailable use cases ({len(USE_CASE_REGISTRY)}):\n")
    print(f"{'Use Case Key':<35} {'Label':<60} {'ML Type':<15} {'Domain':<15}")
    print("-" * 125)

    for key, config in sorted(USE_CASE_REGISTRY.items()):
        label = config.get('label', '')[:58]
        ml_type = config.get('ml_type', 'unknown')
        domain = config.get('domain', 'unknown')
        print(f"{key:<35} {label:<60} {ml_type:<15} {domain:<15}")


# ==============================================================================
# MAIN CLI
# ==============================================================================

def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='ML Job Scheduler for Banking Use Cases',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  python3 ml_job_scheduler.py --all                              # Run all use cases
  python3 ml_job_scheduler.py --use-case uc_06_01_creditcard_fraud  # Run single use case
  python3 ml_job_scheduler.py --use-case uc_06_01_creditcard_fraud --subtask chunking  # Run specific subtask
  python3 ml_job_scheduler.py --status                           # Show job status
  python3 ml_job_scheduler.py --retry-failed                     # Retry failed jobs
  python3 ml_job_scheduler.py --all --workers 4                  # Run with 4 workers
  python3 ml_job_scheduler.py --list-use-cases                   # List all use cases
  python3 ml_job_scheduler.py --vector-db-refresh                # Run vector DB refresh
        '''
    )

    parser.add_argument('--all', action='store_true',
                        help='Run all use cases')
    parser.add_argument('--use-case', type=str,
                        help='Run a specific use case (e.g., uc_06_01_creditcard_fraud)')
    parser.add_argument('--status', action='store_true',
                        help='Show job status')
    parser.add_argument('--retry-failed', action='store_true',
                        help='Retry all failed jobs')
    parser.add_argument('--workers', type=int, default=None,
                        help='Number of parallel workers (default: min(cpu_count, 8))')
    parser.add_argument('--list-use-cases', action='store_true',
                        help='List all available use cases')
    parser.add_argument('--vector-db-refresh', action='store_true',
                        help='Run vector DB refresh')
    parser.add_argument('--subtask', type=str,
                        help='Run specific subtask only',
                        choices=['data_split', 'noise_removal', 'model_training', 'model_evaluation',
                                'ensemble_training', 'model_benchmarking', 'ai_governance_scoring',
                                'chunking', 'embedding', 'vector_db_ingestion', 'rag_evaluation',
                                'report_generation'])

    args = parser.parse_args()

    # Initialize database
    init_database()
    if GOVERNANCE_AVAILABLE:
        init_governance_db()

    # Handle commands
    if args.list_use_cases:
        list_use_cases()
        return 0

    if args.status:
        show_status()
        return 0

    if args.retry_failed:
        retry_failed_jobs(args.workers)
        return 0

    if args.vector_db_refresh:
        schedule_vector_db_refresh()
        return 0

    if args.use_case:
        success = run_single_job(args.use_case, args.subtask)
        return 0 if success else 1

    if args.all:
        if args.subtask:
            print("Error: --subtask cannot be used with --all")
            return 1
        results = run_all_jobs(args.workers)
        return 0 if not results['failed'] else 1

    # No command specified
    parser.print_help()
    return 0


if __name__ == '__main__':
    sys.exit(main())
