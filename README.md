# Fincoach - G9-LATAM-Team-14

![Banner](./assets/img/Fincoach.webp)

## Tabla de Contenidos
* [Sobre el Proyecto](#sobre-el-proyecto)
* [Tecnologías](#tecnologías)
* [Estructura del Monorepositorio](#estructura-del-monorepositorio)
* [Diagrama de la Base de Datos](#diagrama-de-la-base-de-datos)
* [Casos de Uso y Arquitectura](#casos-de-uso-y-arquitectura)
* [Módulos Principales de la Aplicación](#módulos-principales-de-la-aplicación)
* [Documentación Técnica](#documentación-técnica)
  * [Data Science & Machine Learning](#data-science--machine-learning)
  * [Backend (Spring Boot)](#backend-spring-boot)
  * [Frontend (Angular SSR)](#frontend-angular-ssr)
* [Enlaces Importantes](#enlaces-importantes)

---

## Sobre el Proyecto

**Fincoach** es una plataforma inteligente orientada a transformar la gestión financiera personal y empresarial. A través de la integración de Inteligencia Artificial (Machine Learning) y análisis de datos, el sistema busca simplificar la toma de decisiones financieras, automatizar la clasificación de transacciones, calcular la salud financiera del usuario y ofrecer recomendaciones personalizadas para optimizar el ahorro, el control de deudas y la inversión.

---

## Tecnologías

<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; text-align: center;">

  <div style="flex: 1 1 200px; max-width: 300px; padding: 10px;">
    <h3>Data Science & ML</h3>
    <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
      <img src="https://skills-icons.vercel.app/api/icons?i=python" alt="Python" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=django" alt="Django" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=mysql" alt="MySQL" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=docker" alt="Docker" width="48" height="48" />
    </div>
  </div>

  <div style="flex: 1 1 200px; max-width: 300px; padding: 10px;">
    <h3>Backend API</h3>
    <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
      <img src="https://skills-icons.vercel.app/api/icons?i=java" alt="Java 21" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=spring" alt="Spring Boot" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=mysql" alt="MySQL" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=docker" alt="Docker" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=postman" alt="Postman" width="48" height="48" />
    </div>
  </div>

  <div style="flex: 1 1 200px; max-width: 300px; padding: 10px;">
    <h3>Frontend Web</h3>
    <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
      <img src="https://skills-icons.vercel.app/api/icons?i=ts" alt="TypeScript" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=angular" alt="Angular" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=tailwind" alt="Tailwind CSS" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=docker" alt="Docker" width="48" height="48" />
    </div>
  </div>

</div>

---

## Estructura del Monorepositorio

El proyecto utiliza una arquitectura de **monorepositorio**, lo que centraliza todo el ciclo de desarrollo en un único lugar. Esto facilita la integración continua, simplifica la gestión de dependencias y permite coordinar despliegues de infraestructura de manera unificada mediante Docker Compose.

```text
G9-LATAM-TEAM-14/
├── backend-SpringBoot/       # API RESTful Hexagonal en Spring Boot (Java 21)
├── frontend-Angular/         # Aplicación Web SSR en Angular 22 & Tailwind CSS
├── data-science/             # Microservicio de IA en Python & Django REST (Machine Learning)
│   ├── src/                  # Servicio activo de producción (Modelos .joblib)
│   ├── Datasets/             # Datasets de entrenamiento
│   ├── Modelos/              # Artefactos binarios entrenados
│   └── Notebooks/            # Notebooks de exploración y entrenamiento
├── environments/             # Configuraciones de Docker Compose para despliegue
└── README.md                 # Documentación técnica unificada
```

---

## Diagrama de la Base de Datos 

![Diagrama de Base de Datos](./assets/img/database-diagram.png)

---

## Casos de Uso y Arquitectura

![Casos de Uso y Arquitectura General](./assets/img/use-cases-architecture.png)

---

## Módulos Principales de la Aplicación

### 1. Resumen General (Overview)
Vista principal con indicadores dinámicos del estado financiero mensual, tarjetas de ingresos, gastos fijos y variables, saldo disponible y gráficos de dona interactivos.

![Vista Overview](./assets/img/overview-screenshot.png)

### 2. Evolución Financiera
Seguimiento mes a mes con filtro de periodo interactivo, indicador de salud financiera, evaluación de riesgo y gráfico de líneas diario (0 a 100) para el mes seleccionado.

![Vista Evolución Financiera](./assets/img/evolution-screenshot.png)

### 3. Diagnóstico Financiero & Recomendaciones IA
Evaluación integral con score de salud del usuario, clasificación de perfil profesional CUOC y motor de recomendaciones inteligentes impulsado por Inteligencia Artificial.

![Vista Diagnóstico Financiero](./assets/img/finances-screenshot.png)

### 4. Gestión de Deudas
Monitoreo de compromisos de deuda activos y pagados, distribución mensual y proyecciones de amortización.

![Vista Deudas](./assets/img/debts-screenshot.png)

### 5. Registro de Movimientos
Panel de ingresos y gastos con filtrado por tipo, categorías e historial de transacciones.

![Vista Movimientos](./assets/img/movements-screenshot.png)

---

## Documentación Técnica

### Data Science & Machine Learning
Módulo encargado de la carga de modelos predictivos y clasificación en tiempo real mediante algoritmos de Machine Learning.
* **Lenguaje:** Python 3.12 (Django REST Framework).
* **Modelos Entrenados (`.joblib`):**
  * `01_conocimiento_usuario.joblib`: Clasificación de perfil ocupacional y código CUOC con similitud coseno y TF-IDF.
  * `02_clasificacion_transacciones.joblib`: Modelo clasificador de categorías de gastos e ingresos.
  * `04_estados_trayectoria.joblib`: Evaluación de trayectoria financiera y cobertura de balance.
  * `05_motor_recomendaciones.joblib`: Motor de recomendaciones inteligentes personalizadas.
* **Arquitectura Interna:** Capas desacopladas (`domain`, `application`, `infrastructure`).

---

### Backend (Spring Boot)
Construido bajo los principios de **Arquitectura Hexagonal** y patrones **SOLID** para asegurar un código mantenible, modular y testeable.

* **Tecnologías:** Java 21, Spring Boot 3.x, Spring Security, Spring Cache y MySQL.
* **Módulos Hexagonales (`com.g9latam.team14`):**
  * `auth`: Autenticación, JWT y gestión de seguridad de usuarios.
  * `dashboard`: Resumen ejecutivo e indicadores agregados.
  * `evolucion`: Lógica de histórico mensual, puntuaciones diarias y estado de salud financiera.
  * `finances`: Integración con el microservicio de IA para diagnóstico y recomendaciones.
  * `movement`: Gestión de ingresos y gastos.
  * `debt`: Gestión y control de deudas.
  * `shared`: Excepciones globales, utilidades y configuración de memoria caché (`CacheConfig`).

```text
com.g9latam.team14
├── auth/                       # Módulo de Autenticación & Usuarios
├── dashboard/                  # Módulo de Indicadores Overview
├── evolucion/                  # Módulo de Evolución & Histórico Diario
├── finances/                   # Módulo de Diagnóstico e IA
├── movement/                   # Módulo de Ingresos y Egresos
├── debt/                       # Módulo de Gestión de Deudas
└── shared/                     # Configuraciones compartidas, Caché & Excepciones
```

---

### Frontend (Angular SSR)
La interfaz de usuario está diseñada para ser ultra rápida, intuitiva y responsiva en todos los dispositivos.

* **Framework:** Angular 22 (TypeScript 5.x) estructurado de forma modular mediante señales (`signals`, `input()`, `computed()`).
* **SSR (Server-Side Rendering):** Angular SSR con Express Node.js, permitiendo renderizado del lado del servidor y protección de rutas mediante JWT.
* **Estilos:** Vanilla CSS / Tailwind CSS 4 con paleta de colores personalizada, modo oscuro accesible y micro-animaciones.
* **Optimización de Estado:** Servicios reactivos (`RxJS` / Signals) sin recargas de página.

#### Diagrama de Flujo SSR & Seguridad:

```text
 [ Usuario ] ──── (Petición GET /dashboard) ────> [ Servidor Express (Node.js) ]
                                                               │
                                                    ¿Tiene Cookie JWT Válida?
                                                   /                         \
                                              (NO)                            (SÍ)
                                               /                                \
                                     [ Redirige 302 a /login ]       [ Renderiza Angular en Servidor ]
```

---

## Enlaces Importantes
* **Despliegue:** [Enlace de Despliegue](#) *(Próximamente)*
* **Video de Presentación:** [Ver Demo en YouTube](#) *(Próximamente)*
* **Diseño en Figma:** [Ver Prototipo en Figma](#) *(Próximamente)*
