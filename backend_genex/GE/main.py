from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from api import all_router
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings



app = FastAPI(title="GenXPDF Backend API")




origins = [
        "*",
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
allow_credentials = "*" not in origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # React
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(all_router.router, prefix="/api", tags=["api"])
PDF_DIR = Path(__file__).parent / "generated_pdfs"
PDF_DIR.mkdir(exist_ok=True)

app.mount("/pdfs", StaticFiles(directory=str(PDF_DIR)), name="pdfs")
