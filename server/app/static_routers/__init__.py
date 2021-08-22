from fastapi import APIRouter
from app.static_routers import templates
from app.api_routers.consts import API_ROOT_PATH

root_static_router = APIRouter()
root_static_router.include_router(templates.router)