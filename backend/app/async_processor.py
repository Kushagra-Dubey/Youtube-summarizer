import asyncio
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import SummarizationJob, VideoChunk, JobStatus
from app.services import get_transcript, chunk_transcript, create_embeddings, generate_summary
from app.config import DATABASE_URL
import logging

logger = logging.getLogger(__name__)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

async def process_summarization_job(job_id: str):
    """Process a summarization job asynchronously"""
    db = SessionLocal()
    job = db.query(SummarizationJob).filter(SummarizationJob.id == job_id).first()
    
    if not job:
        logger.error(f"Job {job_id} not found")
        return
    
    try:
        job.status = JobStatus.PROCESSING
        job.started_at = datetime.utcnow()
        db.commit()
        
        logger.info(f"Processing job {job_id} for video {job.video_id}")
        
        # Step 1: Get transcript
        transcript = get_transcript(job.video_id)
        job.transcript = transcript
        db.commit()
        
        # Step 2: Chunk transcript
        chunks = chunk_transcript(transcript)
        logger.info(f"Created {len(chunks)} chunks for job {job_id}")
        
        # Step 3: Create embeddings and store chunks
        for idx, chunk in enumerate(chunks):
            embedding = create_embeddings(chunk)
            video_chunk = VideoChunk(
                job_id=job_id,
                chunk_index=idx,
                content=chunk,
                embedding=embedding,
                tokens_count=len(chunk.split())
            )
            db.add(video_chunk)
        
        db.commit()
        logger.info(f"Stored {len(chunks)} chunks with embeddings for job {job_id}")
        
        # Step 4: Generate summary
        summary = generate_summary(transcript, job.model)
        job.summary = summary
        
        # Step 5: Mark as completed
        job.status = JobStatus.COMPLETED
        job.completed_at = datetime.utcnow()
        db.commit()
        
        logger.info(f"Job {job_id} completed successfully")
        
    except Exception as e:
        logger.error(f"Error processing job {job_id}: {str(e)}")
        job.status = JobStatus.FAILED
        job.error_message = str(e)
        job.completed_at = datetime.utcnow()
        db.commit()
    finally:
        db.close()