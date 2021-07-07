from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.db import models
from app.util.json_response import error_json

def create_transaction_by_ids(entry_id: int, member_id:int, amount:float, session: Session)\
        -> models.Transaction:
    db_transaction = models.Transaction(
        entry_id=entry_id,
        member_id=member_id,
        amount=amount
    )
    session.add(db_transaction)
    session.commit()
    session.refresh(db_transaction)
    return db_transaction

def delete_transaction_by_ids(entry_id: int, transaction_id: int, session: Session) -> None:
    db_transaction: models.Transaction = session.query(models.Transaction) \
        .join(models.Entry) \
        .filter(models.Transaction.entry_id==entry_id) \
        .filter(models.Transaction.id==transaction_id).first()
    if db_transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_json("Entry with ID '"+str(entry_id)+"' does not have Transaction with ID '"+str(transaction_id)+"'")
        )
    session.delete(db_transaction)
    session.commit()
    return
