from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError, ExpiredSignatureError
from fastapi import HTTPException, status
from pydantic import ValidationError
import os
from app.consts import JWT_AUDIENCE, JWT_ISSUER, TOKEN_ALGORITHM
from app.db import schemas

pwd_context = CryptContext(schemes=["bcrypt"])
jwt_audience = os.getenv("JWT_AUDIENCE")

def get_password_hash(raw_password: str) -> str:
    return pwd_context.hash(raw_password)

def is_valid_password(raw_password: str, hashed_password) -> bool:
    return pwd_context.verify(raw_password, hashed_password)

def create_user_jwt(username: str, user_id:str, secret_key: str, expire_minutes: int) -> str:
    expire_by: datetime = datetime.utcnow() + timedelta(minutes=int(expire_minutes))
    access_token_payload = schemas.UserJWTContent(
        iss=JWT_ISSUER,
        aud=JWT_AUDIENCE,
        sub=username,
        exp=expire_by,
        user_id=user_id
    )
    token = jwt.encode(access_token_payload.dict(), secret_key, algorithm=TOKEN_ALGORITHM)
    return token

def decode_user_jwt(token: str, secret_key: str) -> schemas.UserJWTContent:
    try:
        payload: dict = jwt.decode(token, secret_key, audience=jwt_audience, algorithms=[TOKEN_ALGORITHM])
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        user_jwt_content: schemas.UserJWTContent = schemas.UserJWTContent.parse_obj(payload)
        if user_jwt_content.iss != JWT_ISSUER:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is issued by an unknown host.",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except ValidationError as err:
        raise err
    return user_jwt_content

