from pydantic import BaseModel

class Permission(BaseModel):
    id: int
    user_id: int
    board_id: int
    is_owner: bool
    class Config:
        orm_mode = True

class PermissionCreate(BaseModel):
    user_id: int
    board_id: int
    is_owner: bool
