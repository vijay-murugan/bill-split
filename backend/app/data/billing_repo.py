from pymongo import UpdateOne

from ..db import bills_col, user_bills_col


async def find_user_bills(email: str):
    """
    Find all user's bills.
    :param email:
    :return list of user_bills:
    """
    return await user_bills_col.find_one({"email": email})


async def find_bill_by_id(bill_id: str):
    """
    Find a bill.
    :param bill_id:
    :return bill corresponding to the id:
    """
    return await bills_col.find_one({"_id": bill_id})


async def insert_bill(bill: dict):
    """
    Insert a bill.
    :param bill:
    :return:
    """
    await bills_col.insert_one(bill)


async def bulk_update_user_bills(ops: list[UpdateOne]):
    """
    Update user's bills.
    :param ops:
    :return:
    """
    if ops:
        await user_bills_col.bulk_write(ops)
