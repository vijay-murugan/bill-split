from fastapi import APIRouter, Depends, HTTPException, status
from ..schemas.user import NewUser, User
from ..core.auth import get_current_user
from ..db import users_col

router = APIRouter(prefix="/users")

@router.post("/create", response_model=User)
async def create_user(payload: NewUser, current=Depends(get_current_user)):
    uid = current["uid"]
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
async def read_users_me(user_id: str, current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/friends")
async def friends_stub(current=Depends(get_current_user)):
    return {"message": "friends endpoint stub"}