"""
@Author  <Vijay Murugan>
This holds the functionality of all the billing related endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException

from ..core.auth import get_current_user
from ..core.exceptions import NotFoundError
from ..schemas.bill_create import BillCreate
from ..services.billing_service import (
    create_bill_service,
    get_bill_by_id_service,
    get_bills_for_email,
)

router = APIRouter(prefix="/billing")


@router.get("/get")
async def bills(current_user=Depends(get_current_user)):
    """
    This endpoint will fetch all the bills related to the current user
    :param current_user:
    :return: A list of Bill objects  (a list of dictionary)
    """
    email = current_user.get("claims", {}).get("email")
    return await get_bills_for_email(email)


@router.get("/get/{id}")
async def bill_by_id(id: str, current=Depends(get_current_user)):
    """
    This endpoint will fetch a bill by its id
    :param id:
    :param current:
    :return: A single bill corresponding to the given id
    """
    try:
        return await get_bill_by_id_service(id)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/add")
async def add_bill(payload: BillCreate, current=Depends(get_current_user)):
    """
    This endpoint will add a bill to the current user
    :param payload:
    :param current:
    :return 200 status code:
    """
    try:
        return await create_bill_service(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/balances")
async def balances(current=Depends(get_current_user)):
    """
    This endpoint will fetch all the balances
    :param current:
    :return the balance due:
    """
    return {"message": "balances endpoint stub"}
