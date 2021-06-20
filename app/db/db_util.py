from . import database
from sqlalchemy.orm import Session

def get_session():
    session: Session = database.ConfiguredSession()
    try:
        yield session
    finally:
        session.close()