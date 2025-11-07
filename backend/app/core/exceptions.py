import logging

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from pymongo.errors import PyMongoError

logger = logging.getLogger(__name__)


async def pymongo_exception_handler(request: Request, exc: PyMongoError):
    logger.exception("Database error at %s", request.url)
    return JSONResponse(status_code=500, content={"detail": "Database error"})


async def general_exception_handler(request: Request, exc: Exception):
    logger.exception("General error at %s", request.url)
    return JSONResponse(status_code=500, content={"detail": str(exc)})
