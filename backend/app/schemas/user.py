from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class NewUser(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None
    phone_number: Optional[str] = None


class User(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None
    id: str = Field(..., alias="_id")
    phone_number: Optional[str] = None

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }
