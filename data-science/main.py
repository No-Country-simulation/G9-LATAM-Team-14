# clasificador.py
import joblib
import sklearn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from sentence_transformers import SentenceTransformer

app = FastAPI(title="Clasificador SVM de Gastos")

# Umbral mínimo de certeza (50%)
CONFIANZA_MINIMA = 0.5 

# 1. Cargar el generador de Embeddings
MODELO_EMBEDDINGS = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
try:
    print("Cargando codificador de texto multilingüe...")
    encoder = SentenceTransformer(MODELO_EMBEDDINGS)

    print("Cargando clasificador SVM desde el disco...")
    svm_model = joblib.load("models/modelo_svm.pkl")
    print("¡Sistema listo para clasificar!")
except FileNotFoundError:
    print("⚠️ ADVERTENCIA: No se encontró 'modelo_svm.pkl'. Ejecuta primero el script de entrenamiento.")
    svm_model = None
except Exception as e:
    print(f"Error crítico al iniciar los modelos: {e}")
    encoder = None
    svm_model = None

# --- CONTRATO DE DATOS JSON CON SPRING BOOT ---
class GastoItem(BaseModel):
    id_gasto: int
    descripcion: str

class LoteGastosInput(BaseModel):
    transacciones: List[GastoItem]

# BUG CORREGIDO: Se unificó como id_gasto (o id_tipo según acuerden con backend)
class ClasificacionItem(BaseModel):
    id_gasto: int
    categoria: str
    confianza: float

class LoteGastosOutput(BaseModel):
    clasificaciones: List[ClasificacionItem]


# 2. Endpoint de la API REST
@app.post("/api/v1/clasificar", response_model=LoteGastosOutput)
async def clasificar_gastos_hibrido(payload: LoteGastosInput):
    if not encoder or not svm_model:
        raise HTTPException(status_code=500, detail="Los modelos no están cargados correctamente.")
    
    resultados_finales = []
    
    try:
        textos = [gasto.descripcion for gasto in payload.transacciones]
        
        # Paso A: Convertir descripciones en vectores (Embeddings)
        embeddings = encoder.encode(textos)
        
        # Paso B: Predecir categorías y calcular nivel de probabilidad/confianza
        predicciones = svm_model.predict(embeddings)
        probabilidades = svm_model.predict_proba(embeddings)
        
        for i, gasto in enumerate(payload.transacciones):
            categoria_predicha = predicciones[i]
            score_confianza = float(max(probabilidades[i]))
            
            # --- MEJORA: UMBRAL DE CONFIANZA ---
            # Si el modelo duda demasiado (< 50% de certeza), se asigna "Otros"
            if score_confianza < CONFIANZA_MINIMA:
                categoria_predicha = "Otros"
            
            resultados_finales.append(ClasificacionItem(
                id_gasto=gasto.id_gasto,
                categoria=categoria_predicha,
                confianza=score_confianza
            ))
            
        return LoteGastosOutput(clasificaciones=resultados_finales)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la clasificación: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)