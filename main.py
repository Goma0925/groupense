from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from app.routers import root_router
from app.db import database
from fastapi.staticfiles import StaticFiles

database.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.include_router(root_router)
app.mount("/", StaticFiles(directory="app/static", html=True), name="static")




