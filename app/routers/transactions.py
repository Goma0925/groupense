from fastapi import APIRouter, Depends, HTTPException
from fastapi import Response, status
from sqlalchemy.orm import Session

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
        board_id:int, entry_id:int, session:Session=Depends(get_session)
        ) -> list[models.Transaction]:
    db_entry: models.Entry = op.entries.get_entry_by_ids(board_id, entry_id, session)
    return db_entry.transactions

@router.post("/boards/{board_id}/entries/{entry_id}/transactions", response_model=schemas.Transaction)
def create_transaction(
        board_id: int, entry_id:int,
        payload: schemas.TransactionCreatePayloadWithMember,
        session: Session = Depends(get_session)
        ) -> models.Transaction:
    # Check the parent resources are valid
    db_entry:models.Entry = op.entries.get_entry_by_ids(board_id, entry_id, session)
    db_member:models.Member = op.members.get_member_by_ids(board_id, payload.member_id, session)
    # Create a transaction
    db_transaction: models.Transaction = op.transactions.create_transaction_by_ids(
        entry_id=db_entry.id,
        member_id=db_member.id,
        amount=payload.amount,
        session=session
    )
    return db_transaction

@router.delete("/boards/{board_id}/entries/{entry_id}/transactions/{transaction_id}")
def delete_transaction(
        board_id: int, entry_id: int, transaction_id: int, session: Session=Depends(get_session)
        ) -> Response:
    db_entry:models.Entry = op.entries.get_entry_by_ids(board_id, entry_id, session)
    op.transactions.delete_transaction_by_ids(
        entry_id=db_entry.id,
        transaction_id=transaction_id,
        session=session
    )
    return Response(status_code=status.HTTP_200_OK)
