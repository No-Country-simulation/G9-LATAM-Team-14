# FinCoach AI - Módulo de Data Science & Machine Learning

Este repositorio contiene los modelos de Machine Learning y la API REST en Python (FastAPI) para la categorización inteligente de transacciones y el análisis de salud financiera de **FinCoach**.

---

## Arquitectura del Módulo

El directorio está dividido siguiendo el patrón MLOps de separación de responsabilidades:

```text
data-science/
├── api/                           # Microservicio REST en Producción (FastAPI)
│   ├── app/
│   │   ├── main.py                # Endpoints REST y carga de modelos
│   │   └── schemas.py             # DTOs y validaciones de Pydantic
│   ├── models/                    # Binarios de modelos de IA (.pkl / .joblib)
│   ├── Dockerfile                 # Configuración de Docker para producción
│   └── requirements.txt           # Dependencias de Python
│
├── research/                      # Entorno de Investigación & Entrenamiento
│   ├── fincoach-mvp/              # Pipeline completo de Notebooks Jupyter (00 a 06)
│   └── scripts/                   # Scripts de entrenamiento
│       └── train.py               # Script de entrenamiento rápido de modelo SVM
│
└── readme.md                      # Documentación del módulo
```

---

## Cómo Ejecutar la API Localmente

1. Crear un entorno virtual e instalar dependencias:
   ```bash
   cd api
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Ejecutar la API:
   ```bash
   python -m app.main
   # O alternativamente:
   uvicorn app.main:app --reload --port 8000
   ```

3. Probar el endpoint en Swagger UI:
   - Abrir en el navegador: `http://localhost:8000/docs`

---

## Ejecución con Docker

Para construir y levantar el contenedor Docker de la API:

```bash
cd api
docker build -t fincoach-ai-api .
docker run -p 8000:8000 --name fincoach-ai fincoach-ai-api
```
