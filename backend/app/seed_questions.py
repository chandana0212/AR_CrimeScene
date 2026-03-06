"""Seed default questions for crime_scene_1 so POST /recall can resolve them."""
from __future__ import annotations

from .db import db
from .models import DistortionType, QuestionType

CRIME_SCENE_1_QUESTIONS = [
    {
        "id": "light_stand_color",
        "scene_id": "crime_scene_1_before",
        "object_key": "light_stand_color",
        "prompt_text": "What was the color of the light stand?",
        "question_type": QuestionType.FREE_TEXT.value,
        "options": [],
        "correct_answer": "white",
        "distortion_type": DistortionType.COLOR_CHANGE.value,
        "before_scene_value": "white",
        "after_scene_value": "black",
    },
    {
        "id": "phone_location",
        "scene_id": "crime_scene_1_before",
        "object_key": "phone_location",
        "prompt_text": "Where was the phone placed?",
        "question_type": QuestionType.FREE_TEXT.value,
        "options": [],
        "correct_answer": "table",
        "distortion_type": DistortionType.LOCATION_CHANGE.value,
        "before_scene_value": "table",
        "after_scene_value": "floor",
    },
    {
        "id": "knife_location",
        "scene_id": "crime_scene_1_before",
        "object_key": "knife_location",
        "prompt_text": "Where was the knife?",
        "question_type": QuestionType.FREE_TEXT.value,
        "options": [],
        "correct_answer": "table",
        "distortion_type": DistortionType.LOCATION_CHANGE.value,
        "before_scene_value": "table",
        "after_scene_value": "floor",
    },
]


async def seed_questions_if_empty() -> None:
    """Insert default questions for crime_scene_1 if the questions collection is empty."""
    count = await db.questions.count_documents({})
    if count > 0:
        return
    for q in CRIME_SCENE_1_QUESTIONS:
        await db.questions.insert_one(q)
