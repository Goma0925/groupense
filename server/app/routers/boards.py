from fastapi import APIRouter, Depends, HTTPException
from fastapi import Response, status
from sqlalchemy.orm import Session

from app.auth.middleware import get_user
from app.db.middleware import get_session
from app.db import schemas
from app.db import models
from app.util.json_response import error_json
import app.db.op as op

router = APIRouter(
    prefix="/boards",
    tags=["boards"],
    responses={404: {"description": "Resource not found"}}
)

@router.get("/", response_model=list[schemas.Board])
def get_all_boards(
        user: models.User=Depends(get_user),
        session: Session=Depends(get_session),
        ) -> models.Board:
    boards_db = session.query(models.Board).\
        join(models.Permission). \
        filter(models.Permission.user_id == user.id).all()
    return boards_db

@router.get("/{board_id}", response_model=schemas.Board)
def get_board_by_id(
        board_id:int, user: models.User=Depends(get_user),
        session: Session=Depends(get_session),
        ) -> models.Board:
    op.permissions.check_authorization_by_board_id(board_id, user.id, session)
    return op.boards.get_board_by_id(board_id, session)

@router.post("", response_model=schemas.Board)
def create_board(
        payload: schemas.BoardCreatePayload, user: models.User=Depends(get_user),
        session: Session=Depends(get_session)
        ) -> schemas.Board:
    board_db: models.Board = models.Board(name=payload.name)
    # Create an owner permission
    perm_db: models.Permission = models.Permission(
        user_id=user.id,
        is_owner=False,
    )
    board_db.permissions.append(perm_db)
    session.add(board_db)
    session.commit()
    session.refresh(board_db)
    return board_db

@router.put("/{board_id}", response_model=schemas.Board)
def update_board(
        board_id:int, payload: schemas.BoardUpdatePayload, user: models.User=Depends(get_user),
        session: Session=Depends(get_session)
        ) -> schemas.Board:
    op.permissions.check_authorization_by_board_id(board_id, user.id, session)
    board_db: models.Board = op.boards.get_board_by_id(board_id, session)
    for attr, val in payload.dict().items():
        setattr(board_db, attr, val)
    session.commit()
    return board_db

@router.delete("/{board_id}")
def delete_board(
        board_id:int, session: Session=Depends(get_session), user: models.User=Depends(get_user),
        ) -> Response:
    op.permissions.check_authorization_by_board_id(board_id, user.id, session)
    board_db: models.Board = op.boards.get_board_by_id(board_id, session)
    session.delete(board_db)
    session.commit()
    return Response(status_code=status.HTTP_200_OK)