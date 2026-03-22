import uuid
from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models
from core.config import settings

client = AsyncQdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)

async def ensure_collection(dimension: int):
    """
    Ensure the Qdrant collection exists with required payload indexes.
    Indexes are needed for filtered queries on type, pdfId, and groupId.
    """
    exists = await client.collection_exists(settings.QDRANT_COLLECTION_NAME)
    if not exists:
        await client.create_collection(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            vectors_config=models.VectorParams(size=dimension, distance=models.Distance.COSINE),
        )

    # Create payload indexes required for filtered queries (idempotent — safe to call every time)
    for field in ["type", "pdfId", "groupId"]:
        try:
            await client.create_payload_index(
                collection_name=settings.QDRANT_COLLECTION_NAME,
                field_name=field,
                field_schema=models.PayloadSchemaType.KEYWORD,
            )
        except Exception:
            pass  # Index already exists — ignore

async def store_hierarchical_embeddings(
    pdf_id: str,
    page_number: int | None,
    page_text: str,
    page_embedding: list[float],
    chunks: list[str],
    chunk_embeddings: list[list[float]],
    meta: dict | None = None,
):
    """
    Hierarchical storage for Two-Stage Retrieval.
    Stores 1 page vector and multiple chunk vectors with their respective types.
    """
    dimension = len(page_embedding)
    await ensure_collection(dimension)

    points = []
    group_id = str(uuid.uuid4())
    meta = meta or {}

    # 1. Add Page Point
    page_point_id = str(uuid.uuid4())
    points.append(
        models.PointStruct(
            id=page_point_id,
            vector=page_embedding,
            payload={
                "type": "page",
                "pdfId": pdf_id,
                "pageNumber": page_number,
                "groupId": group_id,
                "text": page_text,
                **{k: v for k, v in meta.items() if v is not None},
            }
        )
    )

    # 2. Add Chunk Points
    for i, (chunk, embedding) in enumerate(zip(chunks, chunk_embeddings)):
        chunk_point_id = str(uuid.uuid4())
        points.append(
            models.PointStruct(
                id=chunk_point_id,
                vector=embedding,
                payload={
                    "type": "chunk",
                    "pdfId": pdf_id,
                    "pageNumber": page_number,
                    "chunkIndex": i,
                    "groupId": group_id,
                    "text": chunk,
                    **{k: v for k, v in meta.items() if v is not None},
                }
            )
        )

    if points:
        await client.upsert(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            points=points
        )
    return group_id

async def retrieve_context(
    query_embedding: list[float],
    pdf_id: str,
    page_number: int | None = None,
    top_pages: int = 5,
    top_chunks: int = 10
) -> list[dict]:
    """
    Hierarchical retrieval.
    If page_number is provided, optimized search happens strictly within that page.
    Otherwise, stage 1 searches page vectors, stage 2 searches chunk vectors of top pages.
    """
    if page_number is not None:
        # Optimization: User is on a specific page, just search chunks within this page.
        result = await client.query_points(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            query=query_embedding,
            query_filter=models.Filter(
                must=[
                    models.FieldCondition(key="type", match=models.MatchValue(value="chunk")),
                    models.FieldCondition(key="pdfId", match=models.MatchValue(value=pdf_id)),
                    models.FieldCondition(key="pageNumber", match=models.MatchValue(value=page_number)),
                ]
            ),
            limit=top_chunks
        )
        return [hit.payload for hit in result.points]

    # Stage 1: Search top pages
    page_result = await client.query_points(
        collection_name=settings.QDRANT_COLLECTION_NAME,
        query=query_embedding,
        query_filter=models.Filter(
            must=[
                models.FieldCondition(key="type", match=models.MatchValue(value="page")),
                models.FieldCondition(key="pdfId", match=models.MatchValue(value=pdf_id))
            ]
        ),
        limit=top_pages
    )
    page_hits = page_result.points

    if not page_hits:
        return []

    # Prefer grouping by groupId (works even when pageNumber is missing)
    relevant_groups = [hit.payload.get("groupId") for hit in page_hits if hit.payload.get("groupId")]
    if relevant_groups:
        chunk_result = await client.query_points(
            collection_name=settings.QDRANT_COLLECTION_NAME,
            query=query_embedding,
            query_filter=models.Filter(
                must=[
                    models.FieldCondition(key="type", match=models.MatchValue(value="chunk")),
                    models.FieldCondition(key="pdfId", match=models.MatchValue(value=pdf_id)),
                    models.FieldCondition(key="groupId", match=models.MatchAny(any=relevant_groups)),
                ]
            ),
            limit=top_chunks
        )
        return [hit.payload for hit in chunk_result.points]

    # Fallback to pageNumber if groupId isn't present for some reason
    relevant_pages = [hit.payload.get("pageNumber") for hit in page_hits if hit.payload.get("pageNumber") is not None]
    if not relevant_pages:
        return []

    chunk_result = await client.query_points(
        collection_name=settings.QDRANT_COLLECTION_NAME,
        query=query_embedding,
        query_filter=models.Filter(
            must=[
                models.FieldCondition(key="type", match=models.MatchValue(value="chunk")),
                models.FieldCondition(key="pdfId", match=models.MatchValue(value=pdf_id)),
                models.FieldCondition(key="pageNumber", match=models.MatchAny(any=relevant_pages)),
            ]
        ),
        limit=top_chunks
    )
    return [hit.payload for hit in chunk_result.points]

async def delete_embeddings_by_pdf(pdf_id: str):
    """
    Deletes all embeddings (both page and chunk vectors) associated with a given pdfId.
    """
    await client.delete(
        collection_name=settings.QDRANT_COLLECTION_NAME,
        points_selector=models.FilterSelector(
            filter=models.Filter(
                must=[
                    models.FieldCondition(key="pdfId", match=models.MatchValue(value=pdf_id))
                ]
            )
        )
    )
