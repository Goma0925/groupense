from pydantic import BaseModel

class Transaction(BaseModel):
    id: int
    entry_id: int
    member_id: int
    amount: float
    class Config:
        orm_mode = True

class TransactionCreatePayloadWithMember(BaseModel):
    member_id: int
    amount: float

class TransactionUpdatePayload(BaseModel):
    amount: float
