"""
Author <Vijay Murugan>
This handles the user related operations here
"""

import logging

from fastapi import APIRouter, Body, Depends, HTTPException, status

from ..core.auth import get_current_user
from ..schemas.user import NewUser, User
from ..services import users_service

router = APIRouter(prefix="/users")


@router.post("/create", response_model=User)
async def create_user(payload: NewUser, current=Depends(get_current_user)):
    """
    Create a new user
    :param payload:
    :param current:
    :return new user created:
    """
    uid = current.get("uid")
    logging.info("Creating/updating user %s", uid)
    try:
        stored = await users_service.create_user_service(uid, payload)
    except DomainError as e:
        raise HTTPException(status_code=401, detail=str(e))
    return User(
        id=stored.get("_id"),
        display_name=stored.get("display_name"),
        email=stored.get("email"),
        phone_number=stored.get("phone_number"),
    )


@router.get("/{user_id}", response_model=User)
async def read_user(user_id: str, current=Depends(get_current_user)):
    """
    Retrieve a user
    :param user_id:
    :param current:
    :return the retrieved user:
    """
    try:
        user = await users_service.get_user_service(user_id)
    except NotFoundError:
        raise HTTPException(status_code=404, detail="User not found")
    return User(
        id=user.get("_id"),
        display_name=user.get("display_name"),
        email=user.get("email"),
        phone_number=user.get("phone_number"),
    )


@router.put("/{user_id}", response_model=User)
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
    current=Depends(get_current_user),
):
    """
    Update a user
    :param user_id:
    :param payload:
    :param current:
    :return updated user:
    """
    requester_uid = current.get("uid")
    try:
        stored = await users_service.update_user_service(
            requester_uid, user_id, payload
        )
    except DomainError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except NotFoundError:
        raise HTTPException(status_code=404, detail="User not found")

    return User(
        id=stored.get("_id"),
        display_name=stored.get("display_name"),
        email=stored.get("email"),
        phone_number=stored.get("phone_number"),
    )
