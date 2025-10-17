import re

def extract_video_id(url: str) -> str:
    """Extract video ID from YouTube URL"""
    if not url:
        raise ValueError("No URL provided")
        
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