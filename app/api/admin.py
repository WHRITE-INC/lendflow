from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timedelta, timezone
import uuid
from app.auth import AuthenticationEngine
from app.database import supabase_admin, supabase_client
from app.lib.payments import PaymentEngineFactory

admin_router = APIRouter(prefix="/admin", tags=["Back-Office Administrative Node"])

@admin_router.post("/applications/{application_id}/disburse")
async def approve_and_disburse_loan(
    application_id: str, 
    current_admin: dict = Depends(AuthenticationEngine.enforce_admin_clearance)
):
    """
    Approves a submitted loan application and instantly triggers a 
    live financial payout over the corresponding mobile wallet network.
    """
    # 1. Fetch application details along with user profile context
    app_query = supabase_admin.table("loan_applications")\
        .select("*, profiles(*)")\
        .eq("id", application_id)\
        .single()\
        .execute()
        
    if not app_query.data:
        raise HTTPException(status_code=404, detail="Application record not found")
        
    app = app_query.data
    if app["status"] != "submitted":
        raise HTTPException(status_code=400, detail=f"Application cannot be disbursed. Current state is: '{app['status']}'")
        
    user_profile = app["profiles"]
    principal = float(app["requested_amount"])
    
    # 2. Extract country currency variables dynamically
    currency_map = {"Kenya": "KES", "Ghana": "GHS", "Zambia": "ZMW", "Rwanda": "RWF", "Uganda": "UGX"}
    currency = currency_map.get(user_profile["country"], "USD")
    
    # 3. Calculate financial ledger lines (Standard 15% Interest)
    interest = principal * 0.15
    total_payable = principal + interest
    
    # 4. Route provider tokens based on user territory mapping definitions
    provider_token = "M-PESA" if user_profile["country"] == "Kenya" else "MTN"
    payment_engine = PaymentEngineFactory.get_provider(provider_token)
    
    txn_ref = f"LF-DISB-{uuid.uuid4().hex[:8].upper()}"
    payout_res = await payment_engine.process_disbursement(
        phone=user_profile["phone_number"],
        amount=principal,
        currency=currency,
        reference=txn_ref
    )
    
    if not payout_res.success:
        raise HTTPException(status_code=502, detail=f"Mobile Network disbursement rejected: {payout_res.execution_message}")
        
    # 5. Atomic state persistence update directly in your Supabase DB tables
    supabase_admin.table("loan_applications").update({"status": "disbursed"}).eq("id", application_id).execute()
    
    loan_payload = {
        "profile_id": app["profile_id"],
        "principal_amount": principal,
        "interest_amount": interest,
        "outstanding_balance": total_payable,
        "status": "active"
    }
    supabase_admin.table("loans").insert(loan_payload).execute()
    
    # 6. Log programmatic events to transaction tables
    txn_payload = {
        "profile_id": app["profile_id"],
        "provider": provider_token,
        "transaction_type": "disbursement",
        "amount": principal,
        "currency": currency,
        "reference_id": txn_ref,
        "status": "successful"
    }
    supabase_admin.table("transactions").insert(txn_payload).execute()
    
    return {
        "status": "disbursed", 
        "network_reference": payout_res.network_reference,
        "outstanding_balance": total_payable
    }


@admin_router.post("/profiles/{profile_id}/adjust-risk")
async def adjust_user_risk_score(
    profile_id: str,
    new_score: int,
    current_admin: dict = Depends(AuthenticationEngine.enforce_admin_clearance)
):
    """Allows administrators to manually tweak borrower risk ratings following audit profiles."""
    if not (0 <= new_score <= 100):
        raise HTTPException(status_code=400, detail="Risk score values must sit between 0 and 100 boundaries")
        
    res = supabase_admin.table("profiles").update({"risk_score": new_score}).eq("id", profile_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Target borrower profile row reference not found")
        
    return {"status": "updated", "new_risk_score": new_score}
