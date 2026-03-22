from pydantic import BaseModel
from typing import Optional, Any


class RetrieveRequest(BaseModel):
    question: str
    pdfId: str
    pageNumber: Optional[int] = None


class ProcessPageRequest(BaseModel):
    # Common
    pdfId: str

    # Old shape (page-based)
    pageNumber: Optional[int] = None
    text: Optional[str] = None

    # New shape (section-based from backend worker)
    year: Optional[Any] = None
    sectionTitle: Optional[str] = None
    questions: Optional[list[str]] = None

