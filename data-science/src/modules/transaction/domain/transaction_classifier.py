from functools import lru_cache
import unicodedata
import joblib
import numpy as np
import pandas as pd
from django.conf import settings
from sklearn.metrics.pairwise import cosine_similarity

EXPECTED_TRANSACTION_MODEL_VERSION = 'fincoach_transacciones_mvp_v3'

@lru_cache(maxsize=1)
def load_transaction_artifact():
    path = settings.TRANSACTION_MODEL_PATH
    if not path.exists():
        raise FileNotFoundError(f"Transaction model file not found at {path}")
    artifact = joblib.load(path)
    if artifact.get('version_modelo') != EXPECTED_TRANSACTION_MODEL_VERSION:
        raise ValueError('Transaction model version mismatch.')
    return artifact

def clean_text(text: str) -> str:
    normalized = unicodedata.normalize('NFKD', str(text or '').lower())
    cleaned = ''.join(c for c in normalized if not unicodedata.combining(c))
    return ' '.join(cleaned.replace('_', ' ').replace('-', ' ').split())

def detect_movement_type(description: str, direction: str) -> str:
    words = set(clean_text(description).split())
    is_payment = bool({'pago', 'cuota'} & words)
    is_debt = bool({'credito', 'prestamo'} & words)
    if direction == 'salida' and is_payment and is_debt:
        return 'pago_deuda'
    return 'ingreso_generado' if direction == 'entrada' else 'gasto'

def build_model_text(description: str, note: str, direction: str, movement_type: str, profile_ctx: dict) -> str:
    parts = [
        f"transaccion {clean_text(description)}",
        f"nota {clean_text(note or 'no_declarado')}",
        f"direccion {direction or 'salida'}",
        f"tipo {movement_type}",
        f"actividad {clean_text(profile_ctx.get('primary_activity', 'no_declarado'))}",
        f"actividad secundaria {clean_text(profile_ctx.get('secondary_activity', 'no_declarada'))}",
        f"estado ingreso {clean_text(profile_ctx.get('income_status', 'fijo'))}",
        f"hobbies {clean_text(profile_ctx.get('hobbies', 'no_declarado'))}",
        f"meta {clean_text(profile_ctx.get('goal', 'no_declarada'))}",
        f"responsabilidad {clean_text(profile_ctx.get('responsibility', 'no_declarada'))}",
        f"deuda {clean_text(profile_ctx.get('debt_types', 'sin_deuda'))}",
        f"habito ahorro {clean_text(profile_ctx.get('saving_habit', 'media'))}",
    ]
    return ' | '.join(parts)

def classify_transaction_domain(payload: dict) -> dict:
    artifact = load_transaction_artifact()
    description = payload.get('description', '')
    amount = float(payload.get('amount', 0.0))
    direction = payload.get('direction', 'salida')
    note = payload.get('note', '')
    profile_ctx = payload.get('profile_context') or {}

    movement_type = detect_movement_type(description, direction)
    model_text = build_model_text(description, note, direction, movement_type, profile_ctx)
    monthly_income = float(profile_ctx.get('monthly_income', 3000.0))
    income_prop = amount / max(monthly_income, 1.0)

    model_input = pd.DataFrame([{
        'texto_modelo': model_text,
        'valor_modelo': np.log1p(amount) / artifact['escala_valor'],
        'proporcion_ingreso_modelo': np.log1p(income_prop) / artifact['escala_proporcion'],
    }])

    cat_model = artifact['modelo_categoria']
    purpose_model = artifact['modelo_finalidad']

    cat_probs = cat_model.predict_proba(model_input)[0]
    purpose_probs = purpose_model.predict_proba(model_input)[0]

    if movement_type == 'pago_deuda':
        cat_probs = np.zeros_like(cat_probs)
        debt_idx = list(cat_model.classes_).index('Deuda y financiación')
        cat_probs[debt_idx] = 1.0
        purpose = 'pago_deuda'
        purpose_conf = 1.0
    else:
        purpose_idx = int(np.argmax(purpose_probs))
        purpose = str(purpose_model.classes_[purpose_idx])
        purpose_conf = float(purpose_probs[purpose_idx])

    cat_order = np.argsort(cat_probs)[::-1]
    top_category = str(cat_model.classes_[cat_order[0]])
    top_conf = float(cat_probs[cat_order[0]])

    alternatives = [
        {
            'category': str(cat_model.classes_[idx]),
            'percentage': round(float(cat_probs[idx]) * 100, 2)
        }
        for idx in cat_order[:4]
        if cat_probs[idx] > 0
    ]

    requires_review = top_conf < artifact['umbral_transaccion'] or top_category == 'Otra / ambigua'

    return {
        'movement_type': movement_type,
        'category': top_category,
        'category_confidence_percentage': round(top_conf * 100, 2),
        'suggested_categories': alternatives,
        'purpose': purpose,
        'purpose_confidence_percentage': round(purpose_conf * 100, 2),
        'regularity': 'variable' if direction == 'salida' else 'fijo',
        'requires_confirmation': bool(requires_review),
        'model_version': artifact['version_modelo'],
    }
