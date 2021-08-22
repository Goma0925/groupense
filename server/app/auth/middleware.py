import os
from typing import Optional
from fastapi import Depends, Response, status
from fastapi.exceptions import HTTPException
from fastapi.params import Cookie
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from starlette.requests import Request
from app.consts import ACCESS_JWT_SECRET_KEY, REFRESH_JWT_SECRET_KEY

from app.db import schemas, models
from app.db.middleware import get_session
from app.auth import util as auth_util
from app.api_routers.consts import API_ROOT_PATH, USER_ENDPOINT_PATH, TOKEN_ENDPOINT_PATH
from app.util.json_response import error_json

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=API_ROOT_PATH + USER_ENDPOINT_PATH + TOKEN_ENDPOINT_PATH)

def get_user(token: str = Depends(oauth2_scheme), session: Session=Depends(get_session))\
        -> models.User:
    jwt_content:schemas.UserJWTContent = auth_util.decode_user_jwt(token, ACCESS_JWT_SECRET_KEY)
    username = jwt_content.sub
    user: models.User = session.query(models.User).filter(models.User.name==username).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error_json('Access token required.'))
    return user

def verify_refresh_token(refresh_token: Optional[str] = Cookie(None), session=Depends(get_session)) \
        -> models.User:
    # Decode access token to check if it is valid. The function will raise error if the token is invalid.
    if refresh_token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error_json('Refresh token is required to be set in cookie with name "refresh_token".'))
    jwt_content:schemas.UserJWTContent = auth_util.decode_user_jwt(refresh_token, REFRESH_JWT_SECRET_KEY)
    username = jwt_content.sub
    user: models.User = session.query(models.User).filter(models.User.name==username).first()
    return user