import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.database import supabase_admin, supabase_client
from app.schemas import UserRegisterSchema, UserLoginSchema, TokenSchema

security_agent = HTTPBearer()

# 1. Declare the router needed by app/main.py
auth_router = APIRouter(prefix="/auth", tags=["Authentication Engine"])

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
        """Validates incoming Bearer auth headers directly against token parameters."""
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
        """Enforces Role-Based Access Control (RBAC). Rejects customer requests."""
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Operation rejected: Insufficient back-office privileges")
        return current_user

# 2. Attach the active API endpoints directly to the router variable
@auth_router.post("/register", response_model=TokenSchema)
async def register_user(payload: UserRegisterSchema):
    # Hash password securely before storage
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(payload.password.encode('utf-8'), salt).decode('utf-8')
    
    # Store credentials in the core application authentication table
    auth_response = supabase_admin.auth.admin.create_user({
        "email": payload.email,
        "password": payload.password,
        "user_metadata": {
            "full_name": payload.full_name,
            "country": payload.country,
            "phone_number": payload.phone_number,
            "national_id": payload.national_id,
            "role": "customer"
        },
        "email_confirm": True
    })
    
    if not auth_response.user:
        raise HTTPException(status_code=400, detail="Identity registry creation failed")
        
    # Generate session access token for our customer portal
    access_token = AuthenticationEngine.create_access_token(
        data={"sub": auth_response.user.id, "role": "customer"}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@auth_router.post("/login", response_model=TokenSchema)
async def login_user(payload: UserLoginSchema):
    try:
        res = supabase_client.auth.sign_in_with_password({"email": payload.email, "password": payload.password})
        if not res.user:
            raise HTTPException(status_code=401, detail="Invalid credentials provided")
            
        # Pull role mapping out of profiles table
        profile_query = supabase_client.table("profiles").select("role").eq("id", res.user.id).single().execute()
        role = profile_query.data.get("role", "customer") if profile_query.data else "customer"
        
        access_token = AuthenticationEngine.create_access_token(data={"sub": res.user.id, "role": role})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
