from fastapi import APIRouter, Depends, HTTPException
from fastapi import Response, status
from sqlalchemy.orm import Session

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
        board_id:int, session:Session=Depends(get_session)
        ) -> list[models.Entry]:
    return op.entries.get_all_entries_by_board_id(board_id, session)

@router.get("/boards/{board_id}/entries/{entry_id}", response_model=schemas.Entry)
def get_entry_by_id(
        board_id:int, entry_id:int, session:Session=Depends(get_session)
        ) -> models.Entry:
    return op.entries.get_entry_by_ids(board_id, entry_id, session)

@router.post("/boards/{board_id}/entries/", response_model=schemas.Entry)
def create_entry(
        board_id:int, payload:schemas.EntryCreatePayload, session:Session=Depends(get_session)
        ) -> models.Entry:
    db_entry = models.Entry(name=payload.name, board_id=board_id)
    session.add(db_entry)
    session.commit()
    session.refresh(db_entry)
    return db_entry

@router.put("/boards/{board_id}/entries/{entry_id}", response_model=schemas.Entry)
def update_entry(
        board_id:int, entry_id:int, payload:schemas.EntryUpdatePayload, session:Session=Depends(get_session)
        ) -> models.Entry:
    db_entry: models.Entry = op.entries.get_entry_by_ids(board_id, entry_id, session)
    for attr, val in payload.dict().items():
        setattr(db_entry, attr, val)
    session.commit()
    session.refresh(db_entry)
    return db_entry

@router.delete("/boards/{board_id}/entries/{entry_id}")
def delete_entry(
        board_id:int, entry_id:int, session:Session=Depends(get_session)
        ) -> Response:
    db_entry: models.Entry = op.entries.get_entry_by_ids(board_id, entry_id, session)
    session.delete(db_entry)
    session.commit()
    return Response(status_code=status.HTTP_200_OK)
