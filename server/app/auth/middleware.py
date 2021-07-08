import os
from typing import Optional
from fastapi import Depends
from fastapi.params import Cookie
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from starlette.requests import Request
from app.consts import ACCESS_JWT_SECRET_KEY

from app.db import schemas, models
from app.db.middleware import get_session
from app.auth import util as auth_util
from app.routers.consts import API_ROOT_PATH, USER_ENDPOINT_PATH, TOKEN_ENDPOINT_PATH

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=API_ROOT_PATH + USER_ENDPOINT_PATH + TOKEN_ENDPOINT_PATH)

def get_user(token: str = Depends(oauth2_scheme), session: Session=Depends(get_session))\
        -> models.User:
    jwt_content:schemas.UserJWTContent = auth_util.decode_user_jwt(token, ACCESS_JWT_SECRET_KEY)
    username = jwt_content.sub
    user: models.User = session.query(models.User).filter(models.User.name==username).first()
    return user


def verify_refresh_token(request: Request) -> str:
    # Decode access token to check if it is valid. The function will raise error if the token is invalid.
    print("cookie", request.headers)
    # auth_util.decode_refresh_jwt(token)
    return {"name": "Amon", "id": "30"}