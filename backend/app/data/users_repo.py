from typing import Dict, Optional
from uuid import uuid4

from ..db import friends_col, users_col


async def find_user_by_id(user_id: str) -> Optional[Dict]:
    """Return user document or None."""
    return await users_col.find_one({"_id": user_id})


async def create_or_update_user(uid: str, doc: Dict) -> Dict:
    """Upsert user document and return stored document."""
    await users_col.update_one({"_id": uid}, {"$set": doc}, upsert=True)
    stored = await users_col.find_one({"_id": uid})
    return stored


async def update_user(user_id: str, update_doc: Dict) -> Optional[Dict]:
    """Apply partial update and return stored document (or None if not found)."""
    await users_col.update_one({"_id": user_id}, {"$set": update_doc})
    return await users_col.find_one({"_id": user_id})


async def ensure_friend_doc_for_email(email: str) -> None:
    """Ensure a friends document exists for a given email."""
    if not email:
        return
    await friends_col.update_one(
        {"email": email},
        {"$setOnInsert": {"_id": str(uuid4()), "email": email, "friends": []}},
        upsert=True,
    )
