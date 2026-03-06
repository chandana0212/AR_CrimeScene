from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException, status

from ..analysis.rules import classify_answer
from ..db import db
from ..models import Question, RecallAnswer, RecallAnswerCreate


router = APIRouter(prefix="/recall", tags=["recall"])


@router.post("", response_model=RecallAnswer)
async def submit_recall_answer(payload: RecallAnswerCreate) -> RecallAnswer:
    session = await db.sessions.find_one({"session_id": payload.session_id})
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    question_doc = None
    if payload.question_id:
        question_doc = await db.questions.find_one({"id": payload.question_id})
    elif payload.object_key:
        question_doc = await db.questions.find_one({"object_key": payload.object_key})

    if not question_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Matching question not found for the provided identifier",
        )

    question = Question(**question_doc)

    classified = classify_answer(question=question, user_answer_raw=payload.user_answer)

    answer_id = str(uuid.uuid4())
    now = datetime.utcnow()

    doc = {
        "id": answer_id,
        "session_id": payload.session_id,
        "question_id": question.id,
        "object_key": question.object_key,
        "user_answer_raw": payload.user_answer,
        "user_answer_normalized": classified["user_answer_normalized"],
        "is_correct": classified["is_correct"],
        "is_distorted": classified["is_distorted"],
        "is_false_memory": classified["is_false_memory"],
        "error_type": classified["error_type"],
        "created_at": now,
    }

    await db.recall_responses.insert_one(doc)

    return RecallAnswer(**doc)

