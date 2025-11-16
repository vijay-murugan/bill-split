"""
Author  <Vijay Murugan>
This holds the functionality of all the user's network/friends related endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user

from ..data.friends_repo import add_friend_pair, get_friend_ids, user_exists
from ..schemas.friend_requests import FriendAddRequest

router = APIRouter(prefix="/friends")


@router.get("/get")
async def get_friends(current_user: dict = Depends(get_current_user)):
    """
    This function gets all the friends belonging to the current user.
    :param current_user:
    :return A list of friends belonging to the current user.:
    """
    email = current_user.get("claims", {}).get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Unauthorized")
    friend_ids = await get_friend_ids(email)
    return friend_ids or None


@router.post("/add")
async def add_friends(
    payload: FriendAddRequest, current_user: dict = Depends(get_current_user)
):
    """
    This endpoint adds all a new friend to the current user.
    :param payload:
    :param current_user:
    :return Updated list of friends belonging to the current user.:
    """
    current_email = current_user.get("claims", {}).get("email")
    target_email = payload.email

    if not current_email:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if target_email == current_email:
        raise HTTPException(status_code=400, detail="Cannot add yourself")

    if not await user_exists(target_email):
        raise HTTPException(status_code=404, detail="User not found")

    existing = set(await get_friend_ids(current_email))
    if target_email in existing:
        raise HTTPException(status_code=400, detail="User already added")

    updated_friends = await add_friend_pair(current_email, target_email)
    return updated_friends
