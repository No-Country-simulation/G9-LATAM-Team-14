# Fincoah - Base de Datos (MySQL)

Este repositorio contiene el diseño, esquema y scripts de inicialización de la base de datos para la plataforma de ahorro **Fincoah**.

## 🛠️ Tecnologías y Requisitos
* **Motor:** MySQL 8.0
* **Puerto local por defecto:** 3306

---

## Archivos Clave
* `fincoah_2026_07_18.sql`: Script limpio que crea la base de datos `financiero` y todas sus tablas estructuradas.
* `docker-compose.yml`: Archivo de configuración para levantar el entorno completo de desarrollo de forma automatizada.

---

## Instrucciones de Despliegue

### Opción A: Con Docker
Si usas Docker, el archivo SQL se ejecutará automáticamente al iniciar el contenedor, configurando la base de datos y dejándola lista para el contenedor de `data-science`.

1. Abre tu terminal en la raíz donde está el archivo `docker-compose.yml`.
2. Levanta los servicios con el siguiente comando:
   ```bash
   docker-compose up -d

3. Docker creará la base de datos financiero usando las credenciales configuradas en el entorno.

### Opción B: Ejecución Manual en IDEs (DBeaver / MySQL Workbench)
Si prefieres gestionar o correr el script de forma manual usando herramientas de base de datos de escritorio:

1. Conéctate a tu servidor local de MySQL:

* Host: localhost o 127.0.0.1

* Puerto: 3306

* Usuario: root (o el usuario configurado en tu servicio local)

* Contraseña: Tu contraseña local

2. Ejecutar el script:

* En DBeaver: Ve a Archivo > Abrir archivo, selecciona fincoah_2026_07_18.sql. Luego haz clic derecho en el editor y selecciona Ejecutar > Ejecutar script SQL (o presiona Alt + X).

* En MySQL Workbench: Ve a File > Open SQL Script, abre fincoah_2026_07_18.sql y haz clic en el ícono del rayo para ejecutar todo el documento.

## Credenciales de Conexión (Docker)
Si te vas a conectar a la base de datos levantada por Docker desde tu IDE o código, usa estos datos:

* Host: localhost

* Puerto: 3306

* Database: financiero

* User: postgres

* Password: supersecretpassword123