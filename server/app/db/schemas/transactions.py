from decimal import Decimal
from pydantic import BaseModel

class Transaction(BaseModel):
    id: int
    entry_id: int
    member_id: int
    amount: Decimal
    class Config:
        orm_mode = True

class TransactionCreatePayloadWithMember(BaseModel):
    member_id: int
    amount: Decimal

class TransactionUpdatePayload(BaseModel):
    amount: Decimal
