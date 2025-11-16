from datetime import datetime
from uuid import uuid4

from pymongo import UpdateOne

from ..core.exceptions import DomainError, NotFoundError
from ..data.billing_repo import (
    bulk_update_user_bills,
    find_bill_by_id,
    find_user_bills,
    insert_bill,
)
from ..schemas.bill_create import BillCreate


async def get_bills_for_email(email: str):
    user_doc = await find_user_bills(email)
    if not user_doc:
        return {"email": email, "bills": []}

    bills = user_doc.get("bills", [])
    bill_map = {}
    result = []
    for bill in bills:
        bid = bill.get("bill_id")
        result.append(
            {
                "bill_id": bid,
                "amount": bill.get("total"),
                "title": bill_map.get(bid, {}).get("title"),
            }
        )
    return {"bills": result}


async def get_bill_by_id_service(bill_id: str):
    bill = await find_bill_by_id(bill_id)
    if not bill:
        raise NotFoundError("Bill not found")
    return bill


async def create_bill_service(payload: BillCreate):
    if not payload:
        raise DomainError("Invalid payload")
    bill_id = str(uuid4())
    bill = payload.model_dump(by_alias=True, exclude_unset=True)
    bill["_id"] = bill_id
    bill["created_at"] = datetime.utcnow().isoformat()

    await insert_bill(bill)

    ops: list[UpdateOne] = []
    for user in bill.get("bill_users", []):
        user_key = user.get("id") or user.get("email")
        amount = user.get("amount_due", 0)
        user_doc_id = str(uuid4())
        entry = {
            "entry_id": str(uuid4()),
            "bill_id": bill_id,
            "total": float(amount),
            "created_at": datetime.utcnow().isoformat(),
        }
        ops.append(
            UpdateOne(
                {"email": user_key},
                {
                    "$setOnInsert": {"_id": user_doc_id, "email": user_key},
                    "$push": {"bills": entry},
                },
                upsert=True,
            )
        )
    await bulk_update_user_bills(ops)
    return HTTPStatus.OK
