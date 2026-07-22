import joblib
import sklearn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from sentence_transformers import SentenceTransformer

app = FastAPI(title="clasificador svm")

# 1. Cargar el generador de Embeddings (Modelo ultraligero y rápido en CPU)
MODELO_EMBEDDINGS = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
try:
    print("Cargando codificador de texto multilingüe...")
    encoder = SentenceTransformer(MODELO_EMBEDDINGS)

    # 2. Cargar el clasificador SVM previamente entrenado y guardado
    
    print("Cargando clasificador SVM desde el disco...")
    svm_model = joblib.load("modelo_svm.pkl")
    print("¡Sistema listo para clasificar!")
except FileNotFoundError:
    print("⚠️ ADVERTENCIA: No se encontró 'modelo_svm.pkl'. Ejecuta primero el script de entrenamiento.")
    svm_model = None
except Exception as e:
    print(f"Error crítico al iniciar los modelos: {e}")
    encoder = None
    svm_model = None

# Contrato de datos JSON con Spring Boot
class GastoItem(BaseModel):
    id_gasto: int
    descripcion: str

class LoteGastosInput(BaseModel):
    transacciones: List[GastoItem]

class ClasificacionItem(BaseModel):
    id_tipo: int
    categoria: str
    confianza: float

class LoteGastosOutput(BaseModel):
    clasificaciones: List[ClasificacionItem]



# 3. Endpoint de la API REST
@app.post("/api/v1/clasificar", response_model=LoteGastosOutput)
async def clasificar_gastos_hibrido(payload: LoteGastosInput):
    if not encoder or not svm_model:
        raise HTTPException(status_code=500, detail="Los modelos no están cargados correctamente.")
    
    resultados_finales = []
    
    try:
        # Extraer los textos del JSON recibido
        textos = [gasto.descripcion for gasto in payload.transacciones]
        
        # Paso A: Convertir descripciones en vectores numéricos (Embeddings)
        embeddings = encoder.encode(textos)
        
        # Paso B: Predecir las categorías usando el modelo SVM entrenado
        predicciones = svm_model.predict(embeddings)
        
        # Paso C: Obtener la probabilidad/confianza del modelo (Requires probability=True al entrenar)
        probabilidades = svm_model.predict_proba(embeddings)
        
        # Emparejar resultados con los IDs originales de Spring Boot
        for i, gasto in enumerate(payload.transacciones):
            categoria_predicha = predicciones[i]
            # Tomamos el valor de probabilidad más alto del array de clases
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
    uvicorn.run(app, host="127.0.0.1", port=8000)
