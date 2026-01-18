from fastapi import FastAPI

from api import all_router
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(title="GenXPDF Backend API")




origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(all_router.router, prefix="/api", tags=["api"])