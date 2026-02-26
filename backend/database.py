import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load .env from the backend directory and also the project root as a fallback
load_dotenv()  # loads backend/.env (cwd)
load_dotenv(Path(__file__).resolve().parent.parent / ".env")  # loads root .env

# Use a default SQLite URL if DATABASE_URL is not set in the environment
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./salveeya.db")

# Only use the SQLite-specific `check_same_thread` argument if we are actually using SQLite
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,  # Auto-reconnect stale connections (important for cloud DBs)
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
