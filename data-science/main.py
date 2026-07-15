import os
import MySQLdb

# docker compose pasa las credenciales como variables de entorno automáticamente
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "finteligente_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "supersecretpassword123")

def test_conexion():
    print("probando conexión desde Python a MySQL...")
    try:
        conexion = MySQLdb.connect(
            host=DB_HOST,
            port=DB_PORT,
            db=DB_NAME,
            user=DB_USER,
            passwd=DB_PASS
        )
        cursor = conexion.cursor()
        cursor.execute("SELECT VERSION();")
        db_version = cursor.fetchone()
        print("¡Conexión exitosa!")
        print(f"-> Versión de MySQL: {db_version[0]}")
        cursor.close()
        conexion.close()
    except Exception as e:
        print(f"Error al conectar: {e}")

if __name__ == "__main__":
    test_conexion()