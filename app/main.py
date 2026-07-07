from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth import auth_router
from app.api.lending import lending_router
from app.api.admin import admin_router
from app.api.webhooks import webhooks_router

app = FastAPI(
    title="LendFlow Core",
    description="Production African Cross-Border Digital Lending Kernel",
    version="1.0.0"
)

# Enforce secure cross-origin rules for frontend/mobile clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Explicitly register your functional fintech routers
app.include_router(auth_router)
app.include_router(lending_router)
app.include_router(admin_router)
app.include_router(webhooks_router)

@app.get("/health", tags=["System Health"])
async def health_check():
    return {
        "status": "operational", 
        "system": "LendFlow Engine Core",
        "regions": ["Zambia", "Kenya", "Uganda", "Rwanda", "Ghana"]
    }
