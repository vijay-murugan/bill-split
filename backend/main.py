from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import billing, user_routes
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["root"])
async def root():
    return {"message": "API root. Use /api/v1/ for endpoints."}


app.include_router(user_routes.router, prefix="/api")
app.include_router(billing.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
