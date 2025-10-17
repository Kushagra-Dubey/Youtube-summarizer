from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Import config and routes
from app.config import ALLOWED_ORIGINS
from app.routes import router as api_router

# Create the FastAPI app instance
app = FastAPI(
    title="YouTube Summarizer API",
    description="An API to summarize YouTube videos using Claude models.",
    version="1.0.0"
)

# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Exception Handlers ---
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    print(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "status_code": 500},
    )

# --- Routes ---

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "YouTube Summarizer API is running"}

# Include the API router
app.include_router(api_router)