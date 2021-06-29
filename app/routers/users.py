import os
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi import status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth.middleware import get_user
from app.db.middleware import get_session
from app.db import schemas
from app.db import models
from app.auth import util as auth_util
import app.db.op as op
from app.routers.consts import USER_ENDPOINT_PATH, TOKEN_ENDPOINT_PATH
from app.util.json_response import error_json

router = APIRouter(
    prefix=USER_ENDPOINT_PATH,
    tags=["users"],
    responses={404: {"description": "Resource not found"}}
)

DEFAULT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("DEFAULT_ACCESS_TOKEN_EXPIRE_MINUTES"))

@router.post("/signup", response_model=schemas.User)
def signup(payload: schemas.UserSignupPayload, session: Session=Depends(get_session)):
    # Check if the same username exists
    db_existing_user: models.User = session.query(models.User).filter(models.User.name == payload.username).first()
    if db_existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=error_json("Username '" + payload.username + "' is already taken."))
    db_user = models.User(name=payload.username, hashed_password=auth_util.get_password_hash(payload.password))
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@router.post(TOKEN_ENDPOINT_PATH, response_model=schemas.UserJWTPayload)
def login(payload: OAuth2PasswordRequestForm = Depends(), session: Session=Depends(get_session)):
    db_user: models.User = op.users.get_user_by_name(payload.username, session)
    if not auth_util.is_valid_password(payload.password, db_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error_json("Password is incorrect"))

    expire_by: datetime = datetime.utcnow() + timedelta(minutes=DEFAULT_ACCESS_TOKEN_EXPIRE_MINUTES)
    user_token_payload = schemas.UserJWTContent(
        iss=os.getenv("JWT_ISSUER"),
        aud=os.getenv("JWT_AUDIENCE"),
        sub=db_user.name,
        exp=expire_by,
    )
    return schemas.UserJWTPayload(
        access_token=auth_util.create_access_jwt(user_token_payload),
        token_type="bearer"
    )

@router.get("/test")
def test_auth_access(user: str = Depends(get_user)):
    return user
