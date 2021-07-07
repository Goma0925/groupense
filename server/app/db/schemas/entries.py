from pydantic import BaseModel

class Entry(BaseModel):
    id: int
    board_id: int
    name: str
    class Config:
        orm_mode = True

class EntryCreatePayload(BaseModel):
    name: str

class EntryUpdatePayload(BaseModel):
    name: str



