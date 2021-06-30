from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db import schemas, models
from app.db.middleware import get_session
from app.auth import util as auth_util
from app.routers.consts import API_ROOT_PATH, USER_ENDPOINT_PATH, TOKEN_ENDPOINT_PATH

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=API_ROOT_PATH + USER_ENDPOINT_PATH + TOKEN_ENDPOINT_PATH)

def get_user(token: str = Depends(oauth2_scheme), session: Session=Depends(get_session))\
        -> models.User:
    print("Pass")
    jwt_content:schemas.UserJWTContent = auth_util.decode_access_jwt(token)
    username = jwt_content.sub
    user: models.User = session.query(models.User).filter(models.User.name==username).first()
    return user

