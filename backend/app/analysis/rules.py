from __future__ import annotations

from typing import Dict, Optional

from ..models import Question


NORMALIZED_DONT_KNOW = {"dont_know", "don't know", "idk", "no idea"}


def normalize_answer(raw: str) -> str:
    """Normalize free-text answers so comparisons are robust."""
    value = (raw or "").strip().lower()
    value = value.replace(" ", "_")
    return value


def classify_answer(
    question: Question,
    user_answer_raw: str,
) -> Dict[str, Optional[object]]:
    """
    Classify a single answer with simple, explainable rules.

    Returns a dict with:
      - user_answer_normalized
      - is_correct
      - is_distorted
      - is_false_memory
      - error_type
    """
    user_norm = normalize_answer(user_answer_raw)
    correct_norm = normalize_answer(question.correct_answer)
    after_norm = normalize_answer(question.after_scene_value) if question.after_scene_value else None

    if user_norm in NORMALIZED_DONT_KNOW:
        return {
            "user_answer_normalized": user_norm,
            "is_correct": False,
            "is_distorted": False,
            "is_false_memory": False,
            "error_type": "dont_know",
        }

    if user_norm == correct_norm:
        return {
            "user_answer_normalized": user_norm,
            "is_correct": True,
            "is_distorted": False,
            "is_false_memory": False,
            "error_type": None,
        }

    is_distorted = False
    error_type: Optional[str] = "generic_error"

    if after_norm and user_norm == after_norm:
        is_distorted = True
        error_type = "misinformation_match"
    elif question.distortion_type:
        is_distorted = True
        error_type = f"distortion_{question.distortion_type.value}"

    is_false_memory = False
    if question.before_scene_value:
        before_norm = normalize_answer(question.before_scene_value)
        if user_norm not in {before_norm, correct_norm, after_norm}:
            is_false_memory = True
            error_type = "false_memory"

    return {
        "user_answer_normalized": user_norm,
        "is_correct": False,
        "is_distorted": is_distorted,
        "is_false_memory": is_false_memory,
        "error_type": error_type,
    }

