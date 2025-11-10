from typing import List

from pydantic import BaseModel, EmailStr, Field


class Item(BaseModel):
    id: str
    name: str
    quantity: int = Field(..., ge=1)
    price: float = Field(..., ge=0)
    total_price: float = Field(..., alias="totalPrice", ge=0)
    bill_user_ids: List[EmailStr] = Field(..., alias="billUserIds")

    model_config = {"populate_by_name": True}
