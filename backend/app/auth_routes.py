from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import httpx

from app.auth_service import (
    get_google_user_info, get_facebook_user_info,
    create_access_token, create_refresh_token,
    get_or_create_user, verify_token, refresh_access_token,
    revoke_refresh_token
)
from app.config import (
    GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI,
    FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET, FACEBOOK_REDIRECT_URI
)
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

# --- Schemas ---
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: str | None
    created_at: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class LogoutRequest(BaseModel):
    refresh_token: str

class GoogleCodeRequest(BaseModel):
    """Defines the structure for the Google auth code request body."""
    code: str

# --- Google OAuth ---
@router.post("/google/token")
async def google_token_exchange(request: GoogleCodeRequest, db: Session = Depends(get_db)):
    """Exchange Google authorization code for tokens"""
    try:
        code = request.code
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code"
                }
            )
            print("redirect URI", GOOGLE_REDIRECT_URI)
            if token_response.status_code != 200:
                print("--- GOOGLE TOKEN EXCHANGE ERROR ---")
                print(f"Status: {token_response.status_code}")
                # This line prints the detailed JSON error from Google
                print("Details:", token_response.text) 
                print("-----------------------------------")
            token_response.raise_for_status()
            tokens = token_response.json()
            
            # Get user info from Google
            user_info = await get_google_user_info(tokens["access_token"])
            
            # Get or create user
            user = await get_or_create_user(
                db=db,
                provider="google",
                provider_id=user_info["id"],
                email=user_info["email"],
                name=user_info["name"],
                picture=user_info.get("picture")
            )
            
            # Create tokens
            access_token = create_access_token(user.id)
            refresh_token = await create_refresh_token(db, user.id)
            
            return TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                user={
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "picture": user.picture
                }
            )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Google auth failed: {str(e)}")

# --- Facebook OAuth ---
@router.post("/facebook/token")
async def facebook_token_exchange(code: str, db: Session = Depends(get_db)):
    """Exchange Facebook authorization code for tokens"""
    try:
        async with httpx.AsyncClient() as client:
            token_response = await client.get(
                "https://graph.facebook.com/v18.0/oauth/access_token",
                params={
                    "client_id": FACEBOOK_CLIENT_ID,
                    "client_secret": FACEBOOK_CLIENT_SECRET,
                    "redirect_uri": FACEBOOK_REDIRECT_URI,
                    "code": code
                }
            )
            token_response.raise_for_status()
            tokens = token_response.json()
            
            # Get user info from Facebook
            user_info = await get_facebook_user_info(tokens["access_token"])
            
            # Get or create user
            user = await get_or_create_user(
                db=db,
                provider="facebook",
                provider_id=user_info["id"],
                email=user_info["email"],
                name=user_info["name"],
                picture=user_info.get("picture")
            )
            
            # Create tokens
            access_token = create_access_token(user.id)
            refresh_token = await create_refresh_token(db, user.id)
            
            return TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                user={
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "picture": user.picture
                }
            )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Facebook auth failed: {str(e)}")

# --- Token Refresh ---
@router.post("/refresh")
async def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    try:
        new_access_token = await refresh_access_token(db, request.refresh_token)
        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# --- User Profile ---
@router.get("/me")
async def get_current_user(token: str = None, db: Session = Depends(get_db)):
    """Get current user profile"""
    if not token:
        raise HTTPException(status_code=401, detail="Token required")
    
    try:
        user_id = verify_token(token)
        from app.models import User
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            picture=user.picture,
            created_at=user.created_at.isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Logout ---
@router.post("/logout")
async def logout(request: LogoutRequest, db: Session = Depends(get_db)):
    """Logout user by revoking refresh token"""
    revoke_refresh_token(db, request.refresh_token)
    return {"message": "Logged out successfully"}