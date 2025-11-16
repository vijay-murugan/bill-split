from typing import Optional


class NotFoundError(Exception):
    def __init__(self, message: Optional[str] = None):
        super().__init__(message or "Resource not found")


class DomainError(Exception):
    def __init__(self, message: Optional[str] = None):
        super().__init__(message or "Domain error")
