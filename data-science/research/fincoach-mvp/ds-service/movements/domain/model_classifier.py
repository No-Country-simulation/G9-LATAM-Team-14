from typing import Dict, Any
import numpy as np
import pandas as pd
from movements.domain.text_normalizer import TextNormalizer
from movements.infrastructure.model_repository import ModelRepository

class ModelClassifier:
    @staticmethod
    def classify(
        description: str,
        amount: float,
        direction: str = "salida",
        note: str = ""
    ) -> Dict[str, Any]:
        artifact = ModelRepository.load_transaction_model()

        dir_clean = "entrada" if str(direction).lower() in ["entrada", "ingreso"] else "salida"
        movement_type = TextNormalizer.detect_movement_type(description, dir_clean)
        model_text = TextNormalizer.build_model_text(description, note or "", dir_clean, movement_type)

        val_amount = max(float(amount), 0.0)
        log_amount = np.log1p(val_amount) / artifact['escala_valor']
        income_proportion = val_amount / 4500000.0
        income_prop = np.log1p(income_proportion) / artifact['escala_proporcion']

        model_input = pd.DataFrame([{
            'texto_modelo': model_text,
            'valor_modelo': log_amount,
            'proporcion_ingreso_modelo': income_prop,
        }])

        regularity_history = {
            'ocurrencias_previas_90d': 0.0,
            'meses_previos_con_movimiento': 0.0,
            'dias_desde_movimiento_similar': np.nan,
            'variacion_valor_previa_pct': np.nan,
            'historial_disponible_modelo': 0,
        }
        regularity_input = model_input.assign(**regularity_history)

        category_model = artifact['modelo_categoria']
        purpose_model = artifact['modelo_finalidad']
        regularity_model = (
            artifact['modelo_regularidad_ingresos']
            if dir_clean == 'entrada'
            else artifact['modelo_regularidad_gastos']
        )
        confirmation_model = artifact['modelo_confirmacion']

        category_probabilities = category_model.predict_proba(model_input)[0]
        purpose_probabilities = purpose_model.predict_proba(model_input)[0]
        regularity_probabilities = regularity_model.predict_proba(regularity_input)[0]

        rule = 'modelo_contextual'
        if movement_type == 'pago_deuda':
            category_probabilities = np.zeros_like(category_probabilities)
            if 'Deuda y financiación' in category_model.classes_:
                debt_pos = list(category_model.classes_).index('Deuda y financiación')
                category_probabilities[debt_pos] = 1.0
            purpose = 'pago_deuda'
            purpose_confidence = 1.0
            rule = 'pago_deuda_explicito'
        else:
            purpose_pos = int(np.argmax(purpose_probabilities))
            purpose = str(purpose_model.classes_[purpose_pos])
            purpose_confidence = float(purpose_probabilities[purpose_pos])

        category_order = np.argsort(category_probabilities)[::-1]
        category = str(category_model.classes_[category_order[0]])
        category_confidence = float(category_probabilities[category_order[0]])
        category_confidence_pct = round(category_confidence * 100, 2)

        # Categorías alternativas para presentar en el frontend
        top_categories = [
            {
                "category": str(category_model.classes_[pos]),
                "percentage": round(float(category_probabilities[pos]) * 100, 2)
            }
            for pos in category_order
            if category_probabilities[pos] > 0
        ]

        # Si la primera categoría es "Otra / ambigua" y hay una alternativa válida de alta confianza, la mostramos
        alternative_cats = [c for c in top_categories if c["category"] != category][:3]
        if not alternative_cats:
            alternative_cats = top_categories[1:4]

        regularity_pos = int(np.argmax(regularity_probabilities))
        regularity = str(regularity_model.classes_[regularity_pos]).lower()

        confirmation_probabilities = confirmation_model.predict_proba(model_input)[0]
        confirmation_pos = list(confirmation_model.classes_).index('si') if 'si' in confirmation_model.classes_ else 0
        confirmation_prob = float(confirmation_probabilities[confirmation_pos])

        valid_pair = (category, purpose) in artifact.get('parejas_validas', set())

        requires_review = (
            category_confidence < artifact.get('umbral_transaccion', 0.75)
            or category == 'Otra / ambigua'
            or confirmation_prob >= artifact.get('umbral_confirmacion', 0.5)
            or not valid_pair
        )

        if rule == 'pago_deuda_explicito':
            requires_review = False

        return {
            "category": category,
            "category_confidence_percentage": category_confidence_pct,
            "alternative_categories": alternative_cats,
            "purpose": purpose,
            "regularity": regularity,
            "model_requires_review": requires_review
        }
