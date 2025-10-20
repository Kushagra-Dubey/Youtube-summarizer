from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import SummarizationJob, VideoChunk, SummaryQuestion, JobStatus
from app.schemas import SummarizeRequest, JobResponse, JobDetailResponse, AskQuestionRequest, QuestionResponse
from app.auth_service import verify_token
from app.utils import extract_video_id
from app.async_processor import process_summarization_job
from app.services import find_relevant_chunks, answer_question
import asyncio
import uuid

router = APIRouter(prefix="/api")

@router.post("/summarize")
async def create_summarization_job(
    request: SummarizeRequest,
    authorization: str = Header(None, alias="Authorization"),
    db: Session = Depends(get_db)
):
    """Create async summarization job"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    try:
        scheme, token = authorization.split()
        user_id = verify_token(token)
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    try:
        video_id = extract_video_id(request.videoUrl)
        if not video_id:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")
        
        # Check if job already exists for this video by user
        existing_job = db.query(SummarizationJob).filter(
            SummarizationJob.user_id == user_id,
            SummarizationJob.video_id == video_id,
            SummarizationJob.status != JobStatus.FAILED
        ).first()
        
        if existing_job:
            return JobResponse(
                job_id=existing_job.id,
                status=existing_job.status.value,
                video_id=existing_job.video_id,
                created_at=existing_job.created_at.isoformat(),
                completed_at=job.completed_at.isoformat(),
                summary=existing_job.summary,
                error_message=job.error_message,
            )
        
        # Create new job
        job = SummarizationJob(
            user_id=user_id,
            video_id=video_id,
            video_url=request.videoUrl,
            model=request.model,
            status=JobStatus.PENDING
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        
        # Trigger async processing
        asyncio.create_task(process_summarization_job(job.id))
        
        return JobResponse(
            job_id=job.id,
            status=job.status.value,
            video_id=job.video_id,
            created_at=job.created_at.isoformat(),
            completed_at=job.completed_at.isoformat(),
            error_message=job.error_message,
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/job/{job_id}")
async def get_job_status(
    job_id: str,
    authorization: str = Header(None, alias="Authorization"),
    db: Session = Depends(get_db)
):
    """Get job status and summary"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    try:
        scheme, token = authorization.split()
        user_id = verify_token(token)
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    job = db.query(SummarizationJob).filter(
        SummarizationJob.id == job_id,
        SummarizationJob.user_id == user_id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobDetailResponse(
        job_id=job.id,
        status=job.status.value,
        video_id=job.video_id,
        title=job.title,
        summary=job.summary,
        transcript=job.transcript[:500] if job.transcript else None,
        model=job.model,
        created_at=job.created_at.isoformat(),
        completed_at=job.completed_at.isoformat() if job.completed_at else None,
        error_message=job.error_message
    )

@router.get("/jobs")
async def get_user_jobs(
    authorization: str = Header(None, alias="Authorization"),
    db: Session = Depends(get_db),
    limit: int = 20
):
    """Get all jobs for user"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    try:
        scheme, token = authorization.split()
        user_id = verify_token(token)
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    jobs = db.query(SummarizationJob).filter(
        SummarizationJob.user_id == user_id
    ).order_by(SummarizationJob.created_at.desc()).limit(limit).all()
    
    return [
        JobResponse(
            job_id=job.id,
            model=job.model,
            status=job.status.value,
            video_id=job.video_id,
            created_at=job.created_at.isoformat(),
            completed_at=job.completed_at.isoformat(),
            summary=job.summary,
            error_message=job.error_message
        )
        for job in jobs
    ]

@router.post("/job/{job_id}/ask")
async def ask_question(
    job_id: str,
    request: AskQuestionRequest,
    authorization: str = Header(None, alias="Authorization"),
    db: Session = Depends(get_db)
):
    """Ask question about video content using RAG"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    try:
        scheme, token = authorization.split()
        user_id = verify_token(token)
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    job = db.query(SummarizationJob).filter(
        SummarizationJob.id == job_id,
        SummarizationJob.user_id == user_id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != JobStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Job not completed yet")
    
    try:
        # Get all chunks with embeddings
        chunks = db.query(VideoChunk).filter(
            VideoChunk.job_id == job_id
        ).order_by(VideoChunk.chunk_index).all()
        
        chunks_data = [
            {"content": c.content, "embedding": c.embedding}
            for c in chunks
        ]
        
        # Find relevant chunks
        relevant_text = find_relevant_chunks(request.question, chunks_data)
        
        # Generate answer
        answer = answer_question(request.question, relevant_text, job.model)
        
        # Store question
        question_record = SummaryQuestion(
            job_id=job_id,
            user_id=user_id,
            question=request.question,
            answer=answer,
            status="answered",
            answered_at=datetime.utcnow()
        )
        db.add(question_record)
        db.commit()
        db.refresh(question_record)
        
        return QuestionResponse(
            question_id=question_record.id,
            question=question_record.question,
            answer=question_record.answer,
            status=question_record.status
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/job/{job_id}/questions")
async def get_job_questions(
    job_id: str,
    authorization: str = Header(None, alias="Authorization"),
    db: Session = Depends(get_db)
):
    """Get all questions and answers for a job"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    try:
        scheme, token = authorization.split()
        user_id = verify_token(token)
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    job = db.query(SummarizationJob).filter(
        SummarizationJob.id == job_id,
        SummarizationJob.user_id == user_id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    questions = db.query(SummaryQuestion).filter(
        SummaryQuestion.job_id == job_id
    ).order_by(SummaryQuestion.created_at.desc()).all()
    
    return [
        QuestionResponse(
            question_id=q.id,
            question=q.question,
            answer=q.answer,
            status=q.status
        )
        for q in questions
    ]