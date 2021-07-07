from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.db import models
from app.util.json_response import error_json

def get_user_by_name(username: str, session: Session):
    db_user: models.User = session.query(models.User).filter(models.User.name == username).first()
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error_json("User does not exist"))
    return db_user
