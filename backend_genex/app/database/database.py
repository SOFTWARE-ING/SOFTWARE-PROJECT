# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker

# SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:@localhost/genex_db"

# engine = create_engine(SQLALCHEMY_DATABASE_URL)
# # connect_arg = {"check_same_thread": False}  # Only for SQLite
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()
