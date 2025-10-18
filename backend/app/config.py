import os
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate

# Load environment variables from .env file
load_dotenv()

# --- API Keys ---
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

# --- Model Configuration ---
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

DEFAULT_MODEL = "claude-3-5-sonnet-20241022"

# --- Prompt Templates ---
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

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./youtube_summarizer.db")

# --- JWT Configuration ---
SECRET_KEY = os.getenv("SECRET_KEY", None)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# --- Google OAuth ---
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")

# --- Facebook OAuth ---
FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID")
FACEBOOK_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET")
FACEBOOK_REDIRECT_URI = os.getenv("FACEBOOK_REDIRECT_URI", "http://localhost:8000/api/auth/facebook/callback")

# --- CORS ---
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]

# --- API Keys ---
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")