from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from api.router import api_router
from services.qdrant import client, settings
from qdrant_client.http import models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup: ensure payload indexes exist (collection may already exist without indexes)
    try:
        exists = await client.collection_exists(settings.QDRANT_COLLECTION_NAME)
        if exists:
            for field in ["type", "pdfId", "groupId"]:
                try:
                    await client.create_payload_index(
                        collection_name=settings.QDRANT_COLLECTION_NAME,
                        field_name=field,
                        field_schema=models.PayloadSchemaType.KEYWORD,
                    )
                    logger.info(f"Created payload index for field: {field}")
                except Exception:
                    pass  # Already exists
    except Exception as e:
        logger.warning(f"Could not ensure Qdrant indexes on startup: {e}")
    yield


app = FastAPI(title="StudyShare Embedding Service", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
