"""Tests for backend.core.encryption — Cipher encrypt/decrypt round-trip."""

import pytest
from cryptography.fernet import Fernet

from backend.core.encryption import Cipher


@pytest.fixture()
def cipher():
    """Create a Cipher with a fresh test key."""
    key = Fernet.generate_key()
    return Cipher(key)


@pytest.fixture()
def cipher2():
    """A second Cipher with a *different* key (for cross-key tests)."""
    key = Fernet.generate_key()
    return Cipher(key)


class TestEncryptDecryptRoundTrip:

    def test_basic_roundtrip(self, cipher):
        plaintext = "super_secret_password"
        encrypted = cipher.encrypt(plaintext)
        assert encrypted != plaintext
        assert cipher.decrypt(encrypted) == plaintext

    def test_roundtrip_unicode(self, cipher):
        plaintext = "Geheimnis mit Umlauten: aou"
        encrypted = cipher.encrypt(plaintext)
        assert cipher.decrypt(encrypted) == plaintext

    def test_roundtrip_long_string(self, cipher):
        plaintext = "x" * 10_000
        encrypted = cipher.encrypt(plaintext)
        assert cipher.decrypt(encrypted) == plaintext

    def test_roundtrip_special_chars(self, cipher):
        plaintext = "p@$$w0rd!#%^&*(){}[]|\\:;<>,./?"
        encrypted = cipher.encrypt(plaintext)
        assert cipher.decrypt(encrypted) == plaintext

    def test_different_plaintexts_produce_different_ciphertexts(self, cipher):
        e1 = cipher.encrypt("alpha")
        e2 = cipher.encrypt("beta")
        assert e1 != e2


class TestIsEncrypted:

    def test_encrypted_value_detected(self, cipher):
        encrypted = cipher.encrypt("secret")
        assert cipher.is_encrypted(encrypted) is True

    def test_plaintext_not_detected(self, cipher):
        assert cipher.is_encrypted("just plain text") is False

    def test_empty_string_not_encrypted(self, cipher):
        assert cipher.is_encrypted("") is False

    def test_sentinel_prefix_alone(self, cipher):
        """The sentinel prefix without valid Fernet data should still report as encrypted."""
        assert cipher.is_encrypted("__ENCRYPTED__:not-real-data") is True


class TestEmptyValues:

    def test_encrypt_empty_string(self, cipher):
        result = cipher.encrypt("")
        assert result == ""

    def test_decrypt_empty_string(self, cipher):
        result = cipher.decrypt("")
        assert result == ""

    def test_encrypt_none_passthrough(self, cipher):
        """encrypt(None) should not crash — it returns the falsy value as-is."""
        result = cipher.encrypt(None)
        assert result is None

    def test_decrypt_none_passthrough(self, cipher):
        result = cipher.decrypt(None)
        assert result is None


class TestDecryptWithWrongKey:

    def test_wrong_key_returns_placeholder(self, cipher, cipher2):
        encrypted = cipher.encrypt("real_secret")
        # Decrypting with a different key should fail gracefully
        result = cipher2.decrypt(encrypted)
        assert result == "***DECRYPTION_FAILED***"

    def test_decrypt_plaintext_passthrough(self, cipher):
        """If the value is not encrypted (no sentinel), it is returned as-is."""
        result = cipher.decrypt("this is not encrypted")
        assert result == "this is not encrypted"
