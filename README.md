# Fincoah - G9-LATAM-Team-14

![Banner](./assets/img/Fincoah.png)

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

**Fincoah** es una plataforma inteligente orientada a transformar la gestión financiera personal y empresarial. A través de la integración de Inteligencia Artificial y análisis de datos, el sistema busca simplificar la toma de decisiones financieras, automatizar el seguimiento de transacciones y ofrecer recomendaciones personalizadas para optimizar el ahorro y la inversión. 

## Tecnologías

<table align="center" style="border: none; border-collapse: collapse; width: 100%;">
  <tr style="border: none;">
    <td align="center" valign="top" style="border: none; width: 33%; padding: 10px;">
      <h3>Data Science</h3>
      <table align="center" style="border: none; border-collapse: collapse;">
        <tr>
          <td style="border: none; padding: 5px;"><img src="https://skills-icons.vercel.app/api/icons?i=python" alt="Python" /></td>
          <td style="border: none; padding: 5px;"><img src="https://skills-icons.vercel.app/api/icons?i=mysql" alt="MySQL" /></td>
          <td style="border: none; padding: 5px;"><img src="https://skills-icons.vercel.app/api/icons?i=docker" alt="Docker" /></td>
        </tr>
      </table>
    </td>
    <td align="center" valign="top" style="border: none; width: 33%; padding: 10px;">
      <h3>BackEnd</h3>
      <table align="center" style="border: none; border-collapse: collapse;">
        <tr>
          <td style="border: none; padding: 5px;"><img src="https://skills-icons.vercel.app/api/icons?i=java" alt="Java" /></td>
          <td style="border: none; padding: 5px;"><img src="https://skills-icons.vercel.app/api/icons?i=spring" alt="Spring" /></td>
          <td style="border: none; padding: 5px;"><img src="https://skills-icons.vercel.app/api/icons?i=docker" alt="Docker" /></td>
        </tr>
        <tr>
          <td style="border: none; padding: 5px;"><img src="https://skills-icons.vercel.app/api/icons?i=oracle" alt="Oracle" /></td>
          <td style="border: none; padding: 5px;"><img src="https://skills-icons.vercel.app/api/icons?i=postman" alt="Postman" /></td>
          <td style="border: none; padding: 5px;"></td>
        </tr>
      </table>
    </td>
    <td align="center" valign="top" style="border: none; width: 33%; padding: 10px;">
      <h3>FrontEnd</h3>
      <table align="center" style="border: none; border-collapse: collapse;">
        <tr>
          <td style="border: none; padding: 5px;"><img src="https://skills-icons.vercel.app/api/icons?i=ts" alt="TypeScript" /></td>
          <td style="border: none; padding: 5px;"><img src="https://skills-icons.vercel.app/api/icons?i=angular" alt="Angular" /></td>
          <td style="border: none; padding: 5px;"><img src="https://skills-icons.vercel.app/api/icons?i=tailwind" alt="Tailwind" /></td>
        </tr>
      </table>
    </td>

  </tr>
</table>

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

---
### Frontend
La interfaz de usuario está diseñada para ser rápida, responsiva y escalable.
* **Framework:** Angular (TypeScript) estructurado de forma modular para facilitar la inyección de dependencias y el manejo de estados.
* **Estilos:** Tailwind CSS, permitiendo construir un sistema de diseño consistente, moderno y responsivo directamente mediante clases utilitarias de utilidad rápida.
* **Enfoque de Trabajo:** Consumo eficiente de la API REST mediante servicios reactivos (`RxJS`), asegurando la actualización instantánea de los paneles financieros del usuario sin recargas innecesarias de la página.

## Enlaces Importantes
*   **Despliegue:**
*   **Video de Presentación:**
*   **Diseño en Figma:**
