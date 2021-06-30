from fastapi import APIRouter, Depends, HTTPException
from fastapi import Response, status
from sqlalchemy.orm import Session

from app.auth.middleware import get_user
from app.db.middleware import get_session
from app.db import schemas
from app.db import models
import app.db.op as op

router = APIRouter(
    prefix="",
    tags=["entries"],
    responses={404: {"description": "Resource not found"}}
)

@router.get("/boards/{board_id}/entries", response_model=list[schemas.Entry])
def get_all_entries(
        board_id:int, session:Session=Depends(get_session), user: models.User=Depends(get_user),
        ) -> list[models.Entry]:
    op.permissions.check_authorization_by_board_id(board_id, user.id, session)
    return op.entries.get_all_entries_by_board_id(board_id, session)

@router.get("/boards/{board_id}/entries/{entry_id}", response_model=schemas.Entry)
def get_entry_by_id(
        board_id:int, entry_id:int, user: models.User=Depends(get_user),
        session:Session=Depends(get_session)
        ) -> models.Entry:
    op.permissions.check_authorization_by_board_id(board_id, user.id, session)
    return op.entries.get_entry_by_ids(board_id, entry_id, session)

@router.post("/boards/{board_id}/entries/", response_model=schemas.Entry)
def create_entry(
        board_id:int, payload:schemas.EntryCreatePayload, user: models.User=Depends(get_user),
        session:Session=Depends(get_session)
        ) -> models.Entry:
    op.permissions.check_authorization_by_board_id(board_id, user.id, session)
    entry_db = models.Entry(name=payload.name, board_id=board_id)
    session.add(entry_db)
    session.commit()
    session.refresh(entry_db)
    return entry_db

@router.put("/boards/{board_id}/entries/{entry_id}", response_model=schemas.Entry)
def update_entry(
        board_id:int, entry_id:int, payload:schemas.EntryUpdatePayload,
        user: models.User=Depends(get_user), session:Session=Depends(get_session)
        ) -> models.Entry:
    op.permissions.check_authorization_by_board_id(board_id, user.id, session)
    entry_db: models.Entry = op.entries.get_entry_by_ids(board_id, entry_id, session)
    for attr, val in payload.dict().items():
        setattr(entry_db, attr, val)
    session.commit()
    session.refresh(entry_db)
    return entry_db

@router.delete("/boards/{board_id}/entries/{entry_id}")
def delete_entry(
        board_id:int, entry_id:int,
        user: models.User=Depends(get_user), session:Session=Depends(get_session)
        ) -> Response:
    op.permissions.check_authorization_by_board_id(board_id, user.id, session)
    db_entry: models.Entry = op.entries.get_entry_by_ids(board_id, entry_id, session)
    session.delete(db_entry)
    session.commit()
    return Response(status_code=status.HTTP_200_OK)
