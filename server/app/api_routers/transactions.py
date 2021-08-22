from fastapi import APIRouter, Depends, HTTPException
from fastapi import Response, status
from sqlalchemy.orm import Session

from app.auth.middleware import get_user
from app.db.middleware import get_session
from app.db import schemas
from app.db import models
import app.db.op as op

router = APIRouter(
    prefix="",
    tags=["transactions"],
    responses={404: {"description": "Resource not found"}}
)

@router.get("/boards/{board_id}/entries/{entry_id}/transactions", response_model=list[schemas.Transaction])
def get_all_transactions(
        board_id:int, entry_id:int, user: models.User=Depends(get_user),
        session:Session=Depends(get_session)
        ) -> list[models.Transaction]:
    op.permissions.check_authorization_by_board_id(board_id, user.id, session)
    entry_db: models.Entry = op.entries.get_entry_by_ids(board_id, entry_id, session)
    return entry_db.transactions

@router.put("/boards/{board_id}/entries/{entry_id}/members/{member_id}/transactions", response_model=schemas.Transaction)
def create_or_update_transaction(
        board_id: int, entry_id: int, member_id, payload: schemas.TransactionUpdatePayload,
        user: models.User=Depends(get_user),
        session:Session=Depends(get_session)
    ) -> models.Transaction:
    op.permissions.check_authorization_by_board_id(board_id, user.id, session)
    transaction_db = models.Entry = op.transactions.create_or_update_transaction_by_ids(
        board_id, entry_id, member_id, payload, session)
    return transaction_db