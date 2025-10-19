import json
from typing import List, Tuple
from youtube_transcript_api import YouTubeTranscriptApi
from langchain_anthropic import ChatAnthropic
from langchain_core.output_parsers import StrOutputParser
from langchain_community.embeddings import HuggingFaceEmbeddings
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.config import ANTHROPIC_API_KEY, AVAILABLE_MODELS, SUMMARY_PROMPT
from app.models import SummarizationJob, VideoChunk, JobStatus


def get_transcript(video_id: str) -> str:
    """Fetch transcript from YouTube video"""
    try:
        yt = YouTubeTranscriptApi()
        transcript_list = yt.fetch(video_id=video_id)
        if not transcript_list:
            raise Exception(f"No transcript for {video_id}")
        transcript_text = " ".join([snippet.text for snippet in transcript_list])
        return transcript_text.strip()
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Transcript error: {str(e)}")

def chunk_transcript(transcript: str, chunk_size: int = 2000, overlap: int = 200) -> List[str]:
    """Split transcript into overlapping chunks for RAG"""
    chunks = []
    tokens = transcript.split()
    
    for i in range(0, len(tokens), chunk_size - overlap):
        chunk = " ".join(tokens[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
    
    return chunks

def get_embeddings_model():
    """Initialize embeddings model (using free HuggingFace)"""
    return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def create_embeddings(text: str) -> str:
    """Create embedding for text chunk"""
    embeddings = get_embeddings_model()
    embedding = embeddings.embed_query(text)
    return json.dumps(embedding)

def find_relevant_chunks(question: str, chunks_with_embeddings: List[dict], top_k: int = 3) -> str:
    """Find most relevant chunks using similarity search"""
    embeddings = get_embeddings_model()
    question_embedding = embeddings.embed_query(question)
    
    similarities = []
    for chunk in chunks_with_embeddings:
        chunk_embedding = json.loads(chunk['embedding'])
        similarity = sum(a*b for a,b in zip(question_embedding, chunk_embedding))
        similarities.append((chunk['content'], similarity))
    
    similarities.sort(key=lambda x: x[1], reverse=True)
    relevant_text = "\n\n".join([chunk[0] for chunk in similarities[:top_k]])
    return relevant_text

def generate_summary(transcript: str, model: str) -> str:
    """Generate summary from transcript using Claude"""
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not set")
    
    chat_model = ChatAnthropic(
        model=model,
        temperature=0.7,
        max_tokens=1500,
        api_key=ANTHROPIC_API_KEY
    )
    
    chain = SUMMARY_PROMPT | chat_model | StrOutputParser()
    summary = chain.invoke({"transcript": transcript})
    return summary

def answer_question(question: str, relevant_chunks: str, model: str) -> str:
    """Answer question based on relevant chunks"""
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not set")
    
    chat_model = ChatAnthropic(
        model=model,
        temperature=0.7,
        max_tokens=500,
        api_key=ANTHROPIC_API_KEY
    )
    
    prompt = f"""Based on the following video content, answer the question.

Content:
{relevant_chunks}

Question: {question}

Answer:"""
    
    response = chat_model.invoke(prompt)
    return response.content