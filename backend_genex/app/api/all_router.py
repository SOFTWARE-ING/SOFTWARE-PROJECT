from fastapi import APIRouter

from api.routes import routes, document_upload

router = APIRouter()

router.include_router(routes.router, prefix="/genex", tags=["GenEx"])
router.include_router(document_upload.router, prefix="/genex", tags=["GenEx"])
