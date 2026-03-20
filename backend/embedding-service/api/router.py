from fastapi import APIRouter
from .routes.health import router as health_router
from .routes.embedding import router as embedding_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(embedding_router)