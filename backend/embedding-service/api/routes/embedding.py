import logging
from fastapi import APIRouter, HTTPException

from api.schemas import ProcessPageRequest, RetrieveRequest
from services.chunking import chunk_text
from services.embedding import generate_embeddings
from services.qdrant import store_hierarchical_embeddings, retrieve_context, delete_embeddings_by_pdf

logger = logging.getLogger(__name__)
router = APIRouter()


def _derive_text(req: ProcessPageRequest) -> str:
    if req.text and req.text.strip():
        return req.text.strip()

    # Backend worker shape: year + sectionTitle + questions[]
    if req.questions and any(q.strip() for q in req.questions):
        questions_text = "\n".join([q.strip() for q in req.questions if q and q.strip()])
        header = []
        if req.year is not None:
            header.append(f"Year: {req.year}")
        if req.sectionTitle:
            header.append(f"Section: {req.sectionTitle}")
        header_text = "\n".join(header)
        return (header_text + "\n\n" + questions_text).strip() if header_text else questions_text.strip()

    return ""


@router.post("/process-page")
async def process_page(req: ProcessPageRequest):
    """
    Accepts BOTH payload shapes:
    - Old: { pdfId, pageNumber, text }
    - New: { pdfId, year, sectionTitle, questions[] }

    Stores 1 "page" vector + N "chunk" vectors in Qdrant.
    """
    text = _derive_text(req)
    if not req.pdfId:
        raise HTTPException(status_code=400, detail="Missing required field: 'pdfId'")
    if not text:
        raise HTTPException(
            status_code=400,
            detail="Missing required content. Provide either 'text' or non-empty 'questions'.",
        )

    page_number = req.pageNumber  # optional now (section-based indexing may omit it)

    try:
        logger.info(f"Chunking text for pdfId={req.pdfId}, pageNumber={page_number}")
        chunks = chunk_text(text)

        logger.info("Generating page embedding...")
        page_embeddings = await generate_embeddings([text], truncate="END", input_type="passage")
        page_embedding = page_embeddings[0]

        chunk_embeddings = []
        if chunks:
            logger.info(f"Generating embeddings for {len(chunks)} chunks...")
            chunk_embeddings = await generate_embeddings(chunks, truncate="NONE", input_type="passage")

        logger.info("Storing hierarchical embeddings in Qdrant...")
        group_id = await store_hierarchical_embeddings(
            pdf_id=req.pdfId,
            page_number=page_number,
            page_text=text,
            page_embedding=page_embedding,
            chunks=chunks,
            chunk_embeddings=chunk_embeddings,
            meta={
                "year": req.year,
                "sectionTitle": req.sectionTitle,
            },
        )

        return {
            "status": "success",
            "message": "Content processed and stored hierarchically",
            "pdfId": req.pdfId,
            "pageNumber": page_number,
            "groupId": group_id,
            "chunks_processed": len(chunks),
        }
    except Exception as e:
        logger.error(f"Error processing content: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/retrieve")
async def retrieve(req: RetrieveRequest):
    """
    Two-Stage Retrieval endpoint.
    Works even when stored items don't have pageNumber (uses groupId internally).
    """
    try:
        logger.info(f"Retrieving context for question: {req.question}")

        embeddings = await generate_embeddings([req.question], truncate="NONE", input_type="query")
        query_embedding = embeddings[0]

        results = await retrieve_context(
            query_embedding=query_embedding,
            pdf_id=req.pdfId,
            page_number=req.pageNumber,
        )

        return {"status": "success", "context": results}
    except Exception as e:
        logger.error(f"Error in hierarchical retrieval: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/{pdf_id}")
async def delete_embeddings(pdf_id: str):
    """
    Deletes all vectors related to a specific pdf_id
    """
    if not pdf_id:
        raise HTTPException(status_code=400, detail="Missing required path parameter: 'pdf_id'")
        
    try:
        logger.info(f"Deleting embeddings for pdfId: {pdf_id}")
        await delete_embeddings_by_pdf(pdf_id)
        return {"status": "success", "message": f"Embeddings deleted for pdfId: {pdf_id}"}
    except Exception as e:
        logger.error(f"Error deleting embeddings for pdfId {pdf_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

