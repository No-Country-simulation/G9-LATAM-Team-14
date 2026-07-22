import joblib
import sklearn
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.svm import SVC




# 1. Datos de entrenamiento 
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
    "Alimentacion", "Vestimenta", "donacion","vestimenta","Entretenimiento","Servicios Basicos",
    "educacion","vivienda","deudas bancarias","alimentacion",
    "Transporte","Salud","Alimentacion","transporte",
    "Salud","Educacion"
]

# 2. Convertir texto a números (Embeddings)
print("Generando vectores de entrenamiento...")
encoder = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",)
vectores = encoder.encode(descripciones_ejemplo,convert_to_numpy=True)

# 3. Entrenar clasificador matemático SVM
print("Entrenando clasificador matemático...")
# probability=True es obligatorio para que el modelo calcule el porcentaje de confianza
svm = SVC(kernel='linear', probability=True)
svm.fit(vectores, categorias_ejemplo)

# 4. Probar con nuevos gastos
#nuevos_gastos = [
#    "Compra de pollo y arroz",
#   "Taxi al aeropuerto",
#   "Pago de mensualidad del colegio",
#    "Suscripción a Spotify",
#   "credit card"
#]

#X_test = encoder.encode(nuevos_gastos)
#predicciones = svm.predict(X_test)

#for gasto, pred in zip(nuevos_gastos, predicciones):
 #   print(f"Gasto: {gasto} → Categoría predicha: {pred}")
    
# 5. Guardar el cerebro del modelo en un archivo para que FastAPI lo use
joblib.dump(svm, "modelo_svm.pkl")
print("¡Archivo 'modelo_svm.pkl' generado con éxito!")
    
    