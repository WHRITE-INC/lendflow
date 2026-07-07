from supabase import create_client, Client
from app.config import settings

# 1. Base client utilizing public credentials (inherits consumer RLS policies automatically)
supabase_client: Client = create_client(
    supabase_url=settings.supabase_url, 
    supabase_key=settings.supabase_key
)

# 2. Administrative service client bypassing row limitations to process disbursements and compliance states
supabase_admin: Client = create_client(
    supabase_url=settings.supabase_url, 
    supabase_key=settings.supabase_service_key
)
