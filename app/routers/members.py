from fastapi import APIRouter, Depends, HTTPException
from fastapi import Response, status
from sqlalchemy.orm import Session

from app.db.middleware import get_session
from app.db import schemas
from app.db import models
from app.util.json_response import error_json
import app.db.op as op

router = APIRouter(
    prefix="",
    tags=["members"],
    responses={404: {"description": "Resource not found"}}
)

@router.get("/boards/{board_id}/members", response_model=list[schemas.Member])
def get_all_members(
        board_id:int, session=Depends(get_session)
        ) -> list[models.Member]:
    return op.members.get_all_members_by_board_id(board_id, session)

@router.get("/boards/{board_id}/members/{member_id}", response_model=schemas.Member)
def get_member_by_id(
        board_id:int, member_id:int, session:Session=Depends(get_session)
        ) -> models.Member:
    return op.members.get_member_by_ids(board_id, member_id, session)

@router.post("/boards/{board_id}/members", response_model=schemas.Member)
def create_member(
        board_id:int, payload:schemas.MemberCreatePayload, session:Session=Depends(get_session)
        ) -> models.Member:
    db_member:models.Member = models.Member(name=payload.name, board_id=board_id)
    session.add(db_member)
    session.commit()
    session.refresh(db_member)
    return db_member

@router.put("/boards/{board_id}/members/{member_id}", response_model=schemas.Member)
def update_member(
        board_id:int, member_id:int, payload:schemas.MemberUpdatePayload, session:Session=Depends(get_session)
        ) -> models.Member:
    db_member:models.Member = op.members.get_member_by_ids(board_id, member_id, session)
    for attr, val in payload.dict().items():
        setattr(db_member, attr, val)
    session.commit()
    session.refresh(db_member)
    return db_member

@router.delete("/boards/{board_id}/members/{member_id}")
def delete_member(
        board_id: int, member_id: int, session: Session = Depends(get_session)
        ) -> Response:
    db_member: models.Member = op.members.get_member_by_ids(board_id, member_id, session)
    session.delete(db_member)
    session.commit()
    return Response(status_code=status.HTTP_200_OK)
