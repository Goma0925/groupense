from sqlalchemy import Numeric, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from .database import Base

class Board(Base):
    __tablename__ = "Board"
    id = Column(Integer, primary_key=True, index=True)
    access_key = Column(String)
    name = Column(String, index=True)
    members = relationship("Member", back_populates="board", cascade="all, delete-orphan")
    entries = relationship("Entry", back_populates="board", cascade="all, delete-orphan")

class Member(Base):
    __tablename__ = "Member"
    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("Board.id"))
    name = Column(String)
    board = relationship("Board", back_populates="members")
    transactions = relationship("Transaction", back_populates="member", cascade="all, delete-orphan")

class Entry(Base):
    __tablename__ = "Entry"
    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("Board.id"))
    name = Column(String)
    board = relationship("Board", back_populates="entries")
    transactions = relationship("Transaction", back_populates="entry", cascade="all, delete-orphan")

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