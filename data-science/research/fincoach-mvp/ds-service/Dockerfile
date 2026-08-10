# Dockerfile del Servicio Dedicado de IA - FinCoach DS-Service (Django)
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN useradd -u 8888 -m appuser
WORKDIR /app

COPY --chown=appuser:appuser requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser . .

USER appuser

EXPOSE 8001

CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]
