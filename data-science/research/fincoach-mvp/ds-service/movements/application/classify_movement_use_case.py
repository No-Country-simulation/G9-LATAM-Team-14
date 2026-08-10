from typing import Dict, Any
from movements.domain.model_classifier import ModelClassifier

class ClassifyMovementUseCase:
    @staticmethod
    def execute(
        description: str,
        amount: float,
        direction: str = "salida",
        note: str = ""
    ) -> Dict[str, Any]:
        """Ejecuta la orquestación del caso de uso de clasificación de movimiento."""
        return ModelClassifier.classify(
            description=description,
            amount=amount,
            direction=direction,
            note=note
        )
