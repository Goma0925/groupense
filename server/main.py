from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from app.routers import root_router
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
app.add_middleware(CORSMiddleware, allow_origins=allow_origins)

app.include_router(root_router)
app.mount("/", StaticFiles(directory="app/static", html=True), name="static")




