import os
from pathlib import Path
from functools import lru_cache
import joblib

_ENV_MODEL_PATH = os.environ.get("MODEL_PATH")
if _ENV_MODEL_PATH:
    MODEL_PATH = Path(_ENV_MODEL_PATH)
else:
    BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
    MODEL_PATH = BASE_DIR / "back" / "fincoach_api" / "joblibs" / "02_clasificacion_transacciones.joblib"

class ModelRepository:
    @staticmethod
    @lru_cache(maxsize=1)
    def load_transaction_model():
        """Carga en memoria y en caché el modelo .joblib de 5.04 MB."""
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"No se encontró el artefacto binario en: {MODEL_PATH}")
        return joblib.load(MODEL_PATH)

