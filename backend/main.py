from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import billing, friends, user_routes
from app.core.exception_handlers import register_exception_handlers

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5173/",
        "http://127.0.0.1:5173/",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(user_routes.router, prefix="/api")
app.include_router(billing.router, prefix="/api")
app.include_router(friends.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
