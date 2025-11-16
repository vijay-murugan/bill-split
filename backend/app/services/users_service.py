from typing import Dict

from pydantic import EmailStr

from ..core.exceptions import DomainError, NotFoundError
from ..data import users_repo
from ..schemas.user import NewUser


async def create_user_service(uid: str, payload: NewUser) -> Dict:
    """
    Create or update a user. Ensures a friends doc if email provided.
    Raises DomainError if uid missing.
    """
    if not uid:
        raise DomainError("Unauthorized")

    doc = payload.model_dump(by_alias=True, exclude_unset=True)
    stored = await users_repo.create_or_update_user(uid, doc)

    email = doc.get("email")
    # ensure friends doc (cast EmailStr to str if necessary)
    if email:
        if isinstance(email, EmailStr):
            email = str(email)
        await users_repo.ensure_friend_doc_for_email(email)

    return stored


async def get_user_service(user_id: str) -> Dict:
    """Return user document or raise NotFoundError."""
    user = await users_repo.find_user_by_id(user_id)
    if not user:
        raise NotFoundError("User not found")
    return user


async def update_user_service(
    requester_uid: str, user_id: str, payload: NewUser
) -> Dict:
    """
    Validate and apply update. Raises DomainError or NotFoundError.
    """
    if requester_uid != user_id:
        raise DomainError("Not authorized to update this user")

    existing = await users_repo.find_user_by_id(user_id)
    if not existing:
        raise NotFoundError("User not found")

    update_doc = payload.model_dump(by_alias=True, exclude_unset=True)
    if update_doc:
        # if email present, ensure friends doc for that email
        email = update_doc.get("email")
        if email and isinstance(email, EmailStr):
            update_doc["email"] = str(email)
        await users_repo.update_user(user_id, update_doc)

    stored = await users_repo.find_user_by_id(user_id)
    return stored
