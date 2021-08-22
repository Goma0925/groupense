from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from app.api_routers import root_api_router
from app.static_routers import root_static_router
from app.db import database
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

database.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# CORS settings
allow_origins = [
    "http://127.0.0.1:3000",
    "http://localhost:3000"
]
app.add_middleware(
    CORSMiddleware, 
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(root_api_router)
app.include_router(root_static_router)
app.mount("/static", StaticFiles(directory="app/static", html=True), name="static")




