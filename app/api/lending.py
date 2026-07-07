from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime, timezone
import uuid
from app.auth import AuthenticationEngine
from app.database import supabase_client, supabase_admin
from app.schemas import LoanApplicationResponse
from app.lib.payments import PaymentEngineFactory

# 1. Initialize the router immediately so all decorative routes can bind to it
lending_router = APIRouter(prefix="/lending", tags=["Fintech Underwriting Core"])

@lending_router.get("/dashboard-promo", tags=["Promotional Packages"])
async def get_localized_onboarding_promotions(
    current_user: dict = Depends(AuthenticationEngine.get_current_user)
):
    """
    Dynamically renders the localized promo packages layout text strings 
    and pricing tiers relative to the client country profile parameter mapping.
    """
    user_id = current_user.get("user_id")
    
    # Pull current user profile attributes out of Supabase
    profile = supabase_client.table("profiles").select("*").eq("id", user_id).single().execute()
    if not profile.data:
        raise HTTPException(status_code=404, detail="Borrower account metadata missing")
        
    p_data = profile.data
    user_name = p_data.get("full_name", "User")
    user_country = p_data.get("country", "Kenya")

    # Localized Currency Label and Base Exchange Scale Multipliers
    regional_config = {
        "Kenya": {"symbol": "Ksh", "rate": 1.0, "fee_rate": 1.0},
        "Ghana": {"symbol": "₵", "rate": 0.12, "fee_rate": 0.12},
        "Zambia": {"symbol": "ZK", "rate": 0.22, "fee_rate": 0.22},
        "Uganda": {"symbol": "USh", "rate": 28.5, "fee_rate": 28.5},
        "Rwanda": {"symbol": "FRw", "rate": 10.2, "fee_rate": 10.2}
    }
    
    ctx = regional_config.get(user_country, {"symbol": "Ksh", "rate": 1.0, "fee_rate": 1.0})
    sym = ctx["symbol"]
    fx = ctx["rate"]
    feefx = ctx["fee_rate"]

    promo_matrix = [
        {"tier": 1, "loan": 35000, "fee": 490},
        {"tier": 2, "loan": 47000, "fee": 690},
        {"tier": 3, "loan": 55000, "fee": 890},
        {"tier": 4, "loan": 65000, "fee": 990},
        {"tier": 5, "loan": 100000, "fee": 3000},
        {"tier": 6, "loan": 150000, "fee": 5900},
        {"tier": 7, "loan": 200000, "fee": 7990}
    ]

    localized_packages = []
    formatted_display_lines = []

    for pkg in promo_matrix:
        converted_loan = round(pkg["loan"] * fx)
        converted_fee = round(pkg["fee"] * feefx)
        
        localized_packages.append({
            "package_id": pkg["tier"],
            "amount": converted_loan,
            "verification_fee": converted_fee,
            "currency": sym
        })
        
        formatted_display_lines.append(
            f"{pkg['tier']}. Qualification of *{converted_loan:,}* @ *{sym}{converted_fee:,}*"
        )

    return {
        "welcome_banner": f"Congratulations **{user_name}** you have slotted to qualify for our promotion. Kindly just choose your package..",
        "country_detected": user_country,
        "currency_symbol": sym,
        "display_list": formatted_display_lines,
        "raw_packages_payload": localized_packages
    }

@lending_router.post("/upload-kyc")
async def upload_kyc_document(
    document_type: str = Form(..., description="e.g., ghana_card_front, national_id_front, passport"),
    file: UploadFile = File(...),
    current_user: dict = Depends(AuthenticationEngine.get_current_user)
):
    """
    Uploads binary identification documents straight to Supabase Private Storage.
    Updates the customer's compliance verification trail instantly.
    """
    user_id = current_user.get("user_id")
    file_extension = file.filename.split(".")[-1]
    storage_path = f"{user_id}/{document_type}-{int(datetime.now(timezone.utc).timestamp())}.{file_extension}"
    
    try:
        file_contents = await file.read()
        supabase_admin.storage.from_("kyc-documents").upload(
            path=storage_path,
            file=file_contents,
            file_options={"content-type": file.content_type}
        )
        
        kyc_payload = {
            "profile_id": user_id,
            "document_type": document_type,
            "file_url": storage_path,
            "status": "under_review"
        }
        supabase_admin.table("kyc_documents").insert(kyc_payload).execute()
        supabase_admin.table("profiles").update({"kyc_status": "under_review"}).eq("id", user_id).execute()
        
        return {
            "status": "under_review",
            "message": "Identification secured successfully. Back-office validation processing initiated.",
            "file_reference": storage_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Secure storage injection pipeline failure: {str(e)}")

@lending_router.post("/apply")
async def submit_loan_request(
    product_id: str = Form(...),
    requested_amount: float = Form(...),
    supporting_notes: Optional[str] = Form(None),
    current_user: dict = Depends(AuthenticationEngine.get_current_user)
):
    """
    Evaluates credit risk profiles dynamically. Inserts valid applicant entries into our master credit tracker.
    """
    user_id = current_user.get("user_id")
    
    profile = supabase_client.table("profiles").select("*").eq("id", user_id).single().execute()
    if not profile.data:
        raise HTTPException(status_code=404, detail="User context map not found")
        
    p_data = profile.data
    if p_data.get("kyc_status") != "approved":
        raise HTTPException(status_code=403, detail=f"Credit Blocked: Profile KYC state is currently '{p_data.get('kyc_status')}'. Approved identity files required.")

    product = supabase_client.table("loan_products").select("*").eq("id", product_id).single().execute()
    if not product.data:
        raise HTTPException(status_code=444, detail="Target loan tier reference code does not exist")
        
    prod = product.data
    if not (float(prod["min_amount"]) <= requested_amount <= float(prod["max_amount"])):
        raise HTTPException(status_code=400, detail=f"Amount bounds exception. Target criteria: Min {prod['min_amount']} - Max {prod['max_amount']}")

    application_payload = {
        "profile_id": user_id,
        "product_id": product_id,
        "requested_amount": requested_amount,
        "status": "submitted",
        "supporting_notes": supporting_notes
    }
    
    app_res = supabase_client.table("loan_applications").insert(application_payload).execute()
    return {"status": "submitted", "application": app_res.data if app_res.data else app_res.data}
