from fastapi import APIRouter

from api.routes import route, document_upload, auth, projects, sheets
from api.routers import translation

router = APIRouter()

router.include_router(route.router, prefix="/genex", tags=["GenEx"])
router.include_router(document_upload.router, prefix="/genex", tags=["GenEx"])
router.include_router(auth.router, prefix="/genex", tags=["Auth"])
router.include_router(projects.router, prefix='/genex/create', tags='GenEx')
router.include_router(sheets.router, prefix='/genex', tags='GenEx')
router.include_router(translation.router, prefix='/genex', tags='Translation')
