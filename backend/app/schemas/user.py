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


from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class BillUser(BaseModel):
    id: EmailStr
    email: EmailStr
    display_name: str
    phone_number: Optional[str] = None
    assigned_item_ids: List[str]
    amount_due: float

    model_config = {"populate_by_name": True}
