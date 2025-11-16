from typing import List

from pymongo import UpdateMany, UpdateOne

from app.db import friends_col, users_col


async def get_friend_ids(email):
    """
    This function gets the id of a friend given their email since it will be stored
    in the database.
    :param email:
    :return friend_ids:
    """
    user_friends_doc = await friends_col.find_one({"email": email})
    if not user_friends_doc:
        return []

    # extract friend ids and return friend documents (empty list if none)
    return user_friends_doc.get("friends", []) or []


async def user_exists(email: str) -> bool:
    return await users_col.find_one({"email": email}) is not None


async def add_friend_pair(current_email: str, target_email: str) -> List[str]:
    """
    Add each email to the other's friends set and return the updated
    friends list for the current user
    """
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
    return await get_friend_ids(current_email)
