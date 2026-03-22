import httpx
from core.config import settings

NVIDIA_EMBEDDING_URL = "https://integrate.api.nvidia.com/v1/embeddings"
MODEL_NAME = "nvidia/llama-3.2-nemoretriever-300m-embed-v1"

_client: httpx.AsyncClient | None = None

def _get_client() -> httpx.AsyncClient:
    # Reuse a single AsyncClient for connection pooling (scales better under load).
    global _client
    if _client is None:
        _client = httpx.AsyncClient(timeout=httpx.Timeout(60.0))
    return _client

async def generate_embeddings(texts: list[str], truncate: str = "NONE", input_type: str = "passage") -> list[list[float]]:
    """
    Generate embeddings using the NVIDIA API.
    """
    if not settings.NVIDIA_API_KEY:
        raise ValueError("NVIDIA_API_KEY is not set in the environment")
        
    headers = {
        "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "input": texts,
        "model": MODEL_NAME,
        "input_type": input_type,
        "encoding_format": "float",
        "truncate": truncate
    }
    
    client = _get_client()
    response = await client.post(NVIDIA_EMBEDDING_URL, headers=headers, json=payload)
    response.raise_for_status()

    data = response.json()

    # Typically the format is {"data": [{"embedding": [...]}, ...]}
    embeddings = [item["embedding"] for item in data["data"]]
    return embeddings
