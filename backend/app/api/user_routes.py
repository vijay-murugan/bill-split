import logging

from fastapi import APIRouter, Body, Depends, HTTPException, status

from ..core.auth import get_current_user
from ..db import users_col
from ..schemas.user import NewUser, User

router = APIRouter(prefix="/users")


@router.post("/create", response_model=User)
async def create_user(payload: NewUser, current=Depends(get_current_user)):
    uid = current["uid"]
    logging.info("Creating new user %s", uid)
    doc = payload.model_dump(by_alias=True, exclude_unset=True)
    await users_col.update_one({"_id": uid}, {"$set": doc}, upsert=True)
    stored = await users_col.find_one({"_id": uid})
    return User(
        id=stored["_id"],
        display_name=stored.get("display_name"),
        email=stored.get("email"),
        phone_number=stored.get("phone_number"),
    )


@router.get("/{user_id}", response_model=User)
async def read_user(user_id: str, current_user: User = Depends(get_current_user)):
    return current_user


@router.put(
    "/{user_id}",
    response_model=User,
    summary="Update a user by id (current user only)",
    responses={
        400: {"description": "Bad request"},
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
        404: {"description": "Not found"},
    },
)
async def update_user(
    user_id: str,
    payload: NewUser = Body(
        ...,
        example={
            "display_name": "Alice Updated",
            "email": "alice@example.com",
            "phone_number": "+123456789",
        },
    ),
    current_user: User = Depends(get_current_user),
):
    if current_user["uid"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user",
        )
    existing = await users_col.find_one({"_id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")

    doc = await users_col.find_one({"_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")
    update_doc = payload.model_dump(by_alias=True, exclude_unset=True)
    if update_doc:
        await users_col.update_one({"_id": user_id}, {"$set": update_doc})
    stored = await users_col.find_one({"_id": user_id})
    return User(
        id=stored["_id"],
        display_name=stored.get("display_name"),
        email=stored.get("email"),
        phone_number=stored.get("phone_number"),
    )


@router.get(
    "/friends",
    summary="Friends endpoint stub",
    responses={200: {"description": "Stub response"}},
)
async def friends_stub(current=Depends(get_current_user)):
    return {"message": "friends endpoint stub"}
