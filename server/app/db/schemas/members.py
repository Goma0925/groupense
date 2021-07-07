from pydantic import BaseModel

class Member(BaseModel):
    id: int
    name: str
    board_id:int
    class Config:
        orm_mode = True

class MemberCreatePayload(BaseModel):
    name: str

class MemberUpdatePayload(BaseModel):
    name: str

