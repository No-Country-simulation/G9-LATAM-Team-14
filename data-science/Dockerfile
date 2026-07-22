# permite que corras tus scripts de Python dentro de un contenedor de Docker.
# Así no tienes que instalar Python ni librerías en tu computadora local.
# ¿Cómo se usa?
# 1. Si necesitas librerías nuevas, escríbelas en "requerimientos.txt".
# 2. Tu código principal debe ir en "main.py".
# 3. Para construir la imagen corre: docker build -t g9-data .
# 4. Para ejecutar tu código corre: docker run --rm g9-data

FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Dependencias del sistema para compilar mysqlclient y utilidades de C++
RUN apt-get update && apt-get install -y --no-install-recommends \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -u 8888 -m appuser
WORKDIR /app
COPY --chown=appuser:appuser requerimientos.txt .
RUN pip install --no-cache-dir -r requerimientos.txt
COPY --chown=appuser:appuser . .
USER appuser
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]