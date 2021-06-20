from fastapi import APIRouter, Depends, HTTPException
from fastapi import Response, status
from sqlalchemy.orm import Session

from app.db.db_util import get_session
from app.db import schemas
from app.db import models
from app.util.json_response import error_json
import app.db.op as op

router = APIRouter(
    prefix="/boards",
    tags=["boards"],
    responses={404: {"description": "Resource not found"}}
)

@router.get("/{board_id}", response_model=schemas.Board)
def get_board_by_id(
        board_id:int, session: Session=Depends(get_session)
        ) -> models.Board:
    return op.boards.get_board_by_id(board_id, session)

@router.get("", response_model=schemas.Board)
def get_board_by_name(
        board_name:str, access_key:str, session: Session=Depends(get_session)
        ) -> schemas.Board:
    db_board = op.boards.get_board_by_name(board_name, session)
    if db_board.access_key != access_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=error_json("The access_key '"+str(access_key)+"' does not match with the board's key."))
    return db_board

@router.post("", response_model=schemas.Board)
def create_board(
        payload: schemas.BoardCreatePayload, session: Session=Depends(get_session)
        ) -> schemas.Board:
    board_db = models.Board(name=payload.name, access_key=payload.access_key)
    session.add(board_db)
    session.commit()
    session.refresh(board_db)
    return board_db

@router.put("{board_id}", response_model=schemas.Board)
def update_board(
        board_id:int, payload: schemas.BoardUpdatePayload, session: Session=Depends(get_session)
        ) -> schemas.Board:
    board_db: models.Board = op.boards.get_board_by_id(board_id, session)
    for attr, val in payload.dict().items():
        setattr(board_db, attr, val)
    session.commit()
    return board_db

@router.delete("{board_id}")
def delete_board(
        board_id:int, session: Session=Depends(get_session)
        ) -> Response:
    db_board: models.Board = op.boards.get_board_by_id(board_id, session)
    session.delete(db_board)
    session.commit()
    return Response(status_code=status.HTTP_200_OK)