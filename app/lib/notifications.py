import httpx
from app.database import supabase_admin

class NotificationDispatcher:
    @staticmethod
    async def send_sms(phone_number: str, message: str, profile_id: str):
        """Dispatches real-time automated SMS notifications via Africa's Talking gateway."""
        url = "https://africastalking.com"
        headers = {
            "ApiKey": "your_africastalking_api_key_here",
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {
            "username": "sandbox",
            "to": phone_number,
            "message": message
        }
        
        # Log to Supabase audit trail tables
        try:
            supabase_admin.table("notifications").insert({
                "profile_id": profile_id,
                "type": "sms",
                "title": "Repayment Processed",
                "body": message
            }).execute()
        except Exception as db_err:
            print(f"[DB WARNING] Failed to archive notification log: {db_err}")

        # Simulate network broadcast locally
        print(f"\n[🚀 AFRICA'S TALKING SMS OUTBOUND]")
        print(f"Target Destination: {phone_number}")
        print(f"Message Content: {message}\n")

    @staticmethod
    async def send_email(email_address: str, subject: str, html_body: str, profile_id: str):
        """Sends rich HTML transactional updates using Resend API."""
        url = "https://resend.com"
        headers = {
            "Authorization": "Bearer your_resend_api_key_here",
            "Content-Type": "application/json"
        }
        payload = {
            "from": "LendFlow <noreply@lendflow.com>",
            "to": [email_address],
            "subject": subject,
            "html": html_body
        }

        try:
            supabase_admin.table("notifications").insert({
                "profile_id": profile_id,
                "type": "email",
                "title": subject,
                "body": html_body
            }).execute()
        except Exception as db_err:
            print(f"[DB WARNING] Failed to archive notification log: {db_err}")

        # Simulate network broadcast locally
        print(f"\n[📧 RESEND EMAIL OUTBOUND]")
        print(f"Recipient: {email_address}")
        print(f"Subject Line: {subject}\n")
