from fastapi import FastAPI

from api import all_router

app = FastAPI(title="GenXPDF Backend API")

app.include_router(all_router.router, prefix="/api", tags=["api"])
