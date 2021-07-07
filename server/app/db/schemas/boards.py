from pydantic import BaseModel
from .entries import Entry
from .members import Member

class Board(BaseModel):
    name:str
    id:int
    members:list[Member]
    entries: list[Entry]
    class Config:
        orm_mode = True

class BoardCreatePayload(BaseModel):
    name:str

class BoardUpdatePayload(BaseModel):
    name:str

