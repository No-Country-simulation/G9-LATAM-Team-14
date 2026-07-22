# Fincoach - G9-LATAM-Team-14

![Banner](./assets/img/Fincoach.webp)

## Tabla de Contenidos
* [Sobre el Proyecto](#sobre-el-proyecto)
* [Tecnologías](#tecnologías)
* [Estructura del Monorepositorio](#estructura-del-monorepositorio)
* [Diagrama de la Base de Datos](#diagrama-de-la-base-de-datos)
* [Casos de Uso Principales](#casos-de-uso-principales)
* [Documentación Técnica](#documentación-técnica)
  * [Data Science](#data-science)
  * [Backend](#backend)
  * [Frontend](#frontend)
* [Enlaces Importantes](#enlaces-importantes)

## Sobre el Proyecto

**Fincoach** es una plataforma inteligente orientada a transformar la gestión financiera personal y empresarial. A través de la integración de Inteligencia Artificial y análisis de datos, el sistema busca simplificar la toma de decisiones financieras, automatizar el seguimiento de transacciones y ofrecer recomendaciones personalizadas para optimizar el ahorro y la inversión. 

## Tecnologías
<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; text-align: center;">

  <div style="flex: 1 1 200px; max-width: 300px; padding: 10px;">
    <h3>Data Science</h3>
    <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
      <img src="https://skills-icons.vercel.app/api/icons?i=python" alt="Python" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=mysql" alt="MySQL" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=docker" alt="Docker" width="48" height="48" />
    </div>
  </div>

  <div style="flex: 1 1 200px; max-width: 300px; padding: 10px;">
    <h3>BackEnd</h3>
    <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
      <img src="https://skills-icons.vercel.app/api/icons?i=java" alt="Java" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=spring" alt="Spring" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=docker" alt="Docker" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=oracle" alt="Oracle" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=postman" alt="Postman" width="48" height="48" />
    </div>
  </div>

  <div style="flex: 1 1 200px; max-width: 300px; padding: 10px;">
    <h3>FrontEnd</h3>
    <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
      <img src="https://skills-icons.vercel.app/api/icons?i=ts" alt="TypeScript" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=angular" alt="Angular" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=tailwind" alt="Tailwind" width="48" height="48" />
      <img src="https://skills-icons.vercel.app/api/icons?i=docker" alt="Docker" width="48" height="48" />
    </div>
  </div>

</div>

## Estructura del Monorepositorio

El proyecto utiliza una arquitectura de **monorepositorio**, lo que centraliza todo el ciclo de desarrollo en un único lugar. Esto facilita la integración continua, simplifica la gestión de dependencias compartidas y permite coordinar despliegues de infraestructura de manera unificada mediante Docker.

```text
G9-LATAM-TEAM-14/
├── backend-SpringBoot/       # API Rest en Spring Boot
├── frontend-Angular/         # Aplicación Angular
├── environments/             # Configuraciones
│
└── README.md                 # Documentación
```

## Diagrama de la Base de Datos 

![Banner](imagen.png)

## Casos de Uso Principales diagramado

![Banner](imagen.png)

## Documentacion Tecnica
### Data Science / Analyst
Módulo encargado de la recolección, limpieza y procesamiento de datos financieros para alimentar los modelos predictivos de la plataforma.
* **Lenguaje Principal:** Python 3.11.
* **Librerías Clave:** 
  * `pandas` y `numpy` para manipulación de estructuras de datos y cálculos numéricos.
  * `matplotlib` y `seaborn` para la generación de gráficos estadísticos y visualización de patrones de consumo.
  * `MySQLdb` (`mysqlclient`) para la extracción directa de información desde nuestra base de datos relacional.
* **Enfoque de Trabajo:** Creación de scripts automatizados y ETLs empaquetados en contenedores Docker para garantizar la portabilidad del análisis matemático sin requerir instalaciones locales.
---
### Backend
Construido bajo los principios de **Arquitectura Hexagonal** y los patrones **SOLID** para asegurar un código altamente mantenible, desacoplado y fácil de probar de forma aislada.

* **Tecnologías:** Java 17, Spring Boot 3.x y MySQL.
* **Dependencias Base (`pom.xml`):**
  * `spring-boot-starter-data-jpa`: Capa de persistencia y mapeo objeto-relacional (ORM).
  * `spring-boot-starter-validation`: Validación robusta de datos de entrada en las solicitudes de la API.
  * `spring-boot-starter-web`: Creación de endpoints RESTful.
  * `mysql-connector-j` (Anteriormente `ojdbc11`): Conector oficial para nuestra base de datos relacional MySQL.
  * `lombok`: Generación automática de código repetitivo (getters, setters, constructores) para mantener nuestras entidades limpias.
  * `spring-boot-starter-test`: Suite de pruebas unitarias e integración para asegurar la calidad del software.


```text
com.g9latam.team14
├── auth/    
│   ├── application/ 
│   │   └── service/
│   ├── domain/ 
│   │   ├── model/
│   │   └── ports/
│   │       ├── inbound/
│   │       └── outbound/ 
│   └── infrastructure/  
│       ├── adapter/
│       │   ├── inbound/ 
│       │   │   ├── dtos/
│       │   ├── mapper/
│       │   └── outbound/
│       │       ├── database/
│       │       │   ├── mapper/ 
│       │       └── security/
│       └── config/  
│           ├── security/
│           └── AuthModuleConfig.java
├── shared.infrastructure.exception/ 
└── BackendSpringBootApplication.java
```

---
### Frontend
La interfaz de usuario está diseñada para ser rápida, responsiva y escalable.
* **Framework:** Angular 22 (TypeScript 6) estructurado de forma modular para facilitar la inyección de dependencias y el manejo de estados.
* **SSR (Server-Side Rendering):** Angular SSR con Express, permitiendo renderizado del lado del servidor y protección de rutas a nivel de servidor mediante cookies JWT.
* **Estilos:** Tailwind CSS 4, permitiendo construir un sistema de diseño consistente, moderno y responsivo directamente mediante clases utilitarias de utilidad rápida.
* **Enfoque de Trabajo:** Consumo eficiente de la API REST mediante servicios reactivos (`RxJS`), asegurando la actualización instantánea de los paneles financieros del usuario sin recargas innecesarias de la página.

### Librerías Clave & Herramientas

* **`express` & `@angular/ssr`:** Servidor HTTP en Node.js encargado de procesar la aplicación y entregar las vistas renderizadas desde el servidor.
* **`jsonwebtoken` (`@types/jsonwebtoken`):** Validación criptográfica del token JWT en el servidor SSR para restringir el acceso a rutas privadas como `/dashboard`.
* **`dotenv`:** Gestión segura de variables de entorno (`JWT_SECRET`, puertos) en el entorno de servidor Node.js.
* **`rxjs`:** Gestión de estados, suscripciones y peticiones HTTP hacia el Backend.

---

### Arquitectura & Seguridad SSR (Server-Side Rendering)

En lugar de delegar toda la lógica al navegador del cliente (*Single Page Application* convencional), la aplicación utiliza un **servidor Node.js con Express** que actúa como capa intermedia de renderizado y seguridad:

```text
 [ Usuario ] ──── (Petición GET /dashboard) ────> [ Servidor Express (Node) ]
                                                              │
                                                   ¿Tiene Cookie JWT Válida?
                                                  /                         \
                                             (NO)                            (SÍ)
                                              /                                \
                                    [ Redirige 302 a /login ]       [ Renderiza Angular en Servidor ]
```

#### Estructura del Proyecto

```text
src/
├── app/
│   ├── core/ 
│   │   ├── auth/ 
│   │   │   ├── models/
│   │   │   │   └── auth.model.ts      # Interfaces LoginRequest, UserInfo, AuthResponse
│   │   │   └── services/
│   │   │       └── auth.service.ts    # HTTP con signals (currentUser)
│   │   └── services/
│   │
│   ├── features/  
│   │   ├── auth/
│   │   │   ├── auth.html              # Formulario login (email, password, Google)
│   │   │   └── auth.ts                # Componente con FormsModule
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   └── sidebar/
│   │   │   │       ├── sidebar.html
│   │   │   │       └── sidebar.ts
│   │   │   ├── dashboard.html
│   │   │   ├── dashboard.routes.ts
│   │   │   └── dashboard.ts           # Inyecta AuthService, botón logout
│   │   └── landing/
│   │       ├── components/ 
│   │       │   └── header/ 
│   │       │       ├── header.html    # Navbar sticky responsive
│   │       │       └── header.ts
│   │       ├── landing.html
│   │       └── landing.ts 
│   ├── shared/
│   │   ├── components/
│   │   └── pipes/
│   ├── app.config.server.ts           # Config SSR (provideServerRendering)
│   ├── app.config.ts                  # Providers globales (HttpClient, Router)
│   ├── app.html                       # <router-outlet></router-outlet>
│   ├── app.routes.server.ts           # RenderMode.Prerender
│   ├── app.routes.ts                  # Lazy loading: Landing, Auth, Dashboard
│   └── app.ts                         # Root component
├── index.html
├── main.server.ts                     # Bootstrap SSR
├── main.ts                            # Bootstrap navegador
├── server.ts                          # Express SSR + protección rutas JWT
└── styles.css                         # @import 'tailwindcss'
```

## Enlaces Importantes
*   **Despliegue:**
*   **Video de Presentación:**
*   **Diseño en Figma:**
