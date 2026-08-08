from datetime import timedelta
from pathlib import Path
from decouple import Csv, config
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent

ENVIRONMENT = config('DJANGO_ENV')

if ENVIRONMENT == 'local':
    DEBUG = True
    SECRET_KEY = 'django-insecure-$zy)x6n_mzw=@h)-e1)g*vb6w=3@i14())(%!9-j-c_3zot983'
    ALLOWED_HOSTS = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
    ]
elif ENVIRONMENT == 'production':
    DEBUG = False
    SECRET_KEY = config('DJANGO_SECRET_KEY')
    ALLOWED_HOSTS = config('DJANGO_ALLOWED_HOSTS', cast=Csv())
else:
    raise ImproperlyConfigured('DJANGO_ENV must be local or production.')

INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'drf_spectacular',
    #Apps propipas
    'accounts',
    'profiles',
    'transactions',
    'dashboard',
    'debts',
    'recommendations',
    'financial_analysis',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'accounts.middleware.ApiRequestSecurityMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'fincoach_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'fincoach_api.wsgi.application'

if ENVIRONMENT == 'local':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': config('DB_NAME'),
            'USER': config('DB_USER'),
            'PASSWORD': config('DB_PASSWORD'),
            'HOST': config('DB_HOST'),
            'PORT': config('DB_PORT', cast=int),
            'CONN_MAX_AGE': 60,
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'America/Bogota'
USE_I18N = True
USE_TZ = True
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

AUTH_USER_MODEL = 'accounts.Usuario'
USER_PROFILE_MODEL_PATH = BASE_DIR / 'joblibs' / '01_conocimiento_usuario.joblib'
TRANSACTION_MODEL_PATH = BASE_DIR / 'joblibs' / '02_clasificacion_transacciones.joblib'
TRAJECTORY_MODEL_PATH = BASE_DIR / 'joblibs' / '04_estados_trayectoria.joblib'
RECOMMENDATION_MODEL_PATH = BASE_DIR / 'joblibs' / '05_motor_recomendaciones.joblib'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'accounts.authentication.SessionAuthentication401',
    ],
    'EXCEPTION_HANDLER': 'fincoach_api.exceptions.manejador_excepciones',
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'FinCoach API',
    'DESCRIPTION': (
        'REST API for user financial profiles, contextual transaction '
        'classification, debts, dashboards and integral financial analysis.\n\n'
        'Authentication uses an HTTP-only session cookie created by the login '
        'endpoint. POST, PUT, PATCH and DELETE operations also require the '
        '`X-FinCoach-Request: 1` header.'
    ),
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': r'/api/v1',
    'TAGS': [
        {'name': 'Authentication', 'description': 'Registration and session management.'},
        {'name': 'Profiles', 'description': 'Declared data and user profile classification.'},
        {
            'name': 'Transactions',
            'description': 'Transaction history and contextual classification.',
        },
        {'name': 'Dashboard', 'description': 'Monthly totals, charts, alerts and CSV export.'},
        {'name': 'Debts', 'description': 'Debt registration, balances and payment evolution.'},
        {'name': 'Recommendations', 'description': 'Financial state and recommendation models.'},
        {
            'name': 'Financial analysis',
            'description': 'Integral financial analysis required by the MVP.',
        },
    ],
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'displayOperationId': True,
        'filter': True,
        'persistAuthorization': False,
        'tryItOutEnabled': True,
    },
}

FINCOACH_SESSION_INACTIVITY = timedelta(hours=8)
FINCOACH_SESSION_ABSOLUTE = timedelta(hours=24)

if ENVIRONMENT == 'local':
    FINCOACH_ALLOWED_ORIGINS = [
        'http://localhost:4200',
        'http://127.0.0.1:4200',
    ]
else:
    FINCOACH_ALLOWED_ORIGINS = config('FINCOACH_ALLOWED_ORIGINS', cast=Csv())

SESSION_COOKIE_NAME = (
    'fincoach_session'
    if ENVIRONMENT == 'local'
    else '__Host-fincoach_session'
)
SESSION_COOKIE_AGE = int(FINCOACH_SESSION_INACTIVITY.total_seconds())
SESSION_SAVE_EVERY_REQUEST = True
SESSION_EXPIRE_AT_BROWSER_CLOSE = False
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = ENVIRONMENT == 'production'
SESSION_COOKIE_SAMESITE = 'Strict'
SESSION_COOKIE_PATH = '/'
SESSION_COOKIE_DOMAIN = None

CSRF_COOKIE_SECURE = ENVIRONMENT == 'production'
CSRF_COOKIE_SAMESITE = 'Strict'

SECURE_SSL_REDIRECT = ENVIRONMENT == 'production'
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS = 31536000 if ENVIRONMENT == 'production' else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = ENVIRONMENT == 'production'
SECURE_HSTS_PRELOAD = ENVIRONMENT == 'production'
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'same-origin'
X_FRAME_OPTIONS = 'DENY'
