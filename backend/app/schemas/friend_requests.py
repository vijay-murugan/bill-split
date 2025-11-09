from pydantic import BaseModel, EmailStr


class FriendAddRequest(BaseModel):
    email: EmailStr
