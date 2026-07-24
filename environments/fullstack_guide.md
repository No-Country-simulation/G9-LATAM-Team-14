# Fincoach — Guía Fullstack
## Prerrequisitos
### Con Docker
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Docker Compose

### Sin Docker
| Herramienta | Versión | Descarga |
|-------------|---------|----------|
| Java JDK | 21 | [Adoptium](https://adoptium.net/) |
| Maven | 3.9+ | [Apache Maven](https://maven.apache.org/download.cgi) |
| Node.js | 22 | [Node.js](https://nodejs.org/) |
| Python | 3.11 | [Python](https://www.python.org/downloads/) |
| MySQL | 8.0 | [MySQL](https://dev.mysql.com/downloads/mysql/) |
| Git | - | [Git](https://git-scm.com/) |

---

## Opción 1: Con Docker Compose

Usa **Docker** para levantar todo el proyecto sin instalar nada localmente.

### 1. Clonar el repositorio

```bash
git clone https://github.com/G9-LATAM-Team-14/Fincoach.git
cd G9-LATAM-Team-14
```

### 2. Crear archivo `.env` para las contraseñas JWT

Crear archivo `backend-SpringBoot/.env`:
```env
JWT_SECRET=FincoachG9LatamTeam14DevSecretKey2026MustBeAtLeast256BitsLong!!
JWT_EXPIRATION_MS=86400000
```

Crear archivo `frontend-Angular/.env`:
```env
JWT_SECRET=FincoachG9LatamTeam14DevSecretKey2026MustBeAtLeast256BitsLong!!
```

### 3. Levantar todos los servicios

```bash
cd environments
docker compose up -d
```

Este comando levanta **4 servicios** definidos en `environments/compose.yaml`:

| Servicio | Tecnología | Puerto | Propósito |
|----------|-----------|--------|-----------|
| `mysql` | MySQL 8.0 | `3306` | Base de datos relacional |
| `data-science` | Python 3.11 | — | Scripts de análisis de datos |
| `backend` | Spring Boot 4.1 | `8080` | API REST |
| `frontend` | Angular 22 SSR | `4000` | Interfaz de usuario |

### 4. Abrir la aplicación

```
Frontend: http://localhost:4000
Backend:  http://localhost:8080/api/auth
```

### 5. Comandos útiles de Docker

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend

# Detener servicios
docker compose down

# Detener servicios y eliminar volúmenes (borra datos de BD)
docker compose down -v

# Reconstruir imágenes después de cambios
docker compose up -d --build

# Ver estado de los contenedores
docker compose ps
```

### 🏗️ Arquitectura con Docker

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Frontend      │     │    Backend       │     │     MySQL        │
│   Angular 22    │────▶│  Spring Boot     │────▶│    Puerto 3306   │
│   Puerto 4000   │     │   Puerto 8080    │     │  Base: financiero│
│   SSR + Express │     │  JWT + BCrypt    │     │  Tabla: usuarios │
└─────────────────┘     └──────────────────┘     └──────────────────┘
        │                        │
        │                        └────────────────────┐
        │                                             │
        ▼                                             ▼
┌─────────────────┐                          ┌──────────────────┐
│   Navegador     │                          │   Data Science   │
│  (Usuario)      │                          │   Python 3.11    │
└─────────────────┘                          └──────────────────┘
```

---

## Opción 2: Sin Docker (Local)

Cada componente se ejecuta de forma independiente. Ideal para desarrollo y depuración.

---

### 1. MySQL — Base de Datos

#### Instalación
- **Windows:** Descargar [MySQL Installer](https://dev.mysql.com/downloads/installer/) e instalar MySQL Server 8.0
- **macOS:** `brew install mysql`
- **Linux:** `sudo apt install mysql-server`

#### Configuración

```bash
# Conectarse a MySQL como root
mysql -u root -p

# Crear la base de datos
CREATE DATABASE financiero;

# Crear usuario (opcional, pueden usar root)
CREATE USER 'postgres'@'localhost' IDENTIFIED BY 'supersecretpassword123';
GRANT ALL PRIVILEGES ON financiero.* TO 'postgres'@'localhost';
FLUSH PRIVILEGES;

# Salir de MySQL
EXIT;
```

#### Importar la base de datos

```bash
# Desde la raíz del proyecto
mysql -u postgres -p financiero < environments/fincoah_2026_07_18.sql
```

> **Alternativa:** Abrir el archivo `environments/fincoah_2026_07_18.sql` en MySQL Workbench o DBeaver y ejecutarlo.

---

### 2. Backend — Spring Boot (Puerto 8080)

#### Requisitos
- Java 21 JDK instalado (`java -version`)
- Maven instalado (`mvn -version`)

#### Configurar variables de entorno

**Opción A: Archivo `.env`** — Crear `backend-SpringBoot/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=postgres
DB_PASS=supersecretpassword123
DB_NAME=financiero
JWT_SECRET=FincoachG9LatamTeam14DevSecretKey2026MustBeAtLeast256BitsLong!!
JWT_EXPIRATION_MS=86400000
CORS_ORIGINS=http://localhost:4200
```

**Opción B: Variables de sistema (Windows CMD):**
```cmd
set DB_HOST=localhost
set DB_PORT=3306
set DB_USER=postgres
set DB_PASS=supersecretpassword123
set DB_NAME=financiero
set JWT_SECRET=FincoachG9LatamTeam14DevSecretKey2026MustBeAtLeast256BitsLong!!
set JWT_EXPIRATION_MS=86400000
set CORS_ORIGINS=http://localhost:4200
```

**Opción C: Pasar argumentos directo a Maven:**
```bash
cd backend-SpringBoot
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-DDB_HOST=localhost -DDB_PORT=3306 -DDB_USER=postgres -DDB_PASS=supersecretpassword123 -DJWT_SECRET=FincoachG9LatamTeam14DevSecretKey2026MustBeAtLeast256BitsLong!!"
```

#### Ejecutar

```bash
cd backend-SpringBoot

# Si usas .env (con dotenv)
mvn spring-boot:run

# Sin .env, pasar variables directamente
set DB_USER=postgres && set DB_PASS=supersecretpassword123 && mvn spring-boot:run
```

#### Verificar que funciona

```bash
curl http://localhost:8080/api/auth/me
# Debería responder con 401 (no autenticado) — eso significa que el backend está vivo
```

---

### 3. Frontend — Angular (Puerto 4200)

#### Requisitos
- Node.js 22 instalado (`node -v`)
- npm incluido con Node.js (`npm -v`)

#### Instalar dependencias

```bash
cd frontend-Angular
npm install
```

#### Configurar variables de entorno

Crear `frontend-Angular/.env`:
```env
JWT_SECRET=FincoachG9LatamTeam14DevSecretKey2026MustBeAtLeast256BitsLong!!
PORT=4200
```

> ⚠️ El `JWT_SECRET` debe ser **exactamente el mismo** que el del backend, porque el servidor SSR (`server.ts`) también verifica tokens JWT.

#### Ejecutar en modo desarrollo

```bash
cd frontend-Angular
npm start
```

#### Verificar

Abrir en el navegador: `http://localhost:4200`

> El frontend se conecta al backend en `http://localhost:8080/api/auth` (configurado en `auth.service.ts`)

---

### 4. Data Science — Python (Opcional)

#### Requisitos
- Python 3.11 instalado (`python --version`)

#### Instalar dependencias

```bash
cd data-science

# Crear entorno virtual (recomendado)
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instalar librerías
pip install -r requirements.txt
```

#### Ejecutar

```bash
# Asegurarse de que MySQL esté corriendo
python main.py
```

---

### 🔄 Orden de Arranque (Sin Docker)

Para que todo funcione, deben seguir este orden:

```
Paso 1:  MySQL                 → Servicio corriendo en puerto 3306
Paso 2:  Backend Spring Boot   → mvn spring-boot:run (puerto 8080)
Paso 3:  Frontend Angular      → npm start (puerto 4200)
Paso 4:  Data Science          → python main.py (opcional)
```

### Verificar que todo funciona

```bash
# 1. MySQL
mysql -u postgres -p -e "SHOW DATABASES;" | grep financiero

# 2. Backend
curl -I http://localhost:8080/api/auth/me

# 3. Frontend
curl -I http://localhost:4200

# 4. Abrir navegador en
http://localhost:4200
```

---

## Solución de Problemas

### Problemas con Docker

| Síntoma | Solución |
|---------|----------|
| `docker: command not found` | Instalar [Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| `port is already allocated` | Otro servicio está usando el puerto. Detenerlo o cambiar el puerto en `compose.yaml` |
| Contenedor MySQL no arranca | Ejecutar `docker compose logs mysql` para ver el error |
| Backend no conecta a MySQL | Esperar a que MySQL esté healthy (tarda unos segundos) |

### Problemas sin Docker

| Síntoma | Solución |
|---------|----------|
| `mvn: command not found` | Instalar Maven y agregarlo al PATH del sistema |
| `java: command not found` | Instalar Java 21 JDK y configurar `JAVA_HOME` |
| `node: command not found` | Instalar Node.js 22 desde [nodejs.org](https://nodejs.org/) |
| `'mysql' is not recognized` | Agregar MySQL al PATH o usar la ruta completa |
| `Cannot connect to MySQL` | Verificar que el servicio MySQL esté iniciado |
| Backend error `JWT_SECRET` | Crear el archivo `.env` o pasar la variable por consola |
| Frontend error CORS | Backend acepta `http://localhost:4200` por defecto. Si usan otro puerto, cambiar `CORS_ORIGINS` |
| Login no funciona | Verificar que el backend esté corriendo en `http://localhost:8080` |

---

## Hoja de Referencia Rápida

### Docker
```bash
cd environments
docker compose up -d                    # Iniciar todo
docker compose down                     # Detener todo
docker compose up -d --build            # Reconstruir y iniciar
docker compose logs -f backend          # Ver logs del backend
```

### Sin Docker
```bash
# Terminal 1 - Backend
cd backend-SpringBoot
mvn spring-boot:run

# Terminal 2 - Frontend
cd frontend-Angular
npm start

# Navegador
http://localhost:4200
```

---
