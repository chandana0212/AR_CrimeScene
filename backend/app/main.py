from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import create_indexes, health_check
from .routes import recall, sessions
from .seed_questions import seed_questions_if_empty


app = FastAPI(
    title="Crime Scene Memory Distortion API",
    version="0.1.0",
    description="Backend service for AI-powered crime scene memory distortion experiments.",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup() -> None:
    await create_indexes()
    await seed_questions_if_empty()


@app.get("/health")
async def health():
    return await health_check()


app.include_router(sessions.router)
app.include_router(recall.router)

