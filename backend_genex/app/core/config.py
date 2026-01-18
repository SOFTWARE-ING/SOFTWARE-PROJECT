from pydantic_settings import BaseSettings, SettingsConfigDict # Ajout de SettingsConfigDict

class Settings(BaseSettings):
    # Vos variables existantes
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "genex_db"

    # AJOUTEZ CETTE LIGNE ICI 👇
    GEMINI_API_KEY: str

    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8000"]

    @property
    def SQLALCHEMY_DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # Utilisation de model_config (recommandé pour Pydantic V2)
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore" # <--- Optionnel : ceci évite de planter si d'autres variables inconnues sont dans le .env
    )

settings = Settings()