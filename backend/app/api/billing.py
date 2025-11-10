from datetime import datetime
from http.client import HTTPException
from uuid import uuid4

from fastapi import APIRouter, Depends
from pymongo import UpdateOne

from ..core.auth import get_current_user
from ..db import bills_col, user_bills_col
from ..schemas.bill_create import BillCreate

router = APIRouter(prefix="/billing")


@router.get("/get")
async def bills(current_user=Depends(get_current_user)):
    email = current_user.get("claims", {}).get("email")

    user_doc = await user_bills_col.find_one({"email": email})
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


@router.get("/get/{id}")
async def bill_by_id(id: str, current=Depends(get_current_user)):
    bill = await bills_col.find_one({"_id": id})
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill


@router.post("/add")
async def add_bill(payload: BillCreate, current=Depends(get_current_user)):
    bill_id = str(uuid4())
    bill = payload.model_dump(by_alias=True, exclude_unset=True)
    bill["_id"] = bill_id
    bill["created_at"] = datetime.utcnow().isoformat()
    await bills_col.insert_one(bill)
    ops = []
    for user in bill.get("bill_users", []):
        user_key = user.get("id") or user.get("email")
        amount = user.get("amount_due")
        user_doc_id = str(uuid4())
        entry = {
            "entry_id": str(uuid4()),  # unique id for this pushed bill entry
            "bill_id": bill_id,  # existing bill id (string)
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
    if ops:
        await user_bills_col.bulk_write(ops)

    return {"_id": bill_id, "created_at": bill["created_at"]}


@router.get("/balances")
async def balances(current=Depends(get_current_user)):
    return {"message": "balances endpoint stub"}
