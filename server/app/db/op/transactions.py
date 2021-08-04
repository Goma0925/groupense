from sqlalchemy import schema
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.db import models, schemas
from app.util.json_response import error_json

def create_transaction_by_ids(entry_id: int, member_id:int, amount:float, session: Session)\
        -> models.Transaction:
    transaction_db = models.Transaction(
        entry_id=entry_id,
        member_id=member_id,
        amount=amount
    )
    session.add(transaction_db)
    session.commit()
    session.refresh(transaction_db)
    return transaction_db

def delete_transaction_by_ids(entry_id: int, transaction_id: int, session: Session) -> None:
    transaction_db: models.Transaction = session.query(models.Transaction) \
        .join(models.Entry) \
        .filter(models.Transaction.entry_id==entry_id) \
        .filter(models.Transaction.id==transaction_id).first()
    if transaction_db is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_json("Entry with ID '"+str(entry_id)+"' does not have Transaction with ID '"+str(transaction_id)+"'")
        )
    session.delete(transaction_db)
    session.commit()
    return

def update_transaction_by_ids(transaction_id: int, payload:schemas.TransactionUpdatePayload, session: Session) -> models.Transaction:
    transaction_db: models.Transaction = session.query(models.Transaction) \
        .filter(models.Transaction.id==transaction_id).first()
    if transaction_db is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_json("Transaction with ID '"+str(transaction_id)+"' does not exist.")
        )
    for attr, value in payload.dict().items():
        setattr(transaction_db, attr, value)
    session.commit()
    session.refresh(transaction_db)
    return transaction_db