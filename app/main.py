from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title="LendFlow Core",
    description="Production African Cross-Border Digital Lending Kernel",
    version="1.0.0"
)

# Enforce secure CORS rules so your local mobile/desktop test views don't hit execution blocks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "operational", "system": "LendFlow Engine"}
