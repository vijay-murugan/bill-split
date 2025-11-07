from typing import Optional

from pydantic import BaseModel, EmailStr


class NewUser(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None
    phone_number: Optional[str] = None


class User(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None
    id: str
    phone_number: Optional[str] = None
