from typing import Any, Dict

from fastapi import Body, Depends, Header, HTTPException, status

from ..db import users_col
from ..schemas.user import NewUser
from .firebase import init_firebase, verify_id_token

init_firebase()


async def get_current_user(
    payload: NewUser | None = Body(None), authorization: str = Header(...)
) -> Dict[str, Any]:
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth header"
        )
    token = authorization.split(" ", 1)[1].strip()
    try:
        claims = verify_id_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    return {"uid": claims["uid"], "claims": claims}
