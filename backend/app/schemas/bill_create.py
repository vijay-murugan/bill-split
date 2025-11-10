from typing import Dict, List

from pydantic import BaseModel, EmailStr, Field

from .item import Item
from .user import BillUser


class BillCreate(BaseModel):
    title: str = ""
    items: List[Item]
    tax_percent: float
    discount_percent: float
    subtotal: float
    tax_amount: float
    discount_amount: float
    total: float
    splits: Dict[EmailStr, float]
    bill_users: List[BillUser]

    model_config = {"populate_by_name": True}
