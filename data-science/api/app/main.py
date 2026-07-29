import joblib
from pathlib import Path
from fastapi import FastAPI, HTTPException
from sentence_transformers import SentenceTransformer

from app.schemas import LoteGastosInput, LoteGastosOutput, ClasificacionItem

app = FastAPI(title="Clasificador de Gastos SVM - FinCoach AI")

# 1. Cargar el generador de Embeddings (Modelo ultraligero y rápido en CPU)
MODELO_EMBEDDINGS = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "modelo_svm.pkl"

try:
    print("Cargando codificador de texto multilingüe...")
    encoder = SentenceTransformer(MODELO_EMBEDDINGS)

    # 2. Cargar el clasificador SVM previamente entrenado y guardado
    print(f"Cargando clasificador SVM desde {MODEL_PATH}...")
    if MODEL_PATH.exists():
        svm_model = joblib.load(MODEL_PATH)
        print("¡Sistema listo para clasificar!")
    else:
        print(f"⚠️ ADVERTENCIA: No se encontró '{MODEL_PATH}'. Ejecuta primero el script de entrenamiento.")
        svm_model = None
except Exception as e:
    print(f"Error crítico al iniciar los modelos: {e}")
    encoder = None
    svm_model = None

# 3. Endpoint de la API REST
@app.post("/api/v1/clasificar", response_model=LoteGastosOutput)
async def clasificar_gastos_hibrido(payload: LoteGastosInput):
    if not encoder or not svm_model:
        raise HTTPException(status_code=500, detail="Los modelos no están cargados correctamente en el servidor.")
    
    resultados_finales = []
    
    try:
        # Extraer los textos del JSON recibido
        textos = [gasto.descripcion for gasto in payload.transacciones]
        
        # Paso A: Convertir descripciones en vectores numéricos (Embeddings)
        embeddings = encoder.encode(textos)
        
        # Paso B: Predecir las categorías usando el modelo SVM entrenado
        predicciones = svm_model.predict(embeddings)
        
        # Paso C: Obtener la probabilidad/confianza del modelo
        probabilidades = svm_model.predict_proba(embeddings)
        
        # Emparejar resultados con los IDs originales de Spring Boot
        for i, gasto in enumerate(payload.transacciones):
            categoria_predicha = predicciones[i]
            score_confianza = float(max(probabilidades[i]))
            
            resultados_finales.append(ClasificacionItem(
                id_gasto=gasto.id_gasto,
                categoria=categoria_predicha,
                confianza=score_confianza
            ))
            
        return LoteGastosOutput(clasificaciones=resultados_finales)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la clasificación híbrida: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)