from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List, Tuple

from ..models import (
    PerObjectBreakdown,
    RecallAnswer,
    SessionMetrics,
    SessionReport,
)


@dataclass
class ClassifiedCounts:
    total_questions: int
    total_correct: int
    total_incorrect: int
    distorted_answers: int
    false_recall_count: int
    missed_object_count: int


def _safe_ratio(numerator: int, denominator: int) -> float:
    if denominator == 0:
        return 0.0
    return numerator / float(denominator)


def aggregate_counts(responses: Iterable[RecallAnswer]) -> ClassifiedCounts:
    total_questions = 0
    total_correct = 0
    distorted_answers = 0
    false_recall_count = 0
    missed_object_count = 0

    for r in responses:
        total_questions += 1
        if r.is_correct:
            total_correct += 1
        else:
            # Not correct – check other labels
            if r.is_distorted:
                distorted_answers += 1
            if r.is_false_memory:
                false_recall_count += 1
            if (r.user_answer_normalized or "").strip().lower() in {"dont_know", "don't know"}:
                missed_object_count += 1

    total_incorrect = total_questions - total_correct

    return ClassifiedCounts(
        total_questions=total_questions,
        total_correct=total_correct,
        total_incorrect=total_incorrect,
        distorted_answers=distorted_answers,
        false_recall_count=false_recall_count,
        missed_object_count=missed_object_count,
    )


def compute_session_metrics(responses: List[RecallAnswer]) -> SessionMetrics:
    counts = aggregate_counts(responses)

    accuracy = _safe_ratio(counts.total_correct, counts.total_questions)
    distortion_rate = _safe_ratio(counts.total_incorrect, counts.total_questions)
    suggestibility_index = _safe_ratio(counts.distorted_answers, counts.total_questions)

    # Witness reliability classification based purely on accuracy, as specified:
    # accuracy > 80 → Reliable Witness
    # accuracy > 50 → Moderately Reliable
    # else         → Unreliable Witness
    if accuracy > 0.8:
        reliability = "Reliable Witness"
    elif accuracy > 0.5:
        reliability = "Moderately Reliable"
    else:
        reliability = "Unreliable Witness"

    return SessionMetrics(
        memory_accuracy=accuracy,
        suggestibility_index=suggestibility_index,
        distortion_rate=distortion_rate,
        false_recall_count=counts.false_recall_count,
        missed_object_count=counts.missed_object_count,
        total_questions=counts.total_questions,
        total_correct=counts.total_correct,
        total_incorrect=counts.total_incorrect,
        witness_reliability=reliability,
    )


def compute_per_object_breakdown(
    responses: List[RecallAnswer],
) -> List[PerObjectBreakdown]:
    grouped: dict[str, List[RecallAnswer]] = {}
    for r in responses:
        key = r.object_key or "unknown"
        grouped.setdefault(key, []).append(r)

    breakdowns: List[PerObjectBreakdown] = []
    for object_key, group in grouped.items():
        counts = aggregate_counts(group)
        breakdowns.append(
            PerObjectBreakdown(
                object_key=object_key,
                accuracy=_safe_ratio(counts.total_correct, counts.total_questions),
                distorted_rate=_safe_ratio(
                    counts.distorted_answers, counts.total_questions
                ),
                false_memory_rate=_safe_ratio(
                    counts.false_recall_count, counts.total_questions
                ),
                missed_rate=_safe_ratio(
                    counts.missed_object_count, counts.total_questions
                ),
            )
        )

    return breakdowns


def build_session_report(
    session_id: str, responses: List[RecallAnswer]
) -> Tuple[SessionReport, SessionMetrics, List[PerObjectBreakdown]]:
    metrics = compute_session_metrics(responses)
    per_object = compute_per_object_breakdown(responses)
    from datetime import datetime

    report = SessionReport(
        session_id=session_id,
        metrics=metrics,
        per_object=per_object,
        generated_at=datetime.utcnow(),
    )
    return report, metrics, per_object

