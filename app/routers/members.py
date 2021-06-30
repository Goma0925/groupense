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
    prefix="",
    tags=["members"],
    responses={404: {"description": "Resource not found"}}
)

@router.get("/boards/{board_id}/members", response_model=list[schemas.Member])
def get_all_members(
        board_id:int, user: models.User=Depends(get_user),
        session=Depends(get_session)
        ) -> list[models.Member]:
    op.permissions.check_authorization_by_board_id(board_id, user.id, session)
    return op.members.get_all_members_by_board_id(board_id, session)

@router.get("/boards/{board_id}/members/{member_id}", response_model=schemas.Member)
def get_member_by_id(
        board_id:int, member_id:int, user: models.User=Depends(get_user),
        session:Session=Depends(get_session)
        ) -> models.Member:
    op.permissions.check_authorization_by_board_id(board_id, user.id, session)
    return op.members.get_member_by_ids(board_id, member_id, session)

@router.post("/boards/{board_id}/members", response_model=schemas.Member)
def create_member(
        board_id:int, payload:schemas.MemberCreatePayload, user: models.User=Depends(get_user),
        session:Session=Depends(get_session)
        ) -> models.Member:
    op.permissions.check_authorization_by_board_id(board_id, user.id, session)
    member_db:models.Member = models.Member(name=payload.name, board_id=board_id)
    session.add(member_db)
    session.commit()
    session.refresh(member_db)
    return member_db

@router.put("/boards/{board_id}/members/{member_id}", response_model=schemas.Member)
def update_member(
        board_id:int, member_id:int, payload:schemas.MemberUpdatePayload,
        user: models.User=Depends(get_user), session:Session=Depends(get_session)
        ) -> models.Member:
    op.permissions.check_authorization_by_board_id(board_id, user.id, session)
    member_db:models.Member = op.members.get_member_by_ids(board_id, member_id, session)
    for attr, val in payload.dict().items():
        setattr(member_db, attr, val)
    session.commit()
    session.refresh(member_db)
    return member_db

@router.delete("/boards/{board_id}/members/{member_id}")
def delete_member(
        board_id: int, member_id: int, user: models.User=Depends(get_user),
        session: Session = Depends(get_session)
        ) -> Response:
    op.permissions.check_authorization_by_board_id(board_id, user.id, session)
    member_db: models.Member = op.members.get_member_by_ids(board_id, member_id, session)
    session.delete(member_db)
    session.commit()
    return Response(status_code=status.HTTP_200_OK)
