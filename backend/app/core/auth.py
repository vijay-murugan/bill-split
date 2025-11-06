from fastapi import Header, HTTPException, status, Depends
from .firebase import init_firebase, verify_id_token
from ..db import users_col
from typing import Dict, Any

init_firebase()


async def get_current_user(authorization: str = Header(...)) -> Dict[str, Any]:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth header")
    token = authorization.split(" ", 1)[1].strip()
    try:
        decoded = verify_id_token(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    uid = decoded.get("uid")
    if not uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    existing = await users_col.find_one({"_id": uid})
    if not existing:
        doc = {
            "_id": uid,
            "displayName": decoded.get("name"),
            "email": decoded.get("email"),
            "phoneNumber": decoded.get("phone_number"),
            "createdAt": decoded.get("iat"),
        }
        await users_col.insert_one(doc)
        existing = doc
    return {"uid": uid, "claims": decoded, "user_doc": existing}
