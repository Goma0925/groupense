from passlib.context import CryptContext
from jose import jwt, JWTError, ExpiredSignatureError
from fastapi import HTTPException, status
from pydantic import ValidationError
import os
from app.db import schemas

pwd_context = CryptContext(schemes=["bcrypt"])
jwt_audience = os.getenv("JWT_AUDIENCE")

# JWT settings
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
TOKEN_ALGORITHM = "HS256"
DEFAULT_ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("DEFAULT_ACCESS_TOKEN_EXPIRE_MINUTES")

JWT_ISSUER = os.getenv("JWT_ISSUER")

def get_password_hash(raw_password: str) -> str:
    return pwd_context.hash(raw_password)

def is_valid_password(raw_password: str, hashed_password) -> bool:
    return pwd_context.verify(raw_password, hashed_password)

def create_access_jwt(data: schemas.UserJWTContent) -> str:
    return jwt.encode(data.dict(), JWT_SECRET_KEY, algorithm=TOKEN_ALGORITHM)

def decode_access_jwt(token: str) -> schemas.UserJWTContent:
    try:
        payload: dict = jwt.decode(token, JWT_SECRET_KEY, audience=jwt_audience, algorithms=[TOKEN_ALGORITHM])
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
