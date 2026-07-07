import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.database import supabase_client

security_agent = HTTPBearer()

class AuthenticationEngine:
    @staticmethod
    def create_access_token(data: dict) -> str:
        """Generates a cryptographically signed JWT token payload."""
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
        to_encode.update({"exp": int(expire.timestamp())})
        encoded_jwt = jwt.encode(to_encode, settings.api_secret_key, algorithm=settings.jwt_algorithm)
        return encoded_jwt

    @staticmethod
    async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security_agent)) -> dict:
        """Validates incoming Bearer auth headers directly against the runtime cryptography rules."""
        token = credentials.credentials
        credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials signatures")
        
        try:
            payload = jwt.decode(token, settings.api_secret_key, algorithms=[settings.jwt_algorithm])
            user_id: str = payload.get("sub")
            user_role: str = payload.get("role")
            if user_id is None:
                raise credentials_exception
            return {"user_id": user_id, "role": user_role}
        except (jwt.PyJWTError, ValueError):
            raise credentials_exception

    @staticmethod
    async def enforce_admin_clearance(current_user: dict = Depends(get_current_user)) -> dict:
        """Enforces Role-Based Access Control (RBAC). Rejects unauthorized consumer requests."""
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Operation rejected: Insufficient back-office privileges")
        return current_user
