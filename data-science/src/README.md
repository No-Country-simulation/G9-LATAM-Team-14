# 🤖 Microservicio de Ciencia de Datos (Data Science API)

Servicio en **Python + Django REST Framework** organizado bajo **Arquitectura por Capas / Modular**, encargado exclusivamente de ejecutar los 4 modelos entrenados de Machine Learning (`.joblib`) para la plataforma **FinCoach**.

---

## 🏛️ Estructura Modular y Arquitectura por Capas

```text
data-science/src/
├── Dockerfile
├── requirements.txt
├── manage.py
├── config/                                     # Configuración global del proyecto Django
│   ├── settings.py
│   └── urls.py
└── modules/
    ├── profile/                                # MÓDULO 1: Conocimiento del Usuario
    │   ├── domain/profile_classifier.py        # Capa de Dominio (Inferencia .joblib 01)
    │   ├── application/classify_profile_service.py # Caso de uso
    │   └── infrastructure/views.py & urls.py   # Endpoint REST: POST /api/v1/profiles/
    │
    ├── transaction/                            # MÓDULO 2: Clasificación de Transacciones
    │   ├── domain/transaction_classifier.py    # Capa de Dominio (Inferencia .joblib 02)
    │   ├── application/classify_transaction_service.py # Caso de uso
    │   └── infrastructure/views.py & urls.py   # Endpoint REST: POST /api/v1/transactions/classify/
    │
    └── recommendation/                         # MÓDULOS 3 & 4: Trayectoria y Recomendaciones
        ├── domain/recommendation_engine.py     # Capa de Dominio (Inferencia .joblib 04 y 05)
        ├── application/generate_recommendation_service.py # Caso de uso
        └── infrastructure/views.py & urls.py   # Endpoint REST: GET/POST /api/v1/recommendations/
```

---

## 🔌 Especificación de Contratos y Endpoints (IA)

### 1️⃣ Modelo 1: Perfilamiento del Usuario (`01_conocimiento_usuario.joblib`)
- **Módulo:** `modules/profile`
- **Endpoint:** `POST /api/v1/profiles/`
- **Función:** Procesa los datos declarados por el usuario en el Onboarding y aplica NLP con similitud de coseno contra el catálogo estandarizado del MVP para clasificar su actividad económica en el estándar **CUOC** (Clasificación Única de Ocupaciones).

#### 📥 Entrada (Payload JSON enviado por Spring Boot):
```json
{
  "monthly_net_income": 3500000.0,
  "saving_habit": "media",
  "debt_ratio_percentage": 15.50,
  "debt_types": ["Tarjeta de crédito", "Crédito personal"],
  "primary_activity": "Desarrollador de software",
  "primary_income_modality": "fijo",
  "next_goal": "vehiculo",
  "hobbies": ["programación", "videojuegos"],
  "financial_responsibility": "independiente"
}
```

#### 📤 Salida (Respuesta JSON devuelta por Python):
```json
{
  "message": "Profile classified successfully.",
  "classification": {
    "actividad_declarada": "Desarrollador de software",
    "actividad_principal": "ingenieria_y_desarrollo_de_software",
    "ocupacion_cuoc": "Desarrolladores y analistas de software y aplicaciones",
    "codigo_cuoc": "2512",
    "confianza_actividad_pct": 95.06,
    "estado_alcance_mvp": "dentro_del_mvp",
    "top_3_actividades": [
      { "activity": "ingenieria_y_desarrollo_de_software", "percentage": 95.06 },
      { "activity": "tecnologias_de_la_informacion", "percentage": 78.20 }
    ],
    "hobbies_intereses": ["tecnologia"],
    "nivel_endeudamiento_pct": 15.50,
    "estado_calculo_endeudamiento": "calculado",
    "version_modelo": "fincoach_usuario_mvp_v2"
  }
}
```

---

### 2️⃣ Modelo 2: Clasificador Contextual de Transacciones (`02_clasificacion_transacciones.joblib`)
- **Módulo:** `modules/transaction`
- **Endpoint:** `POST /api/v1/transactions/classify/`
- **Función:** Combina el texto de la descripción con el perfil del usuario para predecir la categoría principal, la finalidad y determinar si es un gasto/ingreso **fijo o variable** (`regularity`), e indica si requiere revisión manual (`requires_confirmation`).

#### 📥 Entrada (Payload JSON enviado por Spring Boot):
```json
{
  "description": "Supermercado Exito compra mensual",
  "amount": 250000.0,
  "direction": "salida",
  "note": "mercado de la quincena",
  "profile_context": {
    "primary_activity": "ingenieria_y_desarrollo_de_software",
    "monthly_income": 3500000.0,
    "saving_habit": "media"
  }
}
```

#### 📤 Salida (Respuesta JSON devuelta por Python):
```json
{
  "message": "Transaction classified successfully.",
  "status": "awaiting_confirmation",
  "model_suggestion": {
    "movement_type": "gasto",
    "category": "Alimentación",
    "category_confidence_percentage": 88.50,
    "suggested_categories": [
      { "category": "Alimentación", "percentage": 88.50 },
      { "category": "Mercado", "percentage": 8.20 }
    ],
    "purpose": "consumo_personal",
    "regularity": "fijo",
    "requires_confirmation": false,
    "model_version": "fincoach_transacciones_mvp_v3"
  }
}
```

---

### 3️⃣ y 4️⃣ Modelos 3 y 4: Estado de Trayectoria y Recomendaciones (`04_estados_trayectoria.joblib` y `05_motor_recomendaciones.joblib`)
- **Módulo:** `modules/recommendation`
- **Endpoint:** `GET` o `POST /api/v1/recommendations/`
- **Función:**
  - **Modelo 3 (Trayectoria):** Evalúa balance operativo, cobertura esencial y variabilidad de ingresos para predecir la salud financiera (`equilibrio_sostenible`, `en_observacion`, etc.).
  - **Modelo 4 (Recomendaciones):** Toma el estado predicho por el Modelo 3 y aplica guardas de reglas para seleccionar una recomendación financiera personalizada.

#### 📥 Entrada (Parámetros Query o Payload JSON desde Spring Boot):
```json
{
  "total_income": 3500000.0,
  "total_expenses": 2100000.0,
  "debt_payments": 400000.0
}
```

#### 📤 Salida (Respuesta JSON devuelta por Python):
```json
{
  "financial_state": {
    "status": "calculated",
    "state": "equilibrio_sostenible",
    "confidence_percentage": 85.40,
    "model_version": "fincoach_estados_trayectoria_mvp_v3"
  },
  "recommendation": {
    "status": "available",
    "code": "REC_CONSOLIDAR_MARGEN",
    "title": "Optimización Financiera",
    "message": "Mantén el control de tus gastos fijos y variables para sostener tu margen de ahorro.",
    "priority": "media",
    "action": "seguimiento",
    "confidence_percentage": 80.10,
    "model_version": "fincoach_recomendaciones_mvp_v3"
  }
}
```

---

## 🛠️ Ejecución con Docker Compose

Este servicio se construye automáticamente mediante [`environments/compose.yaml`](file:///d:/ProyectosCode/G9-LATAM-Team-14/environments/compose.yaml):

```bash
docker compose up --build data-science
```

Resolución de los archivos `.joblib`: El servicio busca los modelos automáticamente en [`data-science/Modelos/`](file:///d:/ProyectosCode/G9-LATAM-Team-14/data-science/Modelos) o en `data-science/src/joblibs/`.
