from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from youtube_transcript_api import YouTubeTranscriptApi
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import os
from datetime import datetime
from dotenv import load_dotenv
import re

load_dotenv()

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class SummarizeRequest(BaseModel):
    videoUrl: str
    videoId: str
    model: str = "claude-3-5-sonnet-20241022"

class SummarizeResponse(BaseModel):
    summary: str
    videoId: str
    model: str
    timestamp: str

# Available models configuration
AVAILABLE_MODELS = {
    "claude-3-5-sonnet-20241022": {
        "name": "Claude 3.5 Sonnet",
        "display_name": "Claude 3.5 Sonnet (Fast & Smart)",
        "speed": "Fast",
        "cost": "$"
    },
    "claude-opus-4-1": {
        "name": "Claude Opus 4.1",
        "display_name": "Claude Opus 4.1 (Most Powerful)",
        "speed": "Slower",
        "cost": "$$$"
    },
    "claude-3-5-haiku-20241022": {
        "name": "Claude 3.5 Haiku",
        "display_name": "Claude 3.5 Haiku (Budget)",
        "speed": "Fastest",
        "cost": "$"
    }
}

# LangChain prompt template
SUMMARY_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are an expert video summarizer. Provide clear, concise summaries with key points."),
    ("human", """Please provide a comprehensive summary of the following video transcript.

The summary should:
- Be concise but cover all main points
- Use bullet points for key takeaways
- Be easy to understand
- Include any important statistics or facts mentioned

Transcript:
{transcript}

Summary:""")
])

# Helper function to extract video ID
def extract_video_id(url: str) -> str:
    """Extract video ID from YouTube URL"""
    patterns = [
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)',
        r'(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)',
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    raise ValueError("Invalid YouTube URL")

# Helper function to get transcript
def get_transcript(video_id: str) -> str:
    """Fetch transcript from YouTube video"""
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript_text = " ".join([item["text"] for item in transcript_list])
        return transcript_text
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not fetch transcript: {str(e)}"
        )

# Helper function to validate and get model
def validate_model(model: str) -> str:
    """Validate and return model name"""
    if model not in AVAILABLE_MODELS:
        print(f"Invalid model {model}, defaulting to Sonnet")
        return "claude-3-5-sonnet-20241022"
    return model

# Helper function to create LangChain summarizer
def create_summarizer(model: str):
    """Create LangChain summarizer with specified model"""
    model = validate_model(model)
    
    # Initialize ChatAnthropic with LangChain
    chat_model = ChatAnthropic(
        model=model,
        temperature=0.7,
        max_tokens=1024,
        api_key=os.getenv("ANTHROPIC_API_KEY")
    )
    
    # Create chain: prompt -> model -> output parser
    chain = SUMMARY_PROMPT | chat_model | StrOutputParser()
    
    return chain, model

# Helper function to generate summary
def generate_summary(transcript: str, model: str = "claude-3-5-sonnet-20241022") -> tuple:
    """Generate summary using LangChain + Claude"""
    try:
        print(f"Creating summarizer for model: {model}")
        chain, validated_model = create_summarizer(model)
        
        print("Generating summary with LangChain...")
        # Invoke the chain with transcript
        summary = chain.invoke({"transcript": transcript})
        
        print("Summary generated successfully")
        return summary, validated_model
    
    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating summary: {str(e)}"
        )

# Routes

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "YouTube Summarizer API is running"}

@app.get("/api/models")
async def get_models():
    """Get available models"""
    return {"models": AVAILABLE_MODELS}

@app.post("/api/summarize", response_model=SummarizeResponse)
async def summarize_video(request: SummarizeRequest):
    """
    Summarize a YouTube video
    
    Args:
        request: SummarizeRequest with videoUrl, videoId, and model
    
    Returns:
        SummarizeResponse with summary text
    """
    try:
        # Validate video ID
        if not request.videoId:
            raise HTTPException(status_code=400, detail="Invalid video ID")
        
        # Get transcript
        print(f"Fetching transcript for video: {request.videoId}")
        transcript = get_transcript(request.videoId)
        
        if not transcript or len(transcript) < 10:
            raise HTTPException(
                status_code=400,
                detail="Could not fetch valid transcript. Video may not have captions."
            )
        
        print(f"Transcript fetched. Length: {len(transcript)} characters")
        
        # Generate summary with LangChain
        summary, used_model = generate_summary(transcript, request.model)
        
        return SummarizeResponse(
            summary=summary,
            videoId=request.videoId,
            model=used_model,
            timestamp=datetime.now().isoformat()
        )
    
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/summarize-from-url", response_model=SummarizeResponse)
async def summarize_from_url(request: SummarizeRequest):
    """
    Summarize a YouTube video from URL
    Extracts video ID from URL automatically
    """
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
        
        # Generate summary with LangChain
        summary, used_model = generate_summary(transcript, request.model)
        
        return SummarizeResponse(
            summary=summary,
            videoId=video_id,
            model=used_model,
            timestamp=datetime.now().isoformat()
        )
    
    except HTTPException as e:
        raise e
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Error handling
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {
        "error": exc.detail,
        "status_code": exc.status_code
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)