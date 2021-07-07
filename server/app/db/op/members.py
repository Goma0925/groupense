from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.db import models
from app.util.json_response import error_json
from app.db import op

def get_all_members_by_board_id(board_id: int, session: Session)\
        -> list[models.Member]:
    db_board:models.Board = op.boards.get_board_by_id(board_id, session)
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
