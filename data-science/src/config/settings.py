import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-ds-modular-service-key-g9-latam-2026'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'rest_framework',
    'modules.profile',
    'modules.transaction',
    'modules.recommendation',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

LANGUAGE_CODE = 'es-co'
TIME_ZONE = 'America/Bogota'
USE_I18N = True
USE_TZ = True

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
    'DEFAULT_PARSER_CLASSES': ['rest_framework.parsers.JSONParser'],
}

# Machine Learning joblib artifact paths
def resolve_model_dir() -> Path:
    candidates = [
        BASE_DIR.parent / 'Modelos',
        BASE_DIR / 'Modelos',
        BASE_DIR / 'joblibs',
        Path('/app/Modelos'),
        Path('/app/joblibs'),
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return BASE_DIR.parent / 'Modelos'

MODEL_DIR = resolve_model_dir()

USER_PROFILE_MODEL_PATH = MODEL_DIR / '01_conocimiento_usuario.joblib'
TRANSACTION_MODEL_PATH = MODEL_DIR / '02_clasificacion_transacciones.joblib'
TRAJECTORY_MODEL_PATH = MODEL_DIR / '04_estados_trayectoria.joblib'
RECOMMENDATION_MODEL_PATH = MODEL_DIR / '05_motor_recomendaciones.joblib'
