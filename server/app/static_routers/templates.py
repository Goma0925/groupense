from fastapi import APIRouter, Form, requests
from fastapi import status
from fastapi.exceptions import HTTPException
from fastapi.param_functions import Depends
from starlette.responses import HTMLResponse, RedirectResponse

from fastapi import Request
from app.consts import ACCESS_JWT_SECRET_KEY, DEFAULT_ACCESS_TOKEN_EXPIRE_MINUTES, DEFAULT_REFRESH_TOKEN_EXPIRE_MINUTES, REFRESH_JWT_SECRET_KEY
from app.db import models, schemas
from app.db.middleware import get_session
from fastapi.templating import Jinja2Templates
from app.db.schemas.users import UserSignupPayload
from app.util.json_response import error_json
from app.auth import util as auth_util
from app.db import op

templates = Jinja2Templates(directory="app/templates")

router = APIRouter(
    tags=["users"],
    responses={404: {"description": "Resource not found"}}
)

@router.get("/login", response_class=templates.TemplateResponse)
def get_login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@router.post("/login", response_class=HTMLResponse)
def login_redirect(request: Request, username: str = Form(...), password: str = Form(...), session=Depends(get_session)):
    user_db: models.User = op.users.get_user_by_name(username, session)
    if not auth_util.is_valid_password(password, user_db.hashed_password):
        return templates.TemplateResponse("login.html", 
            {
                "request": request, 
                "username": username,
                "password": password,
                "error_type":"invalid_credentials", 
                "error_msg": "Username or password is incorrect."
            })    # Set the refresh token in the HTTP only cookie
    refresh_token: str = auth_util.create_user_jwt(user_db.name, user_db.id, REFRESH_JWT_SECRET_KEY, DEFAULT_REFRESH_TOKEN_EXPIRE_MINUTES)
    response = RedirectResponse("./app") # Open the frontend app
    response.set_cookie(key="refresh_token", value=refresh_token)
    return response

@router.get("/signup", response_class=templates.TemplateResponse)
def get_signup_page(request: Request):
    print("Get signup")
    return templates.TemplateResponse("signup.html", {"request": request})


@router.post("/signup", response_class=RedirectResponse)
def signup_redirect(request: Request, username: str = Form(...), password: str = Form(...), session=Depends(get_session)):
    # Check if the same username exists
    db_existing_user: models.User = session.query(models.User).filter(models.User.name == username).first()
    if db_existing_user:
        return templates.TemplateResponse("signup.html", 
        {
            "request": request,
            "username": username,
            "password": password,
            "error_type":"username_taken",
            "error_msg": 'Username "'+username+'" is already taken.'
        })
    # Create a new user in DB.
    user_db = models.User(name=username, hashed_password=auth_util.get_password_hash(password))
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
    # Set a refresh token in the HTTP only cookie
    refresh_token: str = auth_util.create_user_jwt(user_db.name, user_db.id, REFRESH_JWT_SECRET_KEY, DEFAULT_REFRESH_TOKEN_EXPIRE_MINUTES)
    response = RedirectResponse("./app") # Open the frontend app
    response.set_cookie(key="refresh_token", value=refresh_token)
    return response