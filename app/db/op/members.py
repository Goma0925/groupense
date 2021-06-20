from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.db import models
from app.util.json_response import error_json

def get_all_members_by_board_id(board_id: int, session: Session)\
        -> list[models.Member]:
    db_board:models.Board = session.query(models.Board)\
        .filter(models.Board.id==board_id)\
        .first()
    if db_board is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error_json("Resource not found"))
    db_members = db_board.members
    return db_members

def get_member_by_ids(board_id: int, member_id: int, session: Session)\
        -> models.Member:
    db_member: models.Member = \
        session.query(models.Member) \
            .join(models.Board) \
            .filter(models.Member.id == member_id) \
            .filter(models.Board.id == board_id).first()
    if db_member is None:
        raise HTTPException(
            status_code=404,
            detail=error_json("Member with board_id '"+str(board_id) +
                              "' and member_id '"+str(member_id)+"' not found"))
    return db_member
