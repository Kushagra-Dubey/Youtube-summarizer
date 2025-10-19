from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class SummarizeRequest(BaseModel):
    videoUrl: str
    videoId: Optional[str] = None
    model: str = "claude-3-5-sonnet-20241022"

class JobResponse(BaseModel):
    job_id: str
    status: str
    video_id: str
    created_at: str
    summary: Optional[str] = None
    error_message: Optional[str] = None

class JobDetailResponse(BaseModel):
    job_id: str
    status: str
    video_id: str
    title: Optional[str]
    summary: Optional[str]
    transcript: Optional[str]
    model: str
    created_at: str
    completed_at: Optional[str]
    error_message: Optional[str]

class AskQuestionRequest(BaseModel):
    question: str

class QuestionResponse(BaseModel):
    question_id: str
    question: str
    answer: Optional[str]
    status: str