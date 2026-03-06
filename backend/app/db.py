from __future__ import annotations

import os
from typing import Any, Dict

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "crime_scene_memory")


class Database:
    """Lightweight MongoDB wrapper for accessing collections used by the app."""

    def __init__(self, uri: str = MONGO_URI, db_name: str = MONGO_DB_NAME) -> None:
        self._client: AsyncIOMotorClient = AsyncIOMotorClient(uri)
        self._db: AsyncIOMotorDatabase = self._client[db_name]

    @property
    def raw(self) -> AsyncIOMotorDatabase:
        return self._db

    @property
    def sessions(self):
        return self._db["sessions"]

    @property
    def questions(self):
        return self._db["questions"]

    @property
    def recall_responses(self):
        return self._db["recall_responses"]

    @property
    def reports(self):
        return self._db["reports"]


db = Database()


async def create_indexes() -> None:
    """Create useful indexes if they do not already exist."""

    await db.sessions.create_index("session_id", unique=True)
    await db.recall_responses.create_index("session_id")
    await db.recall_responses.create_index(
        [("session_id", 1), ("object_key", 1)],
    )
    await db.reports.create_index("session_id", unique=True)


async def health_check() -> Dict[str, Any]:
    """Simple health check to ensure MongoDB is reachable."""
    await db.raw.command("ping")
    return {"status": "ok"}

