import os
import psycopg2

# Docker Compose nos pasa las credenciales como variables de entorno automáticamente
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "finteligente_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "supersecretpassword123")

def test_conexion():
    print("probando conexión desde Python a Postgres...")
    try:
        conexion = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        cursor = conexion.cursor()
        cursor.execute("SELECT version();")
        db_version = cursor.fetchone()
        print("¡Conexión exitosa!")
        print(f"-> Versión de Postgres: {db_version[0]}")
        cursor.close()
        conexion.close()
    except Exception as e:
        print(f"Error al conectar: {e}")

if __name__ == "__main__":
    test_conexion()