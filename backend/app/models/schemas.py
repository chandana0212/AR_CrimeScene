from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class SessionStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class SessionCreate(BaseModel):
    participant_id: Optional[str] = Field(
        default=None, description="Optional external participant identifier"
    )
    condition: Optional[str] = Field(
        default=None,
        description="Experimental condition label, e.g. type of distraction task",
    )
    scene_version: str = Field(
        ..., description="Identifier for the crime scene configuration (e.g. crime_scene_1)"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Free-form metadata (device info, notes, etc.)"
    )


class Session(BaseModel):
    session_id: str = Field(..., description="Backend-issued UUID for this experiment run")
    participant_id: Optional[str] = None
    condition: Optional[str] = None
    scene_version: str
    status: SessionStatus = SessionStatus.IN_PROGRESS
    started_at: datetime
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    BOOLEAN = "boolean"
    FREE_TEXT = "free_text"


class DistortionType(str, Enum):
    LOCATION_CHANGE = "location_change"
    COLOR_CHANGE = "color_change"
    PRESENCE_ABSENCE = "presence_absence"
    OBJECT_ADDED = "object_added"
    OBJECT_REMOVED = "object_removed"
    OTHER = "other"


class Question(BaseModel):
    id: str = Field(..., description="Stable identifier shared between Unity and backend")
    scene_id: str = Field(
        ...,
        description="Scene identifier, e.g. crime_scene_1_before, used to group questions",
    )
    object_key: str = Field(
        ...,
        description="Logical key for the probed element (weapon_location, book_color, etc.)",
    )
    prompt_text: str
    question_type: QuestionType
    options: List[str] = Field(
        default_factory=list,
        description="List of answer options for multiple choice questions",
    )
    correct_answer: str = Field(
        ...,
        description="Ground-truth answer for the ORIGINAL scene in normalized form",
    )
    distortion_type: Optional[DistortionType] = Field(
        default=None, description="What kind of misinformation is applied in the AFTER scene"
    )
    before_scene_value: Optional[str] = Field(
        default=None,
        description="Optional explicit value for the original scene (before changes)",
    )
    after_scene_value: Optional[str] = Field(
        default=None,
        description="Optional explicit value for the modified scene (after changes)",
    )


class RecallAnswerCreate(BaseModel):
    session_id: str
    question_id: Optional[str] = Field(
        default=None,
        description="Preferred way to link to the question definition if available",
    )
    object_key: Optional[str] = Field(
        default=None,
        description="Fallback identifier if question_id is not used by the client",
    )
    user_answer: str = Field(
        ..., description="Raw answer payload sent from Unity (button label, text, etc.)"
    )


class RecallAnswer(BaseModel):
    id: str
    session_id: str
    question_id: Optional[str] = None
    object_key: Optional[str] = None
    user_answer_raw: str
    user_answer_normalized: str
    is_correct: bool
    is_distorted: bool
    is_false_memory: bool
    error_type: Optional[str] = Field(
        default=None,
        description="Human-readable label for the type of error (e.g. location_misattribution)",
    )
    created_at: datetime


class SessionMetrics(BaseModel):
    memory_accuracy: float = Field(
        ..., description="Proportion (0–1) of correctly answered questions"
    )
    suggestibility_index: float = Field(
        ..., description="Proportion (0–1) of answers matching misinformation cues"
    )
    distortion_rate: float = Field(
        ..., description="Proportion (0–1) of all incorrect answers"
    )
    false_recall_count: int = Field(
        ..., description="Number of answers that mention non-existent objects"
    )
    missed_object_count: int = Field(
        ..., description="Number of key objects where user omitted or answered 'don't know'"
    )
    total_questions: int
    total_correct: int
    total_incorrect: int
    witness_reliability: str = Field(
        ...,
        description="Witness reliability classification (Reliable Witness / Moderately Reliable / Unreliable Witness)",
    )


class PerObjectBreakdown(BaseModel):
    object_key: str
    accuracy: float
    distorted_rate: float
    false_memory_rate: float
    missed_rate: float


class SessionReport(BaseModel):
    session_id: str
    metrics: SessionMetrics
    per_object: List[PerObjectBreakdown] = Field(
        default_factory=list,
        description="Optional breakdown of metrics per probed object in the scene",
    )
    generated_at: datetime


class ReportResponse(BaseModel):
    """Public response schema returned by GET /sessions/{session_id}/report."""

    memory_accuracy: float = Field(..., example=0.72)
    suggestibility_index: float = Field(..., example=0.31)
    distortion_rate: float = Field(..., example=0.18)
    false_recall_count: int = Field(..., example=2)
    missed_object_count: int = Field(..., example=1)
    witness_reliability: str = Field(..., example="Moderate")


class PaginatedSessionsResponse(BaseModel):
    items: List[Session]
    total: int
    page: int
    page_size: int

