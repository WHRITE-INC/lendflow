from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from app.database import supabase_admin
from app.lib.notifications import NotificationDispatcher

webhooks_router = APIRouter(prefix="/webhooks", tags=["Supabase & Network Sync Webhooks"])

async def finalize_repayment_ledger(transaction_ref: str, amount_paid: float):
    """
    Asynchronous system worker executing state modifications on matching accounts.
    Updates historical balances and triggers automated SMS transaction receipts.
    """
    # 1. Identify matching ledger row reference tokens
    txn = supabase_admin.table("transactions")\
        .select("*, profiles(*)")\
        .eq("reference_id", transaction_ref)\
        .single()\
        .execute()
        
    if not txn.data or txn.data["status"] == "successful":
        return
        
    t_records = txn.data
    loan_id = t_records["loan_id"]
    profile_id = t_records["profile_id"]
    user_profile = t_records["profiles"]

    # 2. Update active transaction log entry state to 'successful'
    supabase_admin.table("transactions")\
        .update({"status": "successful"})\
        .eq("id", t_records["id"])\
        .execute()

    # 3. Process principal reduction math across the target loan line
    loan = supabase_admin.table("loans").select("*").eq("id", loan_id).single().execute()
    if loan.data:
        current_balance = float(loan.data["outstanding_balance"])
        new_balance = max(0.00, current_balance - amount_paid)
        loan_status = "completed" if new_balance <= 0 else "active"
        
        # Write state variables straight back to Supabase
        supabase_admin.table("loans").update({
            "outstanding_balance": new_balance,
            "status": loan_status
        }).eq("id", loan_id).execute()

        # 4. Fire automated transaction confirmation over network nodes
        alert_msg = f"LendFlow Alert: Payment of {amount_paid} received. Your outstanding balance is now: {new_balance}."
        await NotificationDispatcher.send_sms(user_profile["phone_number"], alert_msg, profile_id)

@webhooks_router.post("/momo-callback")
async def processed_mobile_money_callback(request: Request, background_tasks: BackgroundTasks):
    """
    Public API webhook gateway mapping incoming asynchronous structural JSON streams.
    """
    try:
        payload = await request.json()
        event_type = payload.get("event") or payload.get("status")
        
        if event_type in ["charge.completed", "SUCCESSFUL", "SUCCESS", "00"]:
            data = payload.get("data") or payload
            transaction_ref = data.get("tx_ref") or data.get("client_reference") or data.get("mpesa_reference")
            amount = float(data.get("amount") or data.get("transaction_amount", 0))
            
            if transaction_ref:
                # Dispatch execution mechanics to an async background worker thread to free up network lines immediately
                background_tasks.add_task(finalize_repayment_ledger, transaction_ref, amount)
                return {"status": "callback_processed", "code": 200}
                
        raise HTTPException(status_code=400, detail="Parsing Error: Unrecognized payload architecture mapping pattern")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Sync failure: {str(e)}")
