from fastapi import HTTPException
from youtube_transcript_api import (
    YouTubeTranscriptApi, 
    TranscriptsDisabled, 
    NoTranscriptFound, 
    VideoUnavailable
)
from langchain_anthropic import ChatAnthropic
from langchain_core.output_parsers import StrOutputParser

# Import config variables
from app.config import (
    ANTHROPIC_API_KEY, 
    AVAILABLE_MODELS, 
    SUMMARY_PROMPT, 
    DEFAULT_MODEL
)

def get_transcript(video_id: str) -> str:
    """Fetch transcript from YouTube video"""
    try:
        yt = YouTubeTranscriptApi()
        transcript_list = yt.fetch(video_id=video_id)

        if not transcript_list:
            raise NoTranscriptFound(f"No transcript data for video: {video_id}")
        
        transcript_text = " ".join([snippet.text for snippet in transcript_list])
        return transcript_text.strip()
    
    except (NoTranscriptFound, TranscriptsDisabled, VideoUnavailable) as e:
        print(f"Transcript error: {e}")
        raise HTTPException(
            status_code=404, 
            detail=f"Could not fetch transcript: {str(e)}"
        )
    except Exception as e:
        print(f"Unexpected transcript error: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Could not fetch transcript: {str(e)}"
        )

def _validate_model(model: str) -> str:
    """Validate and return model name"""
    if model not in AVAILABLE_MODELS:
        print(f"Invalid model {model}, defaulting to {DEFAULT_MODEL}")
        return DEFAULT_MODEL
    return model

def _create_summarizer(model: str):
    """Create LangChain summarizer with specified model"""
    validated_model = _validate_model(model)
    
    chat_model = ChatAnthropic(
        model=validated_model,
        temperature=0.7,
        max_tokens=1024,
        api_key=ANTHROPIC_API_KEY
    )
    
    chain = SUMMARY_PROMPT | chat_model | StrOutputParser()
    return chain, validated_model

def generate_summary(transcript: str, model: str) -> tuple[str, str]:
    """Generate summary using LangChain + Claude"""
    if not ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="ANTHROPIC_API_KEY is not set in environment variables."
        )
        
    try:
        print(f"Creating summarizer for model: {model}")
        chain, validated_model = _create_summarizer(model)
        
        print("Generating summary with LangChain...")
        summary = chain.invoke({"transcript": transcript})
        
        print("Summary generated successfully")
        return summary, validated_model
    
    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating summary: {str(e)}"
        )