from fastapi import APIRouter, Depends, HTTPException
from fastapi import status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app.auth.middleware import verify_refresh_token
from app.consts import ACCESS_JWT_SECRET_KEY, DEFAULT_ACCESS_TOKEN_EXPIRE_MINUTES, DEFAULT_REFRESH_TOKEN_EXPIRE_MINUTES, REFRESH_JWT_SECRET_KEY
from app.db.middleware import get_session
from app.db import schemas
from app.db import models
from app.auth import util as auth_util
import app.db.op as op
from app.api_routers.consts import USER_ENDPOINT_PATH, TOKEN_ENDPOINT_PATH
from app.util.json_response import error_json

router = APIRouter(
    prefix=USER_ENDPOINT_PATH,
    tags=["users"],
    responses={404: {"description": "Resource not found"}}
)

@router.post("/signup", response_model=schemas.User)
def signup(payload: schemas.UserSignupPayload, session: Session=Depends(get_session)):
    # Check if the same username exists
    db_existing_user: models.User = session.query(models.User).filter(models.User.name == payload.username).first()
    if db_existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=error_json("Username '" + payload.username + "' is already taken."))
    user_db = models.User(name=payload.username, hashed_password=auth_util.get_password_hash(payload.password))
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
    return user_db

@router.post(TOKEN_ENDPOINT_PATH, response_model=schemas.AuthorizedUserJWTPayload)
def login(payload: OAuth2PasswordRequestForm = Depends(), session: Session=Depends(get_session)):
    user_db: models.User = op.users.get_user_by_name(payload.username, session)
    if not auth_util.is_valid_password(payload.password, user_db.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error_json("Password is incorrect"))
    # Set the refresh token in the HTTP only cookie
    refresh_token: str = auth_util.create_user_jwt(user_db.name, user_db.id, REFRESH_JWT_SECRET_KEY, DEFAULT_REFRESH_TOKEN_EXPIRE_MINUTES)
    response = JSONResponse(
        content=schemas.AuthorizedUserJWTPayload(
            id=user_db.id,
            name=user_db.name,
            access_token=auth_util.create_user_jwt(user_db.name, user_db.id, ACCESS_JWT_SECRET_KEY, DEFAULT_ACCESS_TOKEN_EXPIRE_MINUTES),
            token_type="bearer",
            refresh_token="Sent in HTTPOnly cookie"
        ).dict()
    )
    response.set_cookie(key="refresh_token", value=refresh_token)
    return response

@router.get("/refresh-auth-token")
def refresh_access_token(user: schemas.User = Depends(verify_refresh_token)):
    return schemas.AuthorizedUserJWTPayload(
        id=user.id,
        name=user.name,
        access_token=auth_util.create_user_jwt(user.name, user.id, ACCESS_JWT_SECRET_KEY, DEFAULT_ACCESS_TOKEN_EXPIRE_MINUTES),
        token_type="bearer",
        refresh_token="Sent in HTTPOnly cookie"
    )
