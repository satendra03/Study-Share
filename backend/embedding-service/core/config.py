from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    NVIDIA_API_KEY: str
    QDRANT_URL: str
    QDRANT_API_KEY: str = ""
    QDRANT_COLLECTION_NAME: str = "studyshare_documents"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
