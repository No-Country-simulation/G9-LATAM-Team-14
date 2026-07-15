# Finance AI - G9-LATAM-Team-14

imagen.png

## Enlaces Importantes
*   **Despliegue:**
*   **Video de Presentación:**
*   **Diseño en Figma:**
*   **Tablero de Trabajo (Trello/Jira):**

## 💡 Sobre el Proyecto

**Finance AI** es una plataforma inteligente orientada a transformar la gestión financiera personal y empresarial. A través de la integración de Inteligencia Artificial y análisis de datos, el sistema busca simplificar la toma de decisiones financieras, automatizar el seguimiento de transacciones y ofrecer recomendaciones personalizadas para optimizar el ahorro y la inversión. 

Diseñada bajo una arquitectura de monorepositorio, la solución combina un backend robusto para el procesamiento de datos, un frontend dinámico e intuitivo para una excelente experiencia de usuario, y modelos de análisis avanzados para extraer información de valor en tiempo real.

## 🛠️ Tecnologías por Rol

<table align="center" style="border: none; border-collapse: collapse; width: 100%;">
  <tr style="border: none;">
    <td align="center" valign="top" style="border: none; width: 33%; padding: 10px;">
      <h3>Data Science</h3>
      <a href="https://skills-icons.vercel.app">
        <img src="https://skills-icons.vercel.app/api/icons?i=python,oracle,sqlserver" alt="Data Science Skills" />
      </a>
    </td>
    <td align="center" valign="top" style="border: none; width: 33%; padding: 10px;">
      <h3>BackEnd</h3>
      <a href="https://skills-icons.vercel.app">
        <img src="https://skills-icons.vercel.app/api/icons?i=java,spring,docker,oracle" alt="BackEnd Skills" />
      </a>
    </td>
    <td align="center" valign="top" style="border: none; width: 33%; padding: 10px;">
      <h3>FrontEnd</h3>
      <a href="https://skills-icons.vercel.app">
        <img src="https://skills-icons.vercel.app/api/icons?i=ts,angular,tailwind,oracle" alt="FrontEnd Skills" />
      </a>
    </td>
  </tr>
</table>

## 📁 Arquitectura y Carpetería

Mantenemos un esquema de monorepositorio limpio para facilitar el trabajo en equipo:

```text
G9-LATAM-TEAM-14/
├── backend-SpringBoot/       # API Rest en Spring Boot
├── frontend-Angular/         # Aplicación Angular
│
├── environments/             # Configuraciones
│   └── compose.yml           # Levanta la base de datos local
│
└── README.md                 # Documentación