from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.db import models
from app.util.json_response import error_json

def check_authorization_by_board_id(board_id: int, user_id: int, session: Session) -> models.Board:
    board: models.Board =\
        session.query(models.Permission) \
        .filter(models.Permission.board_id==board_id) \
        .filter(models.Permission.user_id==user_id).first()
    if not board:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_json("Authorization denied for the board with ID '"+str(board_id)+"'")
        )
    return board


