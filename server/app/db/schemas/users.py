from datetime import datetime

from pydantic import BaseModel


class User(BaseModel):
    id: int
    name:str
    class Config:
        orm_mode = True

class UserSignupPayload(BaseModel):
    username: str
    password: str

class UserJWTContent(BaseModel):
    iss: str
    aud: str
    sub: str
    exp: datetime

class AuthorizedUserJWTPayload(User):
    access_token: str
    token_type: str

class AuthTokenValidity(BaseModel):
    valid: bool
    