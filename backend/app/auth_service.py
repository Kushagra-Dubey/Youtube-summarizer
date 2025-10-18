from datetime import datetime, timedelta
import jwt
from jwt import InvalidTokenError
from sqlalchemy.orm import Session
from sqlalchemy import update
from app.models import User, RefreshToken
from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
import uuid
import httpx

async def get_google_user_info(access_token: str):
    """Fetch user info from Google"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        response.raise_for_status()
        return response.json()

async def get_facebook_user_info(access_token: str):
    """Fetch user info from Facebook"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://graph.facebook.com/me",
            params={
                "fields": "id,email,name,picture",
                "access_token": access_token
            }
        )
        response.raise_for_status()
        data = response.json()
        return {
            "id": data.get("id"),
            "email": data.get("email"),
            "name": data.get("name"),
            "picture": data.get("picture", {}).get("data", {}).get("url")
        }

def create_access_token(user_id: str) -> str:
    """Generate JWT access token"""
    payload = {
        "sub": user_id,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def create_refresh_token(db: Session, user_id: str) -> str:
    """Create and store refresh token"""
    token = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    refresh_token = RefreshToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at
    )
    db.add(refresh_token)
    db.commit()
    db.refresh(refresh_token)
    
    return token

def verify_token(token: str) -> str:
    """Verify JWT token and return user_id"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise InvalidTokenError("Invalid token")
        return user_id
    except InvalidTokenError:
        raise InvalidTokenError("Invalid or expired token")

async def get_or_create_user(
    db: Session,
    provider: str,
    provider_id: str,
    email: str,
    name: str,
    picture: str = None
) -> User:
    """Get existing user or create new one"""
    user = db.query(User).filter(User.provider_id == provider_id).first()
    
    if user:
        # Update last login
        stmt = update(User).where(User.id == user.id).values(
            last_login=datetime.utcnow(),
            picture=picture
        )
        db.execute(stmt)
        db.commit()
        return user
    
    # Create new user
    new_user = User(
        email=email,
        name=name,
        picture=picture,
        provider=provider,
        provider_id=provider_id,
        last_login=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

async def refresh_access_token(db: Session, refresh_token: str) -> str:
    """Generate new access token from refresh token"""
    token_obj = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token,
        RefreshToken.revoked == False,
        RefreshToken.expires_at > datetime.utcnow()
    ).first()
    
    if not token_obj:
        raise InvalidTokenError("Invalid or expired refresh token")
    
    return create_access_token(token_obj.user_id)

def revoke_refresh_token(db: Session, refresh_token: str):
    """Revoke refresh token on logout"""
    stmt = update(RefreshToken).where(
        RefreshToken.token == refresh_token
    ).values(revoked=True)
    db.execute(stmt)
    db.commit()