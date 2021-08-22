from fastapi import APIRouter
from app.api_routers import users, boards, transactions, members, entries
from app.api_routers.consts import API_ROOT_PATH

root_api_router = APIRouter(prefix=API_ROOT_PATH)
root_api_router.include_router(users.router)
root_api_router.include_router(boards.router)
root_api_router.include_router(transactions.router)
root_api_router.include_router(members.router)
root_api_router.include_router(entries.router)
