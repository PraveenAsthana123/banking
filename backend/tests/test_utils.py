"""Tests for backend.core.utils — validate_use_case_key, sanitize_table_name, human_size."""

import pytest

from backend.core.utils import validate_use_case_key, sanitize_table_name, human_size


class TestValidateUseCaseKey:

    @pytest.mark.parametrize("key", [
        "UC-FR-01",
        "uc_fraud_detection",
        "CreditRisk",
        "a",
        "X-123",
        "aml_kyc_v2",
    ])
    def test_valid_keys(self, key):
        assert validate_use_case_key(key) is True

    @pytest.mark.parametrize("key", [
        "",                       # empty
        "DROP TABLE users;--",   # SQL injection attempt
        "uc key with spaces",    # spaces
        "../../../etc/passwd",   # path traversal
        "uc\ttab",               # tab
        "uc\nnewline",           # newline
    ])
    def test_invalid_keys(self, key):
        assert validate_use_case_key(key) is False

    def test_leading_digits_allowed(self):
        """The utils regex allows keys starting with digits (unlike config.py's stricter regex)."""
        assert validate_use_case_key("123_valid") is True

    def test_max_length_120_chars(self):
        key = "a" * 120
        assert validate_use_case_key(key) is True

    def test_over_max_length_rejected(self):
        key = "a" * 121
        assert validate_use_case_key(key) is False

    def test_hyphens_allowed(self):
        assert validate_use_case_key("UC-FR-01") is True

    def test_underscores_allowed(self):
        assert validate_use_case_key("uc_fraud_01") is True

    def test_digits_in_key(self):
        assert validate_use_case_key("1234") is True  # starts with digit, but regex allows it


class TestSanitizeTableName:

    def test_clean_name_unchanged(self):
        assert sanitize_table_name("users") == "users"

    def test_underscores_preserved(self):
        assert sanitize_table_name("job_status") == "job_status"

    def test_digits_preserved(self):
        assert sanitize_table_name("table123") == "table123"

    def test_special_chars_stripped(self):
        result = sanitize_table_name("my-table!")
        assert result == "mytable"  # hyphens and ! removed

    def test_spaces_stripped(self):
        result = sanitize_table_name("my table")
        assert result == "mytable"

    def test_sql_injection_sanitized(self):
        result = sanitize_table_name("users; DROP TABLE--")
        assert ";" not in result
        assert "-" not in result
        assert " " not in result

    def test_empty_string(self):
        assert sanitize_table_name("") == ""

    def test_only_special_chars(self):
        assert sanitize_table_name("!@#$%") == ""


class TestHumanSize:

    def test_zero_bytes(self):
        assert human_size(0) == "0.0 B"

    def test_bytes(self):
        assert human_size(500) == "500.0 B"

    def test_kilobytes(self):
        result = human_size(1024)
        assert result == "1.0 KB"

    def test_megabytes(self):
        result = human_size(1024 * 1024)
        assert result == "1.0 MB"

    def test_gigabytes(self):
        result = human_size(1024 ** 3)
        assert result == "1.0 GB"

    def test_terabytes(self):
        result = human_size(1024 ** 4)
        assert result == "1.0 TB"

    def test_petabytes(self):
        result = human_size(1024 ** 5)
        assert result == "1.0 PB"

    def test_fractional_megabytes(self):
        result = human_size(int(1.5 * 1024 * 1024))
        assert "MB" in result
        assert result.startswith("1.5")

    def test_large_number(self):
        result = human_size(5 * 1024 ** 3)
        assert result == "5.0 GB"

    def test_one_byte(self):
        assert human_size(1) == "1.0 B"

    def test_1023_bytes(self):
        assert human_size(1023) == "1023.0 B"
