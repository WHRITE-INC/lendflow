from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime, timezone
import uuid
from app.auth import AuthenticationEngine
from app.database import supabase_client, supabase_admin
from app.schemas import LoanApplicationResponse
from app.lib.payments import PaymentEngineFactory

lending_router = APIRouter(prefix="/lending", tags=["Fintech Underwriting Core"])

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
    
    # Secure isolated object storage naming path logic: user_id/doc_type-timestamp.ext
    storage_path = f"{user_id}/{document_type}-{int(datetime.now(timezone.utc).timestamp())}.{file_extension}"
    
    try:
        file_contents = await file.read()
        
        # 1. Ship raw file stream directly into the private storage bucket
        storage_res = supabase_admin.storage.from_("kyc-documents").upload(
            path=storage_path,
            file=file_contents,
            file_options={"content-type": file.content_type}
        )
        
        # 2. Record data mapping inside our public ledger index table
        kyc_payload = {
            "profile_id": user_id,
            "document_type": document_type,
            "file_url": storage_path,
            "status": "under_review"
        }
        supabase_admin.table("kyc_documents").insert(kyc_payload).execute()
        
        # 3. Elevate user profile flag out of 'pending' and into compliance check queue
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
    Evaluates credit risk profiles dynamically. Inserts valid applicant entries
    into our master credit tracker.
    """
    user_id = current_user.get("user_id")
    
    # 1. Fetch user data to verify KYC status
    profile = supabase_client.table("profiles").select("*").eq("id", user_id).single().execute()
    if not profile.data:
        raise HTTPException(status_code=404, detail="User context map not found")
        
    p_data = profile.data
    if p_data.get("kyc_status") != "approved":
        raise HTTPException(status_code=403, detail=f"Credit Blocked: Profile KYC state is currently '{p_data.get('kyc_status')}'. Approved identity files required.")

    # 2. Match requested metrics against credit limits
    product = supabase_client.table("loan_products").select("*").eq("id", product_id).single().execute()
    if not product.data:
        raise HTTPException(status_code=444, detail="Target loan tier reference code does not exist")
        
    prod = product.data
    if not (float(prod["min_amount"]) <= requested_amount <= float(prod["max_amount"])):
        raise HTTPException(status_code=400, detail=f"Amount bounds exception. Target criteria: Min {prod['min_amount']} - Max {prod['max_amount']}")

    # 3. Create application record
    application_payload = {
        "profile_id": user_id,
        "product_id": product_id,
        "requested_amount": requested_amount,
        "status": "submitted",
        "supporting_notes": supporting_notes
    }
    
    app_res = supabase_client.table("loan_applications").insert(application_payload).execute()
    return {"status": "submitted", "application": app_res.data[0] if app_res.data else app_res.data}
