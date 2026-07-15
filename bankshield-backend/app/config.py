from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # App
    app_name: str = "BankShield AI"
    environment: str = "development"

    # Database
    database_url: str = Field(..., env="DATABASE_URL")

    # JWT
    secret_key: str = Field(..., env="SECRET_KEY")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # CORS — comma-separated list of allowed origins
    # e.g. "https://fin-spark.vercel.app,http://localhost:5173"
    cors_origins: str = Field(
        default="http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173",
        env="CORS_ORIGINS",
    )

    @property
    def allowed_origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    # Fraud AI Model
    # Use "mock" to use the built-in mock client.
    # Set to a full URL when the Render model is deployed.
    fraud_model_url: str = Field(default="mock", env="FRAUD_MODEL_URL")

    # Gemini
    # If empty or missing, MockLLMService is used automatically.
    gemini_api_key: str = Field(default="", env="GEMINI_API_KEY")

    @property
    def use_mock_fraud(self) -> bool:
        return self.fraud_model_url.strip().lower() == "mock"

    @property
    def use_mock_llm(self) -> bool:
        return not bool(self.gemini_api_key.strip())

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
