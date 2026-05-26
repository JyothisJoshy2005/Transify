"""
MongoDB Database Connection & Helper Functions
Handles all database interactions for translation history
"""

import logging
from datetime import datetime
from pymongo import MongoClient, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from bson import ObjectId
import json

logger = logging.getLogger(__name__)

# MongoDB connection config
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "transify_db"
HISTORY_COLLECTION = "translation_history"

# Global client instance
_client = None
_db = None


def get_db():
    """Get or create MongoDB database connection."""
    global _client, _db
    if _client is None:
        try:
            _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
            # Verify connection
            _client.admin.command('ping')
            _db = _client[DB_NAME]
            # Create indexes for performance
            _db[HISTORY_COLLECTION].create_index([("timestamp", DESCENDING)])
            _db[HISTORY_COLLECTION].create_index([("source_lang", 1)])
            _db[HISTORY_COLLECTION].create_index([("target_lang", 1)])
            logger.info("Connected to MongoDB successfully")
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.warning(f"MongoDB connection failed: {e}. Using in-memory fallback.")
            _client = None
            _db = None
    return _db


# In-memory fallback when MongoDB is unavailable
_memory_store = []
_next_id = 1


def save_translation(
    input_text: str,
    translated_text: str,
    source_lang: str,
    target_lang: str,
    accuracy: float,
    translation_type: str = "text"
) -> dict:
    """Save a translation record to database or memory fallback."""
    global _next_id

    record = {
        "input_text": input_text[:1000],  # limit stored text length
        "translated_text": translated_text[:1000],
        "source_lang": source_lang,
        "target_lang": target_lang,
        "accuracy": accuracy,
        "type": translation_type,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

    db = get_db()
    if db is not None:
        result = db[HISTORY_COLLECTION].insert_one({**record})
        record["_id"] = str(result.inserted_id)
    else:
        # Memory fallback
        record["_id"] = str(_next_id)
        _next_id += 1
        _memory_store.append({**record})

    return record


def get_history(limit: int = 50, skip: int = 0) -> list:
    """Retrieve translation history, newest first."""
    db = get_db()
    if db is not None:
        cursor = db[HISTORY_COLLECTION].find(
            {},
            {"_id": 1, "input_text": 1, "translated_text": 1,
             "source_lang": 1, "target_lang": 1, "accuracy": 1,
             "type": 1, "timestamp": 1}
        ).sort("timestamp", DESCENDING).skip(skip).limit(limit)

        results = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results
    else:
        # Memory fallback - return in reverse order
        start = skip
        end = skip + limit
        return list(reversed(_memory_store))[start:end]


def delete_history_item(item_id: str) -> bool:
    """Delete a single translation history record by ID."""
    db = get_db()
    if db is not None:
        try:
            result = db[HISTORY_COLLECTION].delete_one({"_id": ObjectId(item_id)})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Delete failed: {e}")
            return False
    else:
        # Memory fallback
        global _memory_store
        original_len = len(_memory_store)
        _memory_store = [r for r in _memory_store if r.get("_id") != item_id]
        return len(_memory_store) < original_len


def clear_all_history() -> int:
    """Delete all translation history records. Returns count deleted."""
    db = get_db()
    if db is not None:
        result = db[HISTORY_COLLECTION].delete_many({})
        return result.deleted_count
    else:
        global _memory_store
        count = len(_memory_store)
        _memory_store = []
        return count


def get_history_stats() -> dict:
    """Return statistics about stored translations."""
    db = get_db()
    if db is not None:
        total = db[HISTORY_COLLECTION].count_documents({})
        pipeline = [
            {"$group": {"_id": "$type", "count": {"$sum": 1}}}
        ]
        by_type = {doc["_id"]: doc["count"]
                   for doc in db[HISTORY_COLLECTION].aggregate(pipeline)}
        return {"total": total, "by_type": by_type, "storage": "mongodb"}
    else:
        by_type = {}
        for r in _memory_store:
            t = r.get("type", "text")
            by_type[t] = by_type.get(t, 0) + 1
        return {"total": len(_memory_store), "by_type": by_type, "storage": "memory"}
