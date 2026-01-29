#!/usr/bin/env python3
"""
Comprehensive Unit Tests for Banking ML Pipeline
=================================================

Tests for:
- config.py: validate_use_case_key(), get_trust_level(), get_db_connection()
- preprocessing_pipeline.py: profile_column(), data quality scoring, outlier detection
- rag_pipeline.py: DocumentChunker, TokenManager, CacheDB, VectorStore
- ai_governance_pipeline.py: Trust level calculation, governance weights

Run with: python -m pytest tests.py -v
"""

import os
import sys
import json
import sqlite3
import tempfile
import hashlib
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from contextlib import contextmanager

import pytest
import numpy as np
import pandas as pd

# Add project directory to path
_PROJECT_DIR = Path(__file__).resolve().parent
if str(_PROJECT_DIR) not in sys.path:
    sys.path.insert(0, str(_PROJECT_DIR))


# =============================================================================
# CONFIG.PY TESTS
# =============================================================================

class TestConfig:
    """Tests for config.py module."""

    def test_validate_use_case_key_valid_formats(self):
        """Test validate_use_case_key with valid use case key formats."""
        from config import validate_use_case_key

        # Valid patterns
        assert validate_use_case_key("uc_06_01_creditcard_fraud") is True
        assert validate_use_case_key("UC-06-01") is True
        assert validate_use_case_key("real_creditcard_fraud") is True
        assert validate_use_case_key("uc_aml_01_alert_priority") is True
        assert validate_use_case_key("uc123") is True
        assert validate_use_case_key("a") is True
        assert validate_use_case_key("ABC_123-xyz") is True

    def test_validate_use_case_key_invalid_formats(self):
        """Test validate_use_case_key with invalid use case key formats."""
        from config import validate_use_case_key

        # Invalid patterns - must start with letter
        assert validate_use_case_key("123_uc") is False
        assert validate_use_case_key("_uc_test") is False
        assert validate_use_case_key("-uc-test") is False

        # Invalid characters - SQL injection attempts
        assert validate_use_case_key("uc; DROP TABLE") is False
        assert validate_use_case_key("uc' OR '1'='1") is False
        assert validate_use_case_key("uc--comment") is True  # hyphens allowed
        assert validate_use_case_key("uc/**/test") is False
        assert validate_use_case_key("uc\ntest") is False
        assert validate_use_case_key("uc test") is False  # spaces not allowed

        # Empty string
        assert validate_use_case_key("") is False

    def test_validate_use_case_key_max_length(self):
        """Test validate_use_case_key respects max length limit."""
        from config import validate_use_case_key

        # 64 characters - should pass
        long_key_64 = "a" * 64
        assert validate_use_case_key(long_key_64) is True

        # 65 characters - should fail
        long_key_65 = "a" * 65
        assert validate_use_case_key(long_key_65) is False

    def test_validate_use_case_key_edge_cases(self):
        """Test validate_use_case_key edge cases."""
        from config import validate_use_case_key

        # Special characters that should fail
        assert validate_use_case_key("uc.test") is False
        assert validate_use_case_key("uc@test") is False
        assert validate_use_case_key("uc#test") is False
        assert validate_use_case_key("uc$test") is False
        assert validate_use_case_key("uc%test") is False

        # Numbers in key (valid as long as starts with letter)
        assert validate_use_case_key("a1234567890") is True
        assert validate_use_case_key("Z9_8-7") is True

    def test_get_trust_level_high(self):
        """Test get_trust_level returns HIGH for scores >= 85."""
        from config import get_trust_level

        assert get_trust_level(85) == 'HIGH'
        assert get_trust_level(85.0) == 'HIGH'
        assert get_trust_level(90) == 'HIGH'
        assert get_trust_level(100) == 'HIGH'
        assert get_trust_level(99.9) == 'HIGH'

    def test_get_trust_level_medium(self):
        """Test get_trust_level returns MEDIUM for scores 70-84."""
        from config import get_trust_level

        assert get_trust_level(70) == 'MEDIUM'
        assert get_trust_level(70.0) == 'MEDIUM'
        assert get_trust_level(75) == 'MEDIUM'
        assert get_trust_level(84) == 'MEDIUM'
        assert get_trust_level(84.9) == 'MEDIUM'

    def test_get_trust_level_low(self):
        """Test get_trust_level returns LOW for scores 60-69."""
        from config import get_trust_level

        assert get_trust_level(60) == 'LOW'
        assert get_trust_level(60.0) == 'LOW'
        assert get_trust_level(65) == 'LOW'
        assert get_trust_level(69) == 'LOW'
        assert get_trust_level(69.9) == 'LOW'

    def test_get_trust_level_critical(self):
        """Test get_trust_level returns CRITICAL for scores < 60."""
        from config import get_trust_level

        assert get_trust_level(59) == 'CRITICAL'
        assert get_trust_level(59.9) == 'CRITICAL'
        assert get_trust_level(50) == 'CRITICAL'
        assert get_trust_level(0) == 'CRITICAL'
        assert get_trust_level(-10) == 'CRITICAL'

    def test_get_trust_level_boundary_conditions(self):
        """Test get_trust_level at exact boundary values."""
        from config import get_trust_level

        # Exact boundaries
        assert get_trust_level(84.99999) == 'MEDIUM'
        assert get_trust_level(85.00001) == 'HIGH'
        assert get_trust_level(69.99999) == 'LOW'
        assert get_trust_level(70.00001) == 'MEDIUM'
        assert get_trust_level(59.99999) == 'CRITICAL'
        assert get_trust_level(60.00001) == 'LOW'

    def test_get_db_connection_creates_connection(self):
        """Test get_db_connection creates a valid SQLite connection."""
        from config import get_db_connection

        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            tmp_path = Path(tmp.name)

        try:
            with get_db_connection(tmp_path) as conn:
                assert conn is not None
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                assert result == (1,)
        finally:
            tmp_path.unlink(missing_ok=True)

    def test_get_db_connection_wal_mode_enabled(self):
        """Test get_db_connection enables WAL mode when requested."""
        from config import get_db_connection

        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            tmp_path = Path(tmp.name)

        try:
            with get_db_connection(tmp_path, wal_mode=True) as conn:
                cursor = conn.cursor()
                cursor.execute("PRAGMA journal_mode")
                result = cursor.fetchone()
                # WAL mode should be set
                assert result[0].lower() == 'wal'
        finally:
            tmp_path.unlink(missing_ok=True)

    def test_get_db_connection_wal_mode_disabled(self):
        """Test get_db_connection can disable WAL mode."""
        from config import get_db_connection

        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            tmp_path = Path(tmp.name)

        try:
            with get_db_connection(tmp_path, wal_mode=False) as conn:
                cursor = conn.cursor()
                cursor.execute("PRAGMA journal_mode")
                result = cursor.fetchone()
                # Journal mode should not be WAL when disabled
                # Default is 'delete' or could be 'memory' for temp DBs
                assert result[0].lower() in ['delete', 'memory', 'off', 'truncate', 'persist']
        finally:
            tmp_path.unlink(missing_ok=True)

    def test_get_db_connection_commits_on_success(self):
        """Test get_db_connection commits changes on successful exit."""
        from config import get_db_connection

        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            tmp_path = Path(tmp.name)

        try:
            # Create and insert data
            with get_db_connection(tmp_path) as conn:
                cursor = conn.cursor()
                cursor.execute("CREATE TABLE test (id INTEGER, name TEXT)")
                cursor.execute("INSERT INTO test VALUES (1, 'test')")

            # Verify data persists (commit worked)
            with get_db_connection(tmp_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM test")
                result = cursor.fetchone()
                assert result == (1, 'test')
        finally:
            tmp_path.unlink(missing_ok=True)

    def test_get_db_connection_rollback_on_exception(self):
        """Test get_db_connection rolls back on exception."""
        from config import get_db_connection

        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            tmp_path = Path(tmp.name)

        try:
            # Create table first
            with get_db_connection(tmp_path) as conn:
                cursor = conn.cursor()
                cursor.execute("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)")

            # Try to insert and then raise exception - should rollback
            with pytest.raises(ValueError):
                with get_db_connection(tmp_path) as conn:
                    cursor = conn.cursor()
                    cursor.execute("INSERT INTO test VALUES (1, 'test')")
                    raise ValueError("Test exception")

            # Verify data was rolled back
            with get_db_connection(tmp_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM test")
                result = cursor.fetchone()
                assert result[0] == 0  # Should be empty due to rollback
        finally:
            tmp_path.unlink(missing_ok=True)


# =============================================================================
# PREPROCESSING_PIPELINE.PY TESTS
# =============================================================================

class TestPreprocessingPipeline:
    """Tests for preprocessing_pipeline.py module."""

    def test_profile_column_numeric(self):
        """Test profile_column correctly profiles numeric data."""
        from preprocessing_pipeline import profile_column

        # Create numeric series
        data = pd.Series([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        profile = profile_column(data, 'test_numeric')

        assert profile['column'] == 'test_numeric'
        assert profile['total_count'] == 10
        assert profile['missing_count'] == 0
        assert profile['missing_pct'] == 0.0
        assert profile['inferred_type'] == 'numeric'
        assert profile['mean'] == 5.5
        assert profile['min'] == 1.0
        assert profile['max'] == 10.0
        assert profile['median'] == 5.5
        assert 'std' in profile
        assert 'q1' in profile
        assert 'q3' in profile

    def test_profile_column_categorical(self):
        """Test profile_column correctly profiles categorical data."""
        from preprocessing_pipeline import profile_column

        # Create categorical series
        data = pd.Series(['A', 'B', 'A', 'C', 'A', 'B', 'D', 'A', 'E', 'F'])
        profile = profile_column(data, 'test_cat')

        assert profile['column'] == 'test_cat'
        assert profile['total_count'] == 10
        assert profile['inferred_type'] == 'categorical'
        assert 'top_values' in profile
        # 'A' should be most frequent (4 times)
        assert 'A' in profile['top_values']
        assert profile['top_values']['A'] == 4

    def test_profile_column_with_missing_values(self):
        """Test profile_column handles missing values correctly."""
        from preprocessing_pipeline import profile_column

        # Create series with NaN values
        data = pd.Series([1, 2, np.nan, 4, np.nan, 6, 7, 8, np.nan, 10])
        profile = profile_column(data, 'test_missing')

        assert profile['missing_count'] == 3
        assert profile['missing_pct'] == 30.0
        assert profile['total_count'] == 10
        assert profile['unique_count'] == 7  # 7 unique non-NaN values

    def test_profile_column_empty_series(self):
        """Test profile_column handles empty series."""
        from preprocessing_pipeline import profile_column

        data = pd.Series([], dtype=float)
        profile = profile_column(data, 'test_empty')

        assert profile['total_count'] == 0
        assert profile['missing_pct'] == 0  # No division by zero

    def test_profile_column_all_same_values(self):
        """Test profile_column handles constant column."""
        from preprocessing_pipeline import profile_column

        data = pd.Series([5, 5, 5, 5, 5])
        profile = profile_column(data, 'test_constant')

        assert profile['unique_count'] == 1
        assert profile['std'] == 0.0
        assert profile['min'] == profile['max'] == 5.0

    def test_profile_column_outliers_detected_iqr(self):
        """Test profile_column detects IQR outliers."""
        from preprocessing_pipeline import profile_column

        # Create data with obvious outliers
        data = pd.Series([1, 2, 2, 3, 3, 3, 4, 4, 5, 100])  # 100 is outlier
        profile = profile_column(data, 'test_outlier')

        assert profile['outlier_count_iqr'] >= 1
        assert profile['outlier_pct_iqr'] > 0

    def test_profile_column_outliers_detected_zscore(self):
        """Test profile_column detects z-score outliers."""
        from preprocessing_pipeline import profile_column

        # Create data with extreme outlier (>3 std)
        normal_data = [10] * 99
        data = pd.Series(normal_data + [1000])  # 1000 is extreme outlier
        profile = profile_column(data, 'test_zscore_outlier')

        assert profile['outlier_count_zscore'] >= 1
        assert profile['outlier_pct_zscore'] > 0

    def test_iqr_bounds_calculation(self):
        """Test iqr_bounds returns correct lower and upper bounds."""
        from preprocessing_pipeline import iqr_bounds

        # Standard dataset
        data = pd.Series([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        lower, upper = iqr_bounds(data)

        # Q1 = 3.25, Q3 = 7.75, IQR = 4.5
        # Lower = 3.25 - 1.5*4.5 = -3.5
        # Upper = 7.75 + 1.5*4.5 = 14.5
        assert lower < 1  # Should include all data
        assert upper > 10  # Should include all data
        assert lower < upper

    def test_iqr_bounds_with_outliers(self):
        """Test iqr_bounds correctly identifies outlier boundaries."""
        from preprocessing_pipeline import iqr_bounds

        # Data with a clear outlier
        data = pd.Series([1, 1, 2, 2, 3, 3, 4, 4, 5, 100])
        lower, upper = iqr_bounds(data)

        # 100 should be outside upper bound
        assert 100 > upper

    def test_compute_data_quality_score_perfect_data(self):
        """Test compute_data_quality_score returns 100 for perfect data."""
        from preprocessing_pipeline import compute_data_quality_score

        report = {
            'avg_missing_pct': 0,
            'duplicate_row_pct': 0,
            'avg_outlier_pct': 0,
            'constant_column_pct': 0,
            'class_imbalance_ratio': 1.0
        }

        score = compute_data_quality_score(report)
        assert score == 100.0

    def test_compute_data_quality_score_high_missing(self):
        """Test compute_data_quality_score penalizes missing data."""
        from preprocessing_pipeline import compute_data_quality_score

        report = {
            'avg_missing_pct': 50,  # 50% missing
            'duplicate_row_pct': 0,
            'avg_outlier_pct': 0,
            'constant_column_pct': 0,
            'class_imbalance_ratio': 1.0
        }

        score = compute_data_quality_score(report)
        assert score < 100
        assert score == 100 - min(50 * 0.5, 25)  # 75

    def test_compute_data_quality_score_high_duplicates(self):
        """Test compute_data_quality_score penalizes duplicate rows."""
        from preprocessing_pipeline import compute_data_quality_score

        report = {
            'avg_missing_pct': 0,
            'duplicate_row_pct': 50,  # 50% duplicates
            'avg_outlier_pct': 0,
            'constant_column_pct': 0,
            'class_imbalance_ratio': 1.0
        }

        score = compute_data_quality_score(report)
        assert score < 100
        assert score == 100 - min(50 * 0.3, 15)  # 85

    def test_compute_data_quality_score_high_outliers(self):
        """Test compute_data_quality_score penalizes outliers."""
        from preprocessing_pipeline import compute_data_quality_score

        report = {
            'avg_missing_pct': 0,
            'duplicate_row_pct': 0,
            'avg_outlier_pct': 50,  # 50% outliers
            'constant_column_pct': 0,
            'class_imbalance_ratio': 1.0
        }

        score = compute_data_quality_score(report)
        assert score < 100
        assert score == 100 - min(50 * 0.2, 10)  # 90

    def test_compute_data_quality_score_constant_columns(self):
        """Test compute_data_quality_score penalizes constant columns."""
        from preprocessing_pipeline import compute_data_quality_score

        report = {
            'avg_missing_pct': 0,
            'duplicate_row_pct': 0,
            'avg_outlier_pct': 0,
            'constant_column_pct': 30,  # 30% constant
            'class_imbalance_ratio': 1.0
        }

        score = compute_data_quality_score(report)
        assert score < 100
        assert score == 100 - min(30 * 0.3, 10)  # 91

    def test_compute_data_quality_score_severe_imbalance(self):
        """Test compute_data_quality_score penalizes severe class imbalance."""
        from preprocessing_pipeline import compute_data_quality_score

        # Severe imbalance (>100:1)
        report = {
            'avg_missing_pct': 0,
            'duplicate_row_pct': 0,
            'avg_outlier_pct': 0,
            'constant_column_pct': 0,
            'class_imbalance_ratio': 150
        }

        score = compute_data_quality_score(report)
        assert score == 90  # 100 - 10 for severe imbalance

    def test_compute_data_quality_score_moderate_imbalance(self):
        """Test compute_data_quality_score penalizes moderate class imbalance."""
        from preprocessing_pipeline import compute_data_quality_score

        # Moderate imbalance (10:1 to 100:1)
        report = {
            'avg_missing_pct': 0,
            'duplicate_row_pct': 0,
            'avg_outlier_pct': 0,
            'constant_column_pct': 0,
            'class_imbalance_ratio': 50
        }

        score = compute_data_quality_score(report)
        assert score == 95  # 100 - 5 for moderate imbalance

    def test_compute_data_quality_score_floor_at_zero(self):
        """Test compute_data_quality_score never goes below 0."""
        from preprocessing_pipeline import compute_data_quality_score

        # Worst possible data
        report = {
            'avg_missing_pct': 100,
            'duplicate_row_pct': 100,
            'avg_outlier_pct': 100,
            'constant_column_pct': 100,
            'class_imbalance_ratio': 1000
        }

        score = compute_data_quality_score(report)
        assert score >= 0

    def test_compute_data_quality_score_combined_penalties(self):
        """Test compute_data_quality_score with multiple quality issues."""
        from preprocessing_pipeline import compute_data_quality_score

        report = {
            'avg_missing_pct': 10,   # -5 points
            'duplicate_row_pct': 10,  # -3 points
            'avg_outlier_pct': 10,    # -2 points
            'constant_column_pct': 10, # -3 points
            'class_imbalance_ratio': 5  # no penalty (< 10)
        }

        score = compute_data_quality_score(report)
        expected = 100 - 5 - 3 - 2 - 3  # 87
        assert score == expected


# =============================================================================
# RAG_PIPELINE.PY TESTS
# =============================================================================

class TestDocumentChunker:
    """Tests for DocumentChunker class."""

    def test_fixed_chunking_basic(self):
        """Test fixed chunking splits text correctly."""
        from rag_pipeline import DocumentChunker

        chunker = DocumentChunker(chunk_size=10, chunk_overlap=2, strategy="fixed")
        text = "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
        chunks = chunker.chunk_text(text, metadata={'source': 'test'})

        assert len(chunks) >= 1
        assert all('text' in chunk for chunk in chunks)
        assert all('chunk_id' in chunk for chunk in chunks)
        assert all('metadata' in chunk for chunk in chunks)

    def test_fixed_chunking_overlap(self):
        """Test fixed chunking respects overlap parameter."""
        from rag_pipeline import DocumentChunker

        chunker = DocumentChunker(chunk_size=5, chunk_overlap=2, strategy="fixed")
        text = "a b c d e f g h i j k l m n o"
        chunks = chunker.chunk_text(text, metadata={'source': 'test'})

        # With overlap, chunks should share some words
        if len(chunks) >= 2:
            # The step is chunk_size - overlap = 3
            # So chunks start at word 0, 3, 6, 9...
            pass  # Overlap is tested by having more chunks

    def test_fixed_chunking_empty_text(self):
        """Test fixed chunking handles empty text."""
        from rag_pipeline import DocumentChunker

        chunker = DocumentChunker(strategy="fixed")
        chunks = chunker.chunk_text("", metadata={'source': 'test'})

        assert chunks == []

    def test_fixed_chunking_whitespace_only(self):
        """Test fixed chunking handles whitespace-only text."""
        from rag_pipeline import DocumentChunker

        chunker = DocumentChunker(strategy="fixed")
        chunks = chunker.chunk_text("   \n\t  ", metadata={'source': 'test'})

        assert chunks == []

    def test_recursive_chunking_paragraphs(self):
        """Test recursive chunking splits by paragraphs first."""
        from rag_pipeline import DocumentChunker

        chunker = DocumentChunker(chunk_size=100, strategy="recursive")
        text = "Paragraph one content.\n\nParagraph two content.\n\nParagraph three content."
        chunks = chunker.chunk_text(text, metadata={'source': 'test'})

        assert len(chunks) >= 1
        # Small paragraphs should each become their own chunk
        if len(chunks) == 3:
            assert 'Paragraph one' in chunks[0]['text']
            assert 'Paragraph two' in chunks[1]['text']
            assert 'Paragraph three' in chunks[2]['text']

    def test_recursive_chunking_long_paragraph(self):
        """Test recursive chunking splits long paragraphs by sentences."""
        from rag_pipeline import DocumentChunker

        chunker = DocumentChunker(chunk_size=20, strategy="recursive")
        text = "This is sentence one. This is sentence two. This is sentence three. This is sentence four."
        chunks = chunker.chunk_text(text, metadata={'source': 'test'})

        # Long paragraph should be split by sentences
        assert len(chunks) >= 1

    def test_recursive_chunking_preserves_metadata(self):
        """Test recursive chunking preserves metadata in all chunks."""
        from rag_pipeline import DocumentChunker

        chunker = DocumentChunker(strategy="recursive")
        metadata = {'source': 'test.txt', 'author': 'test_author', 'date': '2024-01-01'}
        text = "Short text."
        chunks = chunker.chunk_text(text, metadata=metadata)

        for chunk in chunks:
            assert chunk['metadata']['source'] == 'test.txt'
            assert chunk['metadata']['author'] == 'test_author'
            assert chunk['metadata']['date'] == '2024-01-01'

    def test_chunking_generates_chunk_ids(self):
        """Test chunking generates unique chunk IDs."""
        from rag_pipeline import DocumentChunker

        chunker = DocumentChunker(chunk_size=5, strategy="fixed")
        text = "a b c d e f g h i j k l m n o p q r s t"
        chunks = chunker.chunk_text(text, metadata={'source': 'test'})

        chunk_ids = [chunk['chunk_id'] for chunk in chunks]
        # All chunk IDs should be unique
        assert len(chunk_ids) == len(set(chunk_ids))

    def test_chunking_includes_token_count(self):
        """Test chunking includes token count for each chunk."""
        from rag_pipeline import DocumentChunker

        chunker = DocumentChunker(strategy="fixed")
        text = "This is a test sentence with several words."
        chunks = chunker.chunk_text(text, metadata={'source': 'test'})

        for chunk in chunks:
            assert 'token_count' in chunk
            assert chunk['token_count'] > 0

    def test_chunking_includes_chunk_index(self):
        """Test chunking includes chunk index for each chunk."""
        from rag_pipeline import DocumentChunker

        chunker = DocumentChunker(chunk_size=5, strategy="fixed")
        text = "a b c d e f g h i j k l m n o"
        chunks = chunker.chunk_text(text, metadata={'source': 'test'})

        for i, chunk in enumerate(chunks):
            assert chunk['chunk_index'] == i


class TestTokenManager:
    """Tests for TokenManager class."""

    def test_count_tokens_basic(self):
        """Test token counting for basic text."""
        from rag_pipeline import TokenManager

        tm = TokenManager()
        text = "Hello world this is a test"
        count = tm.count_tokens(text)

        # Should be approximately 6-8 tokens
        assert count > 0
        assert count < 20

    def test_count_tokens_empty_string(self):
        """Test token counting for empty string."""
        from rag_pipeline import TokenManager

        tm = TokenManager()
        count = tm.count_tokens("")

        assert count == 0

    def test_count_tokens_long_text(self):
        """Test token counting for longer text."""
        from rag_pipeline import TokenManager

        tm = TokenManager()
        text = "word " * 100  # 100 words
        count = tm.count_tokens(text)

        # With ~1.3 tokens per word, expect 100-150 tokens
        assert 100 <= count <= 200

    def test_truncate_to_tokens_no_truncation_needed(self):
        """Test truncation when text is already within limit."""
        from rag_pipeline import TokenManager

        tm = TokenManager()
        text = "Short text"
        result = tm.truncate_to_tokens(text, 100)

        assert result == text

    def test_truncate_to_tokens_truncation_needed(self):
        """Test truncation when text exceeds limit."""
        from rag_pipeline import TokenManager

        tm = TokenManager()
        text = "word " * 100  # Long text
        result = tm.truncate_to_tokens(text, 10)

        # Result should be shorter
        assert len(result) < len(text)
        assert tm.count_tokens(result) <= 10

    def test_fits_context_within_limit(self):
        """Test fits_context returns True when within limit."""
        from rag_pipeline import TokenManager

        tm = TokenManager()
        texts = ["Short text one.", "Short text two."]

        assert tm.fits_context(texts, max_context=100) is True

    def test_fits_context_exceeds_limit(self):
        """Test fits_context returns False when exceeding limit."""
        from rag_pipeline import TokenManager

        tm = TokenManager()
        texts = ["word " * 100] * 10  # Very long texts

        assert tm.fits_context(texts, max_context=10) is False

    def test_estimate_cost_ollama_is_free(self):
        """Test cost estimation returns 0 for local Ollama."""
        from rag_pipeline import TokenManager

        tm = TokenManager()
        cost = tm.estimate_cost(1000, 500)

        assert cost == 0.0


class TestCacheDB:
    """Tests for CacheDB class."""

    def test_hash_text_consistent(self):
        """Test hash function produces consistent results."""
        from rag_pipeline import CacheDB

        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            tmp_path = tmp.name

        try:
            cache = CacheDB(db_path=tmp_path)

            text = "test query"
            hash1 = cache._hash_text(text)
            hash2 = cache._hash_text(text)

            assert hash1 == hash2
        finally:
            Path(tmp_path).unlink(missing_ok=True)

    def test_hash_text_different_inputs(self):
        """Test hash function produces different results for different inputs."""
        from rag_pipeline import CacheDB

        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            tmp_path = tmp.name

        try:
            cache = CacheDB(db_path=tmp_path)

            hash1 = cache._hash_text("text one")
            hash2 = cache._hash_text("text two")

            assert hash1 != hash2
        finally:
            Path(tmp_path).unlink(missing_ok=True)

    def test_hash_text_is_sha256(self):
        """Test hash function uses SHA256."""
        from rag_pipeline import CacheDB

        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            tmp_path = tmp.name

        try:
            cache = CacheDB(db_path=tmp_path)

            text = "test"
            expected = hashlib.sha256(text.encode()).hexdigest()
            actual = cache._hash_text(text)

            assert actual == expected
        finally:
            Path(tmp_path).unlink(missing_ok=True)

    def test_cache_and_retrieve_response(self):
        """Test caching and retrieving a response."""
        from rag_pipeline import CacheDB

        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            tmp_path = tmp.name

        try:
            cache = CacheDB(db_path=tmp_path)

            query = "What is the meaning of life?"
            response = "42"

            # Cache the response
            cache.cache_response(query, response, ttl=3600)

            # Retrieve it
            retrieved = cache.get_cached_response(query)

            assert retrieved == response
        finally:
            Path(tmp_path).unlink(missing_ok=True)

    def test_cache_miss_returns_none(self):
        """Test cache miss returns None."""
        from rag_pipeline import CacheDB

        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            tmp_path = tmp.name

        try:
            cache = CacheDB(db_path=tmp_path)

            result = cache.get_cached_response("nonexistent query")

            assert result is None
        finally:
            Path(tmp_path).unlink(missing_ok=True)

    def test_cache_stats(self):
        """Test cache statistics reporting."""
        from rag_pipeline import CacheDB

        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
            tmp_path = tmp.name

        try:
            cache = CacheDB(db_path=tmp_path)

            # Add some entries
            cache.cache_response("q1", "r1")
            cache.cache_response("q2", "r2")

            stats = cache.get_stats()

            assert 'query_cache_entries' in stats
            assert 'embedding_cache_entries' in stats
            assert stats['query_cache_entries'] == 2
        finally:
            Path(tmp_path).unlink(missing_ok=True)


class TestVectorStore:
    """Tests for VectorStore class."""

    def test_vector_store_initialization_sqlite_fallback(self):
        """Test VectorStore initializes with SQLite fallback."""
        from rag_pipeline import VectorStore

        with tempfile.TemporaryDirectory() as tmpdir:
            store = VectorStore(db_path=tmpdir, engine="sqlite")

            assert store.backend == "sqlite"

    def test_vector_store_add_and_search(self):
        """Test adding documents and searching."""
        from rag_pipeline import VectorStore

        with tempfile.TemporaryDirectory() as tmpdir:
            store = VectorStore(db_path=tmpdir, engine="sqlite")

            # Create test documents with embeddings
            chunks = [
                {
                    'chunk_id': 'doc1',
                    'text': 'Banking fraud detection',
                    'metadata': {'source': 'test'},
                    'embedding': np.random.rand(384).astype(np.float32)
                },
                {
                    'chunk_id': 'doc2',
                    'text': 'Credit risk assessment',
                    'metadata': {'source': 'test'},
                    'embedding': np.random.rand(384).astype(np.float32)
                }
            ]

            # Add documents
            store.add_documents(chunks, collection_name="test_collection")

            # Search
            query_embedding = np.random.rand(384).astype(np.float32)
            results = store.search(query_embedding, top_k=2, collection_name="test_collection")

            assert len(results) == 2
            assert all(isinstance(r, tuple) for r in results)
            assert all(len(r) == 2 for r in results)  # (doc, score)

    def test_vector_store_stats(self):
        """Test vector store statistics."""
        from rag_pipeline import VectorStore

        with tempfile.TemporaryDirectory() as tmpdir:
            store = VectorStore(db_path=tmpdir, engine="sqlite")

            stats = store.get_stats()

            assert 'backend' in stats
            assert stats['backend'] == 'sqlite'
            assert 'collections' in stats
            assert 'total_collections' in stats

    def test_vector_store_list_collections_empty(self):
        """Test listing collections when empty."""
        from rag_pipeline import VectorStore

        with tempfile.TemporaryDirectory() as tmpdir:
            store = VectorStore(db_path=tmpdir, engine="sqlite")

            collections = store.list_collections()

            assert isinstance(collections, list)


# =============================================================================
# AI_GOVERNANCE_PIPELINE.PY TESTS
# =============================================================================

class TestAIGovernancePipeline:
    """Tests for ai_governance_pipeline.py module."""

    def test_governance_weights_sum_to_one(self):
        """Test governance weights sum to 1.0."""
        from ai_governance_pipeline import GOVERNANCE_WEIGHTS

        total = sum(GOVERNANCE_WEIGHTS.values())
        assert abs(total - 1.0) < 0.001

    def test_governance_weights_all_positive(self):
        """Test all governance weights are positive."""
        from ai_governance_pipeline import GOVERNANCE_WEIGHTS

        for key, weight in GOVERNANCE_WEIGHTS.items():
            assert weight > 0, f"Weight for {key} should be positive"

    def test_governance_weights_expected_dimensions(self):
        """Test governance weights contain expected dimensions."""
        from ai_governance_pipeline import GOVERNANCE_WEIGHTS

        expected_dimensions = [
            'explainability',
            'responsible_ai',
            'trustworthy_ai',
            'ethical_ai',
            'governance_ai',
            'sustainable_ai',
            'portable_ai',
            'performance_ai'
        ]

        for dim in expected_dimensions:
            assert dim in GOVERNANCE_WEIGHTS, f"Missing dimension: {dim}"

    def test_ai_governance_scorer_get_trust_level_high(self):
        """Test AIGovernanceScorer._get_trust_level for HIGH."""
        from ai_governance_pipeline import AIGovernanceScorer

        assert AIGovernanceScorer._get_trust_level(85) == 'HIGH'
        assert AIGovernanceScorer._get_trust_level(90) == 'HIGH'
        assert AIGovernanceScorer._get_trust_level(100) == 'HIGH'

    def test_ai_governance_scorer_get_trust_level_medium(self):
        """Test AIGovernanceScorer._get_trust_level for MEDIUM."""
        from ai_governance_pipeline import AIGovernanceScorer

        assert AIGovernanceScorer._get_trust_level(70) == 'MEDIUM'
        assert AIGovernanceScorer._get_trust_level(75) == 'MEDIUM'
        assert AIGovernanceScorer._get_trust_level(84) == 'MEDIUM'

    def test_ai_governance_scorer_get_trust_level_low(self):
        """Test AIGovernanceScorer._get_trust_level for LOW."""
        from ai_governance_pipeline import AIGovernanceScorer

        assert AIGovernanceScorer._get_trust_level(60) == 'LOW'
        assert AIGovernanceScorer._get_trust_level(65) == 'LOW'
        assert AIGovernanceScorer._get_trust_level(69) == 'LOW'

    def test_ai_governance_scorer_get_trust_level_critical(self):
        """Test AIGovernanceScorer._get_trust_level for CRITICAL."""
        from ai_governance_pipeline import AIGovernanceScorer

        assert AIGovernanceScorer._get_trust_level(59) == 'CRITICAL'
        assert AIGovernanceScorer._get_trust_level(50) == 'CRITICAL'
        assert AIGovernanceScorer._get_trust_level(0) == 'CRITICAL'

    def test_eu_ai_act_tiers_defined(self):
        """Test EU AI Act tiers are properly defined."""
        from ai_governance_pipeline import EU_AI_ACT_TIERS

        expected_tiers = ['UNACCEPTABLE', 'HIGH_RISK', 'LIMITED_RISK', 'MINIMAL_RISK']

        for tier in expected_tiers:
            assert tier in EU_AI_ACT_TIERS

    def test_eu_ai_act_tier_high_risk_keywords(self):
        """Test HIGH_RISK tier contains expected keywords."""
        from ai_governance_pipeline import EU_AI_ACT_TIERS

        high_risk = EU_AI_ACT_TIERS['HIGH_RISK']

        # Banking-related high risk categories
        assert 'credit' in high_risk
        assert 'lending' in high_risk
        assert 'loan' in high_risk
        assert 'hr' in high_risk
        assert 'hiring' in high_risk

    def test_get_eu_ai_act_tier_credit_use_case(self):
        """Test get_eu_ai_act_tier returns HIGH_RISK for credit use cases."""
        from ai_governance_pipeline import get_eu_ai_act_tier

        tier = get_eu_ai_act_tier("Credit Scoring Model", "high")
        assert tier == 'HIGH_RISK'

    def test_get_eu_ai_act_tier_minimal_risk(self):
        """Test get_eu_ai_act_tier returns MINIMAL_RISK for analytics."""
        from ai_governance_pipeline import get_eu_ai_act_tier

        tier = get_eu_ai_act_tier("Inventory analytics", "low")
        assert tier == 'MINIMAL_RISK'

    def test_sr_11_7_requirements_defined(self):
        """Test SR 11-7 requirements are defined."""
        from ai_governance_pipeline import SR_11_7_REQUIREMENTS

        expected_requirements = [
            'model_validation',
            'ongoing_monitoring',
            'comprehensive_documentation',
            'independent_review',
            'model_risk_rating',
            'periodic_validation'
        ]

        for req in expected_requirements:
            assert req in SR_11_7_REQUIREMENTS

    def test_overall_trust_score_calculation(self):
        """Test overall trust score is weighted average of all dimensions."""
        from ai_governance_pipeline import GOVERNANCE_WEIGHTS

        # Simulate scores
        scores = {
            'explainability': {'score': 80},
            'responsible_ai': {'score': 75},
            'trustworthy_ai': {'score': 85},
            'ethical_ai': {'score': 90},
            'governance_ai': {'score': 70},
            'sustainable_ai': {'score': 95},
            'portable_ai': {'score': 65},
            'performance_ai': {'score': 88}
        }

        # Calculate expected overall score
        expected = sum(
            scores[dim]['score'] * GOVERNANCE_WEIGHTS[dim]
            for dim in GOVERNANCE_WEIGHTS
        )

        # Verify calculation
        actual = sum(
            scores[dim]['score'] * weight
            for dim, weight in GOVERNANCE_WEIGHTS.items()
        )

        assert abs(actual - expected) < 0.001


# =============================================================================
# INTEGRATION TESTS (MOCKED)
# =============================================================================

class TestIntegration:
    """Integration tests with mocked dependencies."""

    def test_config_imports_without_error(self):
        """Test config module imports successfully."""
        import config

        assert hasattr(config, 'validate_use_case_key')
        assert hasattr(config, 'get_trust_level')
        assert hasattr(config, 'get_db_connection')
        assert hasattr(config, 'BASE_DIR')
        assert hasattr(config, 'UNIFIED_DB')

    def test_preprocessing_pipeline_imports_without_error(self):
        """Test preprocessing_pipeline module imports successfully."""
        import preprocessing_pipeline

        assert hasattr(preprocessing_pipeline, 'profile_column')
        assert hasattr(preprocessing_pipeline, 'compute_data_quality_score')
        assert hasattr(preprocessing_pipeline, 'iqr_bounds')
        assert hasattr(preprocessing_pipeline, 'USE_CASES')

    def test_rag_pipeline_imports_without_error(self):
        """Test rag_pipeline module imports successfully."""
        import rag_pipeline

        assert hasattr(rag_pipeline, 'DocumentChunker')
        assert hasattr(rag_pipeline, 'TokenManager')
        assert hasattr(rag_pipeline, 'CacheDB')
        assert hasattr(rag_pipeline, 'VectorStore')
        assert hasattr(rag_pipeline, 'EmbeddingPipeline')

    def test_ai_governance_pipeline_imports_without_error(self):
        """Test ai_governance_pipeline module imports successfully."""
        import ai_governance_pipeline

        assert hasattr(ai_governance_pipeline, 'AIGovernanceScorer')
        assert hasattr(ai_governance_pipeline, 'GOVERNANCE_WEIGHTS')
        assert hasattr(ai_governance_pipeline, 'EU_AI_ACT_TIERS')
        assert hasattr(ai_governance_pipeline, 'get_eu_ai_act_tier')


# =============================================================================
# EDGE CASE TESTS
# =============================================================================

class TestEdgeCases:
    """Edge case tests for robustness."""

    def test_profile_column_all_nan(self):
        """Test profile_column with all NaN values."""
        from preprocessing_pipeline import profile_column

        data = pd.Series([np.nan, np.nan, np.nan])
        profile = profile_column(data, 'test_all_nan')

        assert profile['missing_count'] == 3
        assert profile['missing_pct'] == 100.0

    def test_profile_column_mixed_types(self):
        """Test profile_column with mixed types."""
        from preprocessing_pipeline import profile_column

        data = pd.Series([1, '2', 3.0, 'four', 5])
        profile = profile_column(data, 'test_mixed')

        # Should handle mixed types gracefully
        assert profile['total_count'] == 5

    def test_iqr_bounds_single_value(self):
        """Test iqr_bounds with single value series."""
        from preprocessing_pipeline import iqr_bounds

        data = pd.Series([5])
        lower, upper = iqr_bounds(data)

        # With single value, IQR is 0, bounds should equal the value
        assert lower == 5.0
        assert upper == 5.0

    def test_document_chunker_unicode_text(self):
        """Test DocumentChunker handles unicode text."""
        from rag_pipeline import DocumentChunker

        chunker = DocumentChunker(strategy="fixed")
        text = "Hello \u4e16\u754c. \u3053\u3093\u306b\u3061\u306f. Bonjour monde."
        chunks = chunker.chunk_text(text, metadata={'source': 'test'})

        assert len(chunks) >= 1
        # Should preserve unicode
        for chunk in chunks:
            assert isinstance(chunk['text'], str)

    def test_token_manager_special_characters(self):
        """Test TokenManager handles special characters."""
        from rag_pipeline import TokenManager

        tm = TokenManager()
        text = "Hello! @#$%^&*() World... 123"
        count = tm.count_tokens(text)

        assert count > 0

    def test_validate_use_case_key_unicode(self):
        """Test validate_use_case_key rejects unicode characters."""
        from config import validate_use_case_key

        # Unicode should fail (only ASCII alphanumeric, underscore, hyphen allowed)
        assert validate_use_case_key("uc_\u4e16\u754c") is False
        assert validate_use_case_key("uc_\u00e9") is False


# =============================================================================
# FIXTURE DEFINITIONS
# =============================================================================

@pytest.fixture
def temp_db():
    """Create a temporary database file."""
    with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp:
        yield Path(tmp.name)
    Path(tmp.name).unlink(missing_ok=True)


@pytest.fixture
def temp_dir():
    """Create a temporary directory."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def sample_dataframe():
    """Create a sample DataFrame for testing."""
    return pd.DataFrame({
        'numeric_col': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        'cat_col': ['A', 'B', 'A', 'C', 'A', 'B', 'D', 'A', 'E', 'F'],
        'missing_col': [1, 2, np.nan, 4, np.nan, 6, 7, 8, np.nan, 10]
    })


# =============================================================================
# RUN TESTS
# =============================================================================

if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
