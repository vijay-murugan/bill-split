"""
Author  <Vijay Murugan>
This holds the functionality of all the user's network/friends related endpoints.
"""

from fastapi import APIRouter, Depends
from pymongo import UpdateMany, UpdateOne

from app.core.auth import get_current_user

from ..db import friends_col, users_col
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
    friend_ids = await get_friend_ids(email)
    return friend_ids if friend_ids else None


async def get_friend_ids(email):
    """
    This function gets the id of a friend given their email since it will be stored
    in the database.
    :param email:
    :return:
    """
    user_friends_doc = await friends_col.find_one({"email": email})
    if not user_friends_doc:
        return None

    # extract friend ids and return friend documents (empty list if none)
    return user_friends_doc.get("friends", []) or []


@router.post("/add")
async def add_friends(
    payload: FriendAddRequest, current_user: dict = Depends(get_current_user)
):
    """
    This function adds all a new friend to the current user.
    :param payload:
    :param current_user:
    :return Updated list of friends belonging to the current user.:
    """
    current_email = current_user.get("claims", {}).get("email")
    target_email = payload.email
    if target_email == current_email:
        return {"message": "Cannot be the same email"}
    friends = set(await get_friend_ids(current_email))

    if target_email in friends:
        return {"message": "User already added"}
    target_user = await users_col.find_one({"email": target_email})

    if not target_user:
        return {"message": "User not found"}

    target_friends = set(await get_friend_ids(target_email))
    target_friends.add(current_email)

    ops = [
        UpdateOne(
            {"email": current_email},
            {"$addToSet": {"friends": target_email}},
            upsert=True,
        ),
        UpdateOne(
            {"email": target_email},
            {"$addToSet": {"friends": current_email}},
            upsert=True,
        ),
    ]
    await friends_col.bulk_write(ops)
    updated_friends = await get_friend_ids(current_email)
    return updated_friends
