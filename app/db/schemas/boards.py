from pydantic import BaseModel
from .entries import Entry
from .members import Member

class Board(BaseModel):
    name:str
    id:int
    access_key:str
    members:list[Member]
    entries: list[Entry]
    class Config:
        orm_mode = True

class BoardCreatePayload(BaseModel):
    name:str
    access_key:str

class BoardUpdatePayload(BaseModel):
    name:str
    access_key:str

