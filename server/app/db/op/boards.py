from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.db import models
from app.util.json_response import error_json

def get_board_by_id(board_id: int, session: Session) -> models.Board:
    board_db = session.query(models.Board)\
            .filter(models.Board.id==board_id).first()
    if board_db is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error_json("Board with ID '"+str(board_id)+"' not found"))
    perms = board_db.permissions
    if len(perms) < 1:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_json("Authorization denied for the board with ID'"+str(board_id)+"'")
        )
    return board_db

def get_board_by_name(board_name: str, session: Session) -> models.Board:
    board_db = session.query(models.Board)\
            .filter(models.Board.name==board_name).first()
    if board_db is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error_json("Board with name '"+str(board_name)+"' not found"))
    return board_db

