from fastapi import FastAPI
from app.routers import boards, members, entries, transactions
from app.db import database

database.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.include_router(boards.router)
app.include_router(transactions.router)
app.include_router(members.router)
app.include_router(entries.router)
