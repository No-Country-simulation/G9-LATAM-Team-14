import joblib
from pathlib import Path
from sentence_transformers import SentenceTransformer
from sklearn.svm import SVC

# 1. Datos de entrenamiento de prueba
descripciones_ejemplo = [
    "Almuerzo menú ejecutivo en restaurante el paisa", "Cena corporativa en Starbucks", "Compra de hamburguesas de Burger King",
    "Recarga de gasolina en estación Repsol", "Viaje en Uber al aeropuerto", "Peaje autopista central",
    "Factura de luz", "Pago de internet y telefonía Movistar", "Servicio de agua potable",
    "compra supermercado", "compra en H&M", "prestamo a mamá", "compra zapatos", "entradas al cine","pago de Netflix",
    "mensualidad del instituto","alquiler","pago tarjeta","Compra de frutas y verduras en el mercado",
    "Pago de pasaje de bus","Consulta médica en clínica","Cena en restaurante italiano","Gasolina para el auto",
    "Medicinas en la farmacia","Clases de inglés online"
]

categorias_ejemplo = [
    "Alimentación", "Alimentación", "Alimentación",
    "Transporte", "Transporte", "Transporte",
    "Servicios Básicos", "Servicios Básicos", "Servicios Básicos",
    "Alimentación", "Vestimenta", "Donación", "Vestimenta", "Entretenimiento", "Servicios Básicos",
    "Educación", "Vivienda", "Deudas Bancarias", "Alimentación",
    "Transporte", "Salud", "Alimentación", "Transporte",
    "Salud", "Educación"
]

# 2. Convertir texto a números (Embeddings)
print("Generando vectores de entrenamiento...")
encoder = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
vectores = encoder.encode(descripciones_ejemplo, convert_to_numpy=True)

# 3. Entrenar clasificador matemático SVM
print("Entrenando clasificador matemático SVM...")
svm = SVC(kernel='linear', probability=True)
svm.fit(vectores, categorias_ejemplo)

# 4. Guardar el modelo en la carpeta /api/models/ del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_OUTPUT = BASE_DIR / "api" / "models" / "modelo_svm.pkl"
MODEL_OUTPUT.parent.mkdir(parents=True, exist_ok=True)

joblib.dump(svm, MODEL_OUTPUT)
print(f"¡Modelo guardado exitosamente en: {MODEL_OUTPUT}!")