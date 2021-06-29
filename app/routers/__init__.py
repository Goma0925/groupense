from fastapi import APIRouter
from app.routers import users, boards, transactions, members, entries
from app.routers.consts import API_ROOT_PATH

root_router = APIRouter(prefix=API_ROOT_PATH)
root_router.include_router(users.router)
root_router.include_router(boards.router)
root_router.include_router(transactions.router)
root_router.include_router(members.router)
root_router.include_router(entries.router)
