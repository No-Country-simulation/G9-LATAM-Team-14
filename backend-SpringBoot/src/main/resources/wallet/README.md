# Oracle Autonomous Database Wallet

Esta carpeta está destinada a almacenar las credenciales e instrucciones de conexión **mTLS (Mutual TLS)** de tu instancia de **Oracle Autonomous Database** en Oracle Cloud Infrastructure (OCI).

> [!CAUTION]
> **SEGURIDAD CRÍTICA:** Nunca subas los archivos reales del Wallet (`*.sso`, `*.p12`, `*.ora`, `ojdbc.properties`) al repositorio público o privado de GitHub. Todos esos archivos están ignorados por `.gitignore`.

---

## Instrucciones de Configuración Local y Despliegue

1. Descarga el paquete comprimido del Wallet (`Wallet_fincoachdb.zip`) desde la consola de **Oracle Cloud Infrastructure (OCI)** -> *Autonomous Database* -> *Database Connection* -> *Download Wallet*.
2. Extrae todos los archivos contenidos en el ZIP dentro de esta carpeta (`src/main/resources/wallet/`).
3. Los archivos requeridos que deben quedar ubicados aquí son:
   - `cwallet.sso`
   - `ewallet.p12`
   - `tnsnames.ora`
   - `sqlnet.ora`
   - `ojdbc.properties`
   - `keystore.jks`
   - `truststore.jks`
4. Asegúrate de definir las variables de entorno en el archivo `.env` o la configuración de tu entorno:
   - `DB_URL`: `jdbc:oracle:thin:@fincoachdb_high?TNS_ADMIN=src/main/resources/wallet`
   - `DB_USER`: Tu usuario administrador de Oracle (ej. `ADMIN`).
   - `DB_PASS`: Tu contraseña segura de Oracle Autonomous Database.
