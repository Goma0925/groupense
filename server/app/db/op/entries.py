from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.db import models
from app.util.json_response import error_json

def get_entry_by_ids(board_id: int, entry_id: int, session: Session)\
        -> models.Entry:
    db_entry:models.Entry =\
        session.query(models.Entry) \
                .join(models.Board) \
                .filter(models.Entry.id==entry_id) \
                .filter(models.Board.id == board_id).first()
    if db_entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_json("Entry with board_id '"+str(board_id) +
                              "' and entry_id '"+str(entry_id)+"' not found"))
    return db_entry

def get_all_entries_by_board_id(board_id: int, session: Session):
    db_board: models.Board = session.query(models.Board) \
        .filter(models.Board.id == board_id).first()
    if db_board is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_json("Board with ID '" + str(board_id) + "' not found")
        )
    return db_board.entries
