from pydantic import BaseModel

class SummarizeRequest(BaseModel):
    videoUrl: str | None = None  # Make URL optional for /summarize endpoint
    videoId: str | None = None  # Make ID optional for /summarize-from-url
    model: str = "claude-3-5-sonnet-20241022"

class SummarizeResponse(BaseModel):
    summary: str
    videoId: str
    model: str
    timestamp: str

class ErrorResponse(BaseModel):
    error: str
    status_code: int