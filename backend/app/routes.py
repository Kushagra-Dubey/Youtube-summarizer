from fastapi import APIRouter, HTTPException
from datetime import datetime

from app.schemas import SummarizeRequest, SummarizeResponse
from app.services import get_transcript, generate_summary
from app.utils import extract_video_id
from app.config import AVAILABLE_MODELS

router = APIRouter(prefix="/api")

@router.get("/models")
async def get_models_route():
    """Get available models"""
    return {"models": AVAILABLE_MODELS}

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_video_route(request: SummarizeRequest):
    """Summarize a YouTube video using its ID"""
    if not request.videoId:
        raise HTTPException(status_code=400, detail="video_id is required")
    
    print(f"Fetching transcript for video: {request.videoId}")
    transcript = get_transcript(request.videoId)
    
    if not transcript or len(transcript) < 10:
        raise HTTPException(
            status_code=400,
            detail="Could not fetch valid transcript. Video may not have captions."
        )
    
    print(f"Transcript fetched. Length: {len(transcript)} characters")
    summary, used_model = generate_summary(transcript, request.model)
    
    return SummarizeResponse(
        summary=summary,
        videoId=request.videoId,
        model=used_model,
        timestamp=datetime.now().isoformat()
    )

@router.post("/summarize-from-url", response_model=SummarizeResponse)
async def summarize_from_url_route(request: SummarizeRequest):
    """Summarize a YouTube video from its URL"""
    try:
        video_id = extract_video_id(request.videoUrl)
        
        print(f"Fetching transcript for video: {video_id}")
        transcript = get_transcript(video_id)
        
        if not transcript or len(transcript) < 10:
            raise HTTPException(
                status_code=400,
                detail="Could not fetch valid transcript"
            )
        
        print(f"Transcript fetched. Length: {len(transcript)} characters")
        summary, used_model = generate_summary(transcript, request.model)
        
        return SummarizeResponse(
            summary=summary,
            videoId=video_id,
            model=used_model,
            timestamp=datetime.now().isoformat()
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))