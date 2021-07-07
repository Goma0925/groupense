from sqlalchemy import Numeric, Column, ForeignKey, Integer, String, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "User"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    hashed_password =Column(String)
    permissions: list = relationship("Permission", back_populates="users",  cascade="all, delete-orphan")

class Permission(Base):
    """
        Keeps the records of which users have access to which boards.
        A linking table between User and Board
    """
    __tablename__ = "Permission"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("User.id"))
    board_id = Column(Integer, ForeignKey("Board.id"))
    is_owner = Column(Boolean)
    users: list = relationship("User", back_populates="permissions")
    boards: list = relationship("Board", back_populates="permissions")

class Board(Base):
    __tablename__ = "Board"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    members: list = relationship("Member", back_populates="board", cascade="all, delete-orphan")
    entries: list = relationship("Entry", back_populates="board", cascade="all, delete-orphan")
    permissions: list = relationship("Permission", back_populates="boards",  cascade="all, delete-orphan")

class Member(Base):
    __tablename__ = "Member"
    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("Board.id"))
    name = Column(String)
    board = relationship("Board", back_populates="members")
    transactions: list = relationship("Transaction", back_populates="member", cascade="all, delete-orphan")

class Entry(Base):
    __tablename__ = "Entry"
    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("Board.id"))
    name = Column(String)
    board = relationship("Board", back_populates="entries")
    transactions: list = relationship("Transaction", back_populates="entry", cascade="all, delete-orphan")

class Transaction(Base):
    """
        Linking table between Entry and Member
        Keeps track of amount of money the member owed/paid for the entry(event).
    """
    __tablename__ = "Transaction"
    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("Entry.id"))
    member_id = Column(Integer, ForeignKey("Member.id"))
    amount = Column(Numeric)
    entry = relationship("Entry", back_populates="transactions")
    member = relationship("Member", back_populates="transactions")