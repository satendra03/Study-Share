# StudyShare Embedding Microservice

This is a Python FastAPI microservice responsible for text chunking, embedding generation using NVIDIA API, and storing embeddings in a Qdrant vector database.

## Prerequisites

- Python 3.10+
- Qdrant Cluster (cloud or local)
- NVIDIA API Key

## Setup

1. **Create Virtual Environment:**
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies:**
   ```sh
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables:**
   Rename `.env.example` to `.env` and fill in your keys.
   ```
   NVIDIA_API_KEY=your_nvidia_api_key
   QDRANT_URL=your_qdrant_url
   QDRANT_API_KEY=your_qdrant_api_key
   QDRANT_COLLECTION_NAME=studyshare_documents
   ```

4. **Run the Service:**
   ```sh
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Endpoints

### `POST /process-page`
Accepts extracted text from a PDF page and converts it into hierarchical embeddings stored in Qdrant (1 page embedding + N chunk embeddings).

**Request Payload Example:**
```json
{
  "pdfId": "abc12345",
  "pageNumber": 1,
  "text": "The OCR extracted text for this specific page..."
}
```

**Response Example:**
```json
{
  "status": "success",
  "message": "Page processed and stored hierarchically",
  "pdfId": "abc12345",
  "pageNumber": 1,
  "chunks_processed": 5
}
```

### `POST /retrieve`
Performs Hierarchical (Two-Stage) Retrieval across the vectorized pages and chunks. 

**Request Payload Example:**
```json
{
  "question": "What is binary search?",
  "pdfId": "abc12345",
  "pageNumber": null
}
```
*Note: Set `pageNumber` to an integer if the user is currently viewing a specific page. This will bypass the full document search and instantly retrieve chunks only from that page.*

**Response Example:**
```json
{
  "status": "success",
  "context": [
    {
      "type": "chunk",
      "pdfId": "abc12345",
      "pageNumber": 5,
      "chunkIndex": 2,
      "text": "Binary search works by repeatedly dividing..."
    }
  ]
}
```

### `GET /health`
Returns the status of the service.
