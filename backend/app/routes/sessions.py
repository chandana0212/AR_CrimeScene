from __future__ import annotations

import uuid
from datetime import datetime
from typing import List

from fastapi import APIRouter, HTTPException, status

from ..analysis.metrics import build_session_report
from ..db import db
from ..models import (
    PaginatedSessionsResponse,
    RecallAnswer,
    ReportResponse,
    Session,
    SessionCreate,
    SessionStatus,
)


router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=Session)
async def create_session(payload: SessionCreate) -> Session:
    session_id = str(uuid.uuid4())
    now = datetime.utcnow()

    doc = {
        "session_id": session_id,
        "participant_id": payload.participant_id,
        "condition": payload.condition,
        "scene_version": payload.scene_version,
        "status": SessionStatus.IN_PROGRESS.value,
        "started_at": now,
        "completed_at": None,
        "metadata": payload.metadata or {},
    }
    await db.sessions.insert_one(doc)

    return Session(**doc)


@router.get("/{session_id}", response_model=Session)
async def get_session(session_id: str) -> Session:
    doc = await db.sessions.find_one({"session_id": session_id})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return Session(**doc)


@router.get("", response_model=PaginatedSessionsResponse)
async def list_sessions(page: int = 1, page_size: int = 20) -> PaginatedSessionsResponse:
    skip = max(0, (page - 1) * page_size)
    cursor = (
        db.sessions.find({})
        .sort("started_at", -1)
        .skip(skip)
        .limit(page_size)
    )
    items: List[Session] = [Session(**doc) async for doc in cursor]
    total = await db.sessions.count_documents({})
    return PaginatedSessionsResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{session_id}/report", response_model=ReportResponse)
async def get_session_report(session_id: str) -> ReportResponse:
    existing = await db.reports.find_one({"session_id": session_id})
    if existing:
        metrics = existing.get("metrics", {})
        return ReportResponse(
            memory_accuracy=metrics.get("memory_accuracy", 0.0),
            suggestibility_index=metrics.get("suggestibility_index", 0.0),
            distortion_rate=metrics.get("distortion_rate", 0.0),
            false_recall_count=metrics.get("false_recall_count", 0),
            missed_object_count=metrics.get("missed_object_count", 0),
            witness_reliability=metrics.get("witness_reliability", "Unknown"),
        )

    session_doc = await db.sessions.find_one({"session_id": session_id})
    if not session_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    resp_docs = await db.recall_responses.find({"session_id": session_id}).to_list(length=None)
    responses: List[RecallAnswer] = [RecallAnswer(**doc) for doc in resp_docs]

    report, metrics, _ = build_session_report(session_id=session_id, responses=responses)

    await db.reports.update_one(
        {"session_id": session_id},
        {"$set": report.model_dump()},
        upsert=True,
    )

    return ReportResponse(
        memory_accuracy=metrics.memory_accuracy,
        suggestibility_index=metrics.suggestibility_index,
        distortion_rate=metrics.distortion_rate,
        false_recall_count=metrics.false_recall_count,
        missed_object_count=metrics.missed_object_count,
        witness_reliability=metrics.witness_reliability,
    )

