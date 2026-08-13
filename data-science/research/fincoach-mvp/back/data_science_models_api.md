# Documentación Técnica de Integración: Modelos de Ciencia de Datos (Data Science IA)

Este documento especifica únicamente las rutas, contratos de entrada/salida y ubicaciones exactas en el código fuente de los **4 modelos entrenados de Machine Learning (`.joblib`)** creados por el equipo de Ciencia de Datos para su integración con el backend especializado (Java Spring Boot).

---

## 📌 Ubicación General del Módulo Data Science

- **Carpeta Raíz Backend Data Science**: `d:\ProyectosCode\G9-LATAM-Team-14\data-science\research\fincoach-mvp\back\`
- **Proyecto Django Inferencia**: [fincoach_api](file:///d:/ProyectosCode/G9-LATAM-Team-14/data-science/research/fincoach-mvp/back/fincoach_api)
- **Directorio de Modelos Entrenados**: [joblibs](file:///d:/ProyectosCode/G9-LATAM-Team-14/data-science/research/fincoach-mvp/back/fincoach_api/joblibs)
- **Colección de Postman**: [Fincoach.postman_collection.json](file:///d:/ProyectosCode/G9-LATAM-Team-14/data-science/research/fincoach-mvp/back/Fincoach.postman_collection.json)

---

## 🤖 Desglose de los 4 Modelos de Machine Learning

### 1️⃣ Modelo 1: Perfilamiento y Conocimiento del Usuario

- **Archivo Artefacto `.joblib`**: [01_conocimiento_usuario.joblib](file:///d:/ProyectosCode/G9-LATAM-Team-14/data-science/research/fincoach-mvp/back/fincoach_api/joblibs/01_conocimiento_usuario.joblib)
- **Servicio Python (Lógica de Inferencia)**: [profiles/services.py](file:///d:/ProyectosCode/G9-LATAM-Team-14/data-science/research/fincoach-mvp/back/fincoach_api/profiles/services.py#L135-L237) (Función `classify_profile`)
- **Controlador / View**: [profiles/views.py](file:///d:/ProyectosCode/G9-LATAM-Team-14/data-science/research/fincoach-mvp/back/fincoach_api/profiles/views.py)
- **Endpoints REST HTTP**:
  - `POST /api/v1/profiles/` (Crear perfil inicial)
  - `PATCH /api/v1/profiles/me/` (Actualizar perfil)
- **Postman Collection**: Item #5 (`Crear perfil`) & Item #7 (`Actualizar`)

#### Contrato de Entrada (Input Payload)
```json
{
  "monthly_net_income": 3500000,
  "saving_habit": "media",
  "debt_ratio_percentage": 20,
  "debt_types": ["tarjeta de credito"],
  "primary_activity": "Desarrollador de software",
  "primary_income_modality": "fijo",
  "has_additional_income": false,
  "additional_activity": "",
  "additional_income_modality": "",
  "next_goal": "crear fondo de emergencia",
  "hobbies": ["ciclismo", "fotografia"],
  "financial_responsibility": "apoyo familiar"
}
```

#### Contrato de Salida (Output Response)
```json
{
  "actividad_principal": "Desarrollador de software",
  "ocupacion_cuoc": "Desarrolladores y analistas de software y aplicaciones",
  "codigo_cuoc": "2512",
  "estado_alcance_mvp": "dentro_del_mvp",
  "confianza_actividad_pct": 88.5,
  "probabilidad_modelo_pct": 85.0,
  "similitud_catalogo_pct": 92.0,
  "top_3_actividades": [
    { "activity": "Desarrollador de software", "percentage": 88.5 },
    { "activity": "Ingeniero de sistemas", "percentage": 72.1 },
    { "activity": "Técnico en sistemas", "percentage": 65.4 }
  ],
  "habito_ahorro": "media",
  "estado_calculo_endeudamiento": "calculado",
  "version_modelo": "fincoach_usuario_mvp_v2"
}
```

---

### 2️⃣ Modelo 2: Clasificador Contextual de Transacciones

- **Archivo Artefacto `.joblib`**: [02_clasificacion_transacciones.joblib](file:///d:/ProyectosCode/G9-LATAM-Team-14/data-science/research/fincoach-mvp/back/fincoach_api/joblibs/02_clasificacion_transacciones.joblib)
- **Servicio Python (Lógica de Inferencia)**: [transactions/services.py](file:///d:/ProyectosCode/G9-LATAM-Team-14/data-science/research/fincoach-mvp/back/fincoach_api/transactions/services.py#L18-L51) (Función `load_transaction_model`)
- **Controlador / View**: [transactions/views.py](file:///d:/ProyectosCode/G9-LATAM-Team-14/data-science/research/fincoach-mvp/back/fincoach_api/transactions/views.py)
- **Endpoint REST HTTP**: `POST /api/v1/transactions/{id}/classify/`
- **Postman Collection**: Item #9 (`Clasificar`)

#### Contrato de Entrada (Input Payload)
*Transacción a evaluar*:
```json
{
  "transaction_date": "2026-08-03",
  "description": "Compra mercado de la semana",
  "note": "Supermercado Exito",
  "amount": 180000,
  "direction": "salida"
}
```
*Contexto requerido*: Perfil del usuario + Historial de transacciones de los últimos 90 días para similitud cosenoidal de regularidad.

#### Contrato de Salida (Output Response)
```json
{
  "transaction_id": 1,
  "suggested_categories": [
    { "category": "Alimentación", "percentage": 100 }
  ],
  "suggested_purpose": "consumo_personal",
  "suggested_regularity": "variable",
  "requires_confirmation": false,
  "model_confidence_pct": 94.2,
  "version_modelo": "fincoach_transacciones_mvp_v3"
}
```

---

### 3️⃣ Modelo 3: Clasificador de Estado de Trayectoria Financiera

- **Archivo Artefacto `.joblib`**: [04_estados_trayectoria.joblib](file:///d:/ProyectosCode/G9-LATAM-Team-14/data-science/research/fincoach-mvp/back/fincoach_api/joblibs/04_estados_trayectoria.joblib)
- **Servicio Python (Lógica de Inferencia)**: [recommendations/services.py](file:///d:/ProyectosCode/G9-LATAM-Team-14/data-science/research/fincoach-mvp/back/fincoach_api/recommendations/services.py#L33-L55) (Función `load_trajectory_model`)
- **Controlador / View**: [recommendations/views.py](file:///d:/ProyectosCode/G9-LATAM-Team-14/data-science/research/fincoach-mvp/back/fincoach_api/recommendations/views.py)
- **Endpoint REST HTTP**: `GET /api/v1/recommendations/` (Parte 1: Estado)
- **Postman Collection**: Item #20 (`Recomendaciones`)

#### Contrato de Entrada (Metrics & Evidence Context)
Cálculo mensual derivado de transacciones confirmadas:
- Total ingresos, total gastos fijos, total gastos variables, saldo disponible.
- Cobertura de categorías esenciales (`Vivienda`, `Alimentación`, `Salud`, `Servicios`, `Transporte`).

#### Contrato de Salida (Output Response)
```json
{
  "estado_trayectoria": "EN OBSERVACIÓN",
  "confianza_estado_pct": 95.06,
  "cumple_evidencia_minima": true,
  "motivo_estado": "Variación observada en rubros variables con endeudamiento manejable.",
  "version_modelo_estados": "fincoach_estados_trayectoria_mvp_v3"
}
```

---

### 4️⃣ Modelo 4: Motor Guiado de Recomendaciones Personalizadas

- **Archivo Artefacto `.joblib`**: [05_motor_recomendaciones.joblib](file:///d:/ProyectosCode/G9-LATAM-Team-14/data-science/research/fincoach-mvp/back/fincoach_api/joblibs/05_motor_recomendaciones.joblib)
- **Servicio Python (Lógica de Inferencia)**: [recommendations/services.py](file:///d:/ProyectosCode/G9-LATAM-Team-14/data-science/research/fincoach-mvp/back/fincoach_api/recommendations/services.py#L57-L80) (Función `load_recommendation_model`)
- **Controlador / View**: [recommendations/views.py](file:///d:/ProyectosCode/G9-LATAM-Team-14/data-science/research/fincoach-mvp/back/fincoach_api/recommendations/views.py) & [financial_analysis/views.py](file:///d:/ProyectosCode/G9-LATAM-Team-14/data-science/research/fincoach-mvp/back/fincoach_api/financial_analysis/views.py)
- **Endpoints REST HTTP**:
  - `GET /api/v1/recommendations/` (Parte 2: Recomendación)
  - `POST /api/v1/financial-analysis/` (Análisis integral consolidado)
- **Postman Collection**: Item #20 (`Recomendaciones`) & Item #21 (`Análisis`)

#### Contrato de Entrada (Input Context)
- Resultado devuelto por el Modelo 3 (`estado_trayectoria`).
- Contexto declarado del perfil (hábito de ahorro, meta declarada).

#### Contrato de Salida (Output Response)
```json
{
  "recomendacion_id": "REC_002",
  "titulo": "Optimización de gastos de transporte",
  "mensaje_personalizado": "Tus gastos de transporte subieron un 18% este mes. Te sugerimos revisar tus traslados para mantener la trayectoria hacia tu meta.",
  "nivel_prioridad": "alta",
  "tipo_accion": "control_gasto_variable",
  "version_modelo_recomendaciones": "fincoach_recomendaciones_mvp_v3"
}
```

---

## 🔒 Encabezado de Seguridad Obligatorio en Solicitudes de Escritura

Cualquier petición `POST`, `PUT`, `PATCH` o `DELETE` al servicio Python debe incluir:

```http
Content-Type: application/json
X-FinCoach-Request: 1
```
