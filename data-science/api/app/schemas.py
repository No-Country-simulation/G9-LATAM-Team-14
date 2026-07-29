from pydantic import BaseModel
from typing import List

class GastoItem(BaseModel):
    id_gasto: int
    descripcion: str

class LoteGastosInput(BaseModel):
    transacciones: List[GastoItem]

class ClasificacionItem(BaseModel):
    id_gasto: int
    categoria: str
    confianza: float

class LoteGastosOutput(BaseModel):
    clasificaciones: List[ClasificacionItem]
