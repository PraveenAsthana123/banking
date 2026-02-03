"""Fernet-based encryption for sensitive configuration values (passwords, API keys).

Usage:
    from backend.core.encryption import get_cipher
    cipher = get_cipher()
    encrypted = cipher.encrypt("my_secret")
    decrypted = cipher.decrypt(encrypted)

The encryption key is read from BANKING_ENCRYPTION_KEY env var.
If not set, a key file is auto-generated at <base_dir>/.encryption.key.
"""

import base64
import logging
import os
from pathlib import Path

from cryptography.fernet import Fernet, InvalidToken

logger = logging.getLogger(__name__)

_SENTINEL = b"__ENCRYPTED__:"


class Cipher:
    """Encrypt/decrypt strings using Fernet symmetric encryption."""

    def __init__(self, key: bytes) -> None:
        self._fernet = Fernet(key)

    def encrypt(self, plaintext: str) -> str:
        """Return a base64-encoded ciphertext string prefixed with sentinel."""
        if not plaintext:
            return plaintext
        token = self._fernet.encrypt(plaintext.encode("utf-8"))
        return (_SENTINEL + token).decode("ascii")

    def decrypt(self, ciphertext: str) -> str:
        """Decrypt a sentinel-prefixed ciphertext. Returns as-is if not encrypted."""
        if not ciphertext or not ciphertext.startswith(_SENTINEL.decode("ascii")):
            return ciphertext  # not encrypted — return plaintext
        raw = ciphertext[len(_SENTINEL):].encode("ascii")
        try:
            return self._fernet.decrypt(raw).decode("utf-8")
        except InvalidToken:
            logger.warning("Failed to decrypt value — returning masked placeholder")
            return "***DECRYPTION_FAILED***"

    def is_encrypted(self, value: str) -> bool:
        return value.startswith(_SENTINEL.decode("ascii")) if value else False


def _load_or_generate_key() -> bytes:
    """Load encryption key from env or file. Generate if neither exists."""
    env_key = os.environ.get("BANKING_ENCRYPTION_KEY")
    if env_key:
        return env_key.encode("ascii")

    from backend.core.config import get_settings
    key_path = get_settings().base_dir / ".encryption.key"

    if key_path.exists():
        return key_path.read_bytes().strip()

    # Auto-generate
    key = Fernet.generate_key()
    key_path.write_bytes(key + b"\n")
    key_path.chmod(0o600)
    logger.info("Generated new encryption key at %s", key_path)
    return key


_cipher: Cipher | None = None


def get_cipher() -> Cipher:
    """Singleton cipher instance."""
    global _cipher
    if _cipher is None:
        _cipher = Cipher(_load_or_generate_key())
    return _cipher
