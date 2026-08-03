# FinCoach Backend API Documentation

Documentación completa de los endpoints REST del backend en Spring Boot (`backend-SpringBoot`).

- **Base URL (Desarrollo)**: `http://localhost:8080`
- **Autenticación**: Basada en Cookies JWT (`HttpOnly`) o Bearer Token.
- **Formato de datos**: `application/json`

---

## Índice de Módulos

1. [Módulo de Autenticación (`/api/auth`)](#1-módulo-de-autenticación-apiauth)
2. [Módulo de Deudas (`/api/v1/debts`)](#2-módulo-de-deudas-apiv1debts)
3. [Módulo de Onboarding (`/api/v1/onboarding`)](#3-módulo-de-onboarding-apiv1onboarding)
4. [Módulo de Dashboard (`/api/dashboard`)](#4-módulo-de-dashboard-apidashboard)
5. [Módulo de Movimientos (`/api/movements`)](#5-módulo-de-movimientos-apimovements)

---

## 1. Módulo de Autenticación (`/api/auth`)

### 1.1 Registrar Usuario
- **Endpoint**: `POST /api/auth/register`
- **Descripción**: Crea una nueva cuenta de usuario y establece la cookie de sesión JWT.

**Request Body (JSON):**
```json
{
  "username": "usuario_demo",
  "email": "demo@fincoach.com",
  "password": "password123",
  "ingresoMensual": 5000.00
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 28800,
  "user": {
    "id": 1,
    "email": "demo@fincoach.com",
    "nombreUsuario": "usuario_demo"
  }
}
```

---

### 1.2 Iniciar Sesión (Login)
- **Endpoint**: `POST /api/auth/login`
- **Descripción**: Autentica las credenciales del usuario y retorna el token JWT junto con la cookie `HttpOnly`.

**Request Body (JSON):**
```json
{
  "email": "demo@fincoach.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 28800,
  "user": {
    "id": 1,
    "email": "demo@fincoach.com",
    "nombreUsuario": "usuario_demo"
  }
}
```

---

### 1.3 Verificar Sesión Activa (`/me`)
- **Endpoint**: `GET /api/auth/me`
- **Descripción**: Verifica la validez del token JWT enviado en la cookie y retorna la información del usuario autenticado.

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 28800,
  "user": {
    "id": 1,
    "email": "demo@fincoach.com",
    "nombreUsuario": "usuario_demo"
  }
}
```

---

### 1.4 Cerrar Sesión (Logout)
- **Endpoint**: `POST /api/auth/logout`
- **Descripción**: Invalida el token en la lista negra en memoria e inhabilita la cookie JWT.

**Response (200 OK):**
```json
{}
```

---

## 2. Módulo de Deudas (`/api/v1/debts`)

### 2.1 Crear Deuda o Gasto Fijo
- **Endpoint**: `POST /api/v1/debts`
- **Descripción**: Registra una nueva deuda o compromiso financiero.

**Request Body (JSON):**
```json
{
  "type": "INSTALLMENT",
  "category": "Préstamo Personal",
  "totalAmount": 6000.00,
  "monthlyAmount": 500.00,
  "monthsTerm": 12,
  "paymentMode": "FIXED_TERM",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "isIndefinite": false,
  "userId": 1
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "type": "INSTALLMENT",
  "category": "Préstamo Personal",
  "totalAmount": 6000.00,
  "monthlyAmount": 500.00,
  "monthsTerm": 12,
  "paidInstallments": 0,
  "paymentMode": "FIXED_TERM",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "isIndefinite": false,
  "status": "ACTIVE",
  "userId": 1
}
```

---

### 2.2 Listar Deudas (Filtrado por Estado)
- **Endpoint**: `GET /api/v1/debts`
- **Query Params**:
  - `userId` *(opcional, default = 1)*: ID del usuario.
  - `status` *(opcional)*: `ACTIVE` o `PAID`.

**Ejemplo de llamada**: `GET /api/v1/debts?userId=1&status=ACTIVE`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "type": "INSTALLMENT",
    "category": "Préstamo Personal",
    "totalAmount": 6000.00,
    "monthlyAmount": 500.00,
    "monthsTerm": 12,
    "paidInstallments": 6,
    "paymentMode": "FIXED_TERM",
    "startDate": "2026-01-01",
    "endDate": "2026-12-31",
    "isIndefinite": false,
    "status": "ACTIVE",
    "userId": 1
  }
]
```

---

### 2.3 Obtener Resumen de Métricas de Deudas
- **Endpoint**: `GET /api/v1/debts/summary`
- **Query Params**: `userId` *(opcional, default = 1)*
- **Descripción**: Retorna las métricas agregadas (monto pendiente, cuota mensual total, % de ingresos consumidos y fecha estimada de libertad financiera).

**Response (200 OK):**
```json
{
  "totalPendingAmount": 9300.00,
  "totalMonthlyPayment": 1125.00,
  "incomePercentage": 22.5,
  "estimatedFreeDate": "Jun 2028",
  "monthsRemaining": 23
}
```

---

### 2.4 Obtener Curva de Proyección de Deudas
- **Endpoint**: `GET /api/v1/debts/projection`
- **Query Params**: `userId` *(opcional, default = 1)*
- **Descripción**: Proyecta el saldo restante de deudas mes a mes a 12 meses vista para alimentar gráficos interactivos.

**Response (200 OK):**
```json
{
  "projection": [
    { "month": "2026-07", "balance": 9300.00 },
    { "month": "2026-08", "balance": 8175.00 },
    { "month": "2026-09", "balance": 7050.00 }
  ]
}
```

---

### 2.5 Registrar Pago de Cuota (`pay-installment`)
- **Endpoint**: `PATCH /api/v1/debts/{id}/pay-installment`
- **Descripción**: Incrementa el contador de cuotas pagadas y cambia automáticamente el estado a `PAID` si se completa el total de cuotas.

**Response (200 OK):**
```json
{
  "id": 1,
  "category": "Préstamo Personal",
  "paidInstallments": 7,
  "monthsTerm": 12,
  "status": "ACTIVE"
}
```

---

### 2.6 Eliminar Deuda
- **Endpoint**: `DELETE /api/v1/debts/{id}`
- **Response (204 No Content)**

---

## 3. Módulo de Onboarding (`/api/v1/onboarding`)

### 3.1 Creación Masiva de Deudas en Onboarding
- **Endpoint**: `POST /api/v1/onboarding/debts`
- **Descripción**: Permite guardar en un solo lote todas las deudas registradas durante el wizard de onboarding.

**Request Body (JSON):**
```json
{
  "userId": 1,
  "debts": [
    { "category": "Tarjeta de Crédito", "amount": 400.00 },
    { "category": "Alquiler / Vivienda", "amount": 1200.00 }
  ]
}
```

**Response (201 Created):** Array de deudas creadas.

---

## 4. Módulo de Dashboard (`/api/dashboard`)

### 4.1 Obtener Resumen del Dashboard Principal
- **Endpoint**: `GET /api/dashboard/summary`
- **Descripción**: Calcula ingresos del mes, gastos fijos, gastos variables, balance neto, alertas y recomendaciones.

**Response (200 OK):**
```json
{
  "totalIngresos": 5000.00,
  "totalGastosFijos": 1500.00,
  "totalGastosVariables": 800.00,
  "balanceNeto": 2700.00,
  "alertas": [
    "Los gastos fijos superan el 30% de tus ingresos."
  ],
  "recomendaciones": [
    "Buen trabajo con tu ahorro. Considera invertir parte de tu balance."
  ]
}
```

---

## 5. Módulo de Movimientos (`/api/movements`)

### 5.1 Crear Movimiento (Ingreso o Gasto)
- **Endpoint**: `POST /api/movements`

**Request Body (JSON):**
```json
{
  "description": "Pago de nómina",
  "amount": 2500.00,
  "type": "INGRESO",
  "category": "Sueldo",
  "date": "2026-07-30",
  "userId": 1
}
```

---

### 5.2 Listar Todos los Movimientos
- **Endpoint**: `GET /api/movements`
- **Response (200 OK)**: Lista de movimientos.

---

## 6. Módulo de Recomendaciones (`/api/recomendaciones`)

### 6.1 Listar Recomendaciones del Mes
- **Endpoint**: `GET /api/recomendaciones`
- **Descripción**: Obtiene las recomendaciones financieras personalizadas para el usuario autenticado.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "priority": "ALTA",
    "title": "Reducir gastos hormiga",
    "description": "Has realizado múltiples compras pequeñas este mes.",
    "insight": "Podrías ahorrar hasta S/ 200 al mes.",
    "actionLabel": "Ver detalle",
    "impactPoints": 15,
    "completed": false,
    "date": "2026-08-01"
  }
]
```

---

### 6.2 Marcar Recomendación como Completada
- **Endpoint**: `POST /api/recomendaciones/{id}/completar`
- **Descripción**: Marca una recomendación específica como completada y recalcula el score financiero.

**Response (200 OK):**
```json
{
  "score": 750,
  "level": "Buena Salud Financiera",
  "change": 15
}
```

---

## 7. Módulo de Score Financiero (`/api/usuario`)

### 7.1 Obtener Score Financiero del Usuario
- **Endpoint**: `GET /api/usuario/score`
- **Descripción**: Retorna la puntuación financiera actual del usuario autenticado.

**Response (200 OK):**
```json
{
  "score": 750,
  "level": "Buena Salud Financiera",
  "change": 15
}
```

