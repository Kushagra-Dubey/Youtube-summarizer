import uvicorn
from app.main import app

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",  # Points to the 'app' object in 'app/main.py'
        host="0.0.0.0",
        port=8000,
        reload=True      # Enable auto-reload for development
    )