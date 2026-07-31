# Flujo de Datos y Arquitectura del Backend (Hexagonal + SOLID)

> **Documentación completa de la API**: Consulta la [Guía Completa de Endpoints](API_ENDPOINTS.md) para ver todos los payloads, respuestas y ejemplos cURL.

Este proyecto implementa **Arquitectura Hexagonal** combinada con los principios **SOLID**. El objetivo principal es desacoplar por completo las reglas de negocio (Dominio) de las tecnologías externas (Base de datos, Frameworks, HTTP).

## Diagrama del Flujo de una Petición

Cuando el cliente realiza una solicitud (por ejemplo, al iniciar sesión), el ciclo de vida de los datos sigue estrictamente la siguiente ruta:

```text
 Petición HTTP 
       │
       ▼
    [ DTO ] (Data Transfer Object: Valida la estructura del JSON entrante)
       │
       ▼
 [ Controlador ] (AuthRestController: Recibe HTTP, pero no procesa lógica)
       │
       ▼
 [ Mapeador Inbound ] (Transforma el DTO en un Modelo de Dominio puro)
       │
       ▼
 [ Servicio ] (Caso de Uso / Lógica de Negocio: 100% aislado de Spring)
       │
       ▼
 [ Mapeador Outbound ] (Transforma el Modelo de Dominio en una Entidad JPA)
       │
       ▼
 [ Adaptador Repositorio ] (Implementa el puerto e interactúa con persistencia)
       │
       ▼
 Base de datos MySQL

---

## API de Autenticación (JWT)

### `POST /api/auth/login`

Autentica con correo y contraseña. Devuelve un JWT listo para que el frontend lo envíe en rutas protegidas.

**Request**
```json
{
  "email": "demo@fincoach.com",
  "password": "password123"
}
```

**Response `200 OK`**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "email": "demo@fincoach.com",
    "nombreUsuario": "demo"
  }
}
```

**Uso en el frontend (Angular)**
```typescript
headers: { Authorization: `Bearer ${token}` }
```

**Errores**
- `400` — validación (email inválido, contraseña corta)
- `401` — credenciales incorrectas

**Usuario demo** (ver `environments/fincoah_2026_07_18.sql`):
- Email: `demo@fincoach.com`
- Password: `password123`