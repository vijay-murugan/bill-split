from pymongo import UpdateOne

from ..db import bills_col, user_bills_col


async def find_user_bills(email: str):
    return await user_bills_col.find_one({"email": email})


async def find_bill_by_id(bill_id: str):
    return await bills_col.find_one({"_id": bill_id})


async def insert_bill(bill: dict):
    await bills_col.insert_one(bill)


async def bulk_update_user_bills(ops: list[UpdateOne]):
    if ops:
        await user_bills_col.bulk_write(ops)
