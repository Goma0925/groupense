from sqlalchemy.orm import Session
from app.db import database

def get_session():
    session: Session = database.ConfiguredSession()
    try:
        yield session
    finally:
        session.close()
