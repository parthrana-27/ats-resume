import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "ATS Resume Intelligence"
    DEBUG: bool = True
    API_PREFIX: str = "/api"
    
    # DB Settings
    DATABASE_URL: str = "sqlite:///d:/ats-resume/ats_intelligence.db"
    
    # API Keys
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY", None)
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY", None)
    HUGGINGFACE_API_KEY: str | None = os.getenv("HUGGINGFACE_API_KEY", None)
    
    # AI Engine Options
    # Choose between "gemini" or "huggingface"
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "huggingface")
    HUGGINGFACE_MODEL: str = os.getenv("HUGGINGFACE_MODEL", "meta-llama/Meta-Llama-3-8B-Instruct")
    
    # If True, bypasses LLM calls and uses high-fidelity local regex and template rule engines.
    # Auto-resolves to True if no API keys are found.
    FORCE_MOCK_AI: bool = False
    
    # Hugging Face embedding model name for local offline embeddings
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    
    @property
    def is_mock_mode(self) -> bool:
        if self.FORCE_MOCK_AI:
            return True
        return not (self.GEMINI_API_KEY or self.OPENAI_API_KEY or self.HUGGINGFACE_API_KEY)
    
    class Config:
        env_file = "d:/ats-resume/.env"
        env_file_encoding = "utf-8"

settings = Settings()
