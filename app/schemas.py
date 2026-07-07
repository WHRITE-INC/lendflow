from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime

# --- AUTH & ONBOARDING SCHEMAS ---
class UserRegisterSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8-character secure hash password")
    full_name: str = Field(..., min_length=2)
    country: Literal['Zambia', 'Kenya', 'Uganda', 'Rwanda', 'Ghana']
    phone_number: str = Field(..., description="E.164 phone string format, e.g., +233XXXXXXXXX")
    national_id: str = Field(..., min_length=4, description="National ID or Ghana Card PIN structure")

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"

# --- PROFILE & KYC SCHEMAS ---
class ProfileResponse(BaseModel):
    id: str
    full_name: str
    country: str
    phone_number: str
    national_id: str
    kyc_status: Literal['pending', 'under_review', 'approved', 'rejected']
    risk_score: int
    role: Literal['customer', 'admin', 'collector']

class KycDocumentCreate(BaseModel):
    document_type: Literal['national_id_front', 'national_id_back', 'passport', 'utility_bill', 'ghana_card_front', 'ghana_card_back']
    file_url: str

# --- LENDING MACHINE SCHEMAS ---
class LoanProductResponse(BaseModel):
    id: str
    product_name: str
    min_amount: float
    max_amount: float
    interest_rate: float
    repayment_period_days: int
    is_active: bool

class LoanApplicationRequest(BaseModel):
    product_id: str
    requested_amount: float = Field(..., gt=0)
    supporting_notes: Optional[str] = None

class LoanApplicationResponse(BaseModel):
    id: str
    profile_id: str
    product_id: str
    requested_amount: float
    status: Literal['submitted', 'under_review', 'approved', 'rejected', 'disbursed']
    created_at: datetime

# --- TRANSACTION SCHEMAS ---
class CollectionInitiateRequest(BaseModel):
    loan_id: str
    network_provider: Literal['MTN', 'Airtel', 'M-Pesa', 'Telecel', 'AT_Money']
    phone_number: str
    amount: float = Field(..., gt=0)
