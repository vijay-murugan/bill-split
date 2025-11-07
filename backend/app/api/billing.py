from fastapi import APIRouter, Depends

from ..core.auth import get_current_user

router = APIRouter(prefix="/billing")


@router.get("/bills")
async def bills_stub(current=Depends(get_current_user)):
    return {"message": "bills endpoint stub"}


@router.post("/bills/add")
async def add_bill_stub(current=Depends(get_current_user)):
    return {"message": "add bill stub"}


@router.get("/balances")
async def balances_stub(current=Depends(get_current_user)):
    return {"message": "balances endpoint stub"}
