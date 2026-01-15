from fastapi import APIRouter

from api.routes import routes

router = APIRouter()

router.include_router(routes.router, prefix="/documents", tags=["documents"])
# router.include_router(user_routes.router, prefix="/users", tags=["users"])
# router.include_router(teacher_routes.router, prefix="/teachers", tags=["teachers"])
