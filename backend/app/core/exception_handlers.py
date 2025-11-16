import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError

logger = logging.getLogger(__name__)


async def pymongo_exception_handler(request: Request, exc: PyMongoError):
    logger.exception("Database error at %s", request.url)
    return JSONResponse(status_code=500, content={"detail": "Database error"})


async def general_exception_handler(request: Request, exc: Exception):
    logger.exception("General error at %s", request.url)
    return JSONResponse(status_code=500, content={"detail": str(exc)})


def register_exception_handlers(app: FastAPI):
    app.add_exception_handler(PyMongoError, pymongo_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
