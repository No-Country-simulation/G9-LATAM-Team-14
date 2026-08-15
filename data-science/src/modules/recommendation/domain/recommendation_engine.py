from functools import lru_cache
import joblib
import pandas as pd
from django.conf import settings

EXPECTED_TRAJECTORY_MODEL_VERSION = 'fincoach_estados_trayectoria_mvp_v3'
EXPECTED_RECOMMENDATION_MODEL_VERSION = 'fincoach_recomendaciones_mvp_v3'

@lru_cache(maxsize=1)
def load_trajectory_artifact():
    path = settings.TRAJECTORY_MODEL_PATH
    if not path.exists():
        raise FileNotFoundError(f"Trajectory model file not found at {path}")
    artifact = joblib.load(path)
    if artifact.get('version_modelo') != EXPECTED_TRAJECTORY_MODEL_VERSION:
        raise ValueError('Trajectory model version mismatch.')
    return artifact

@lru_cache(maxsize=1)
def load_recommendation_artifact():
    path = settings.RECOMMENDATION_MODEL_PATH
    if not path.exists():
        raise FileNotFoundError(f"Recommendation model file not found at {path}")
    artifact = joblib.load(path)
    if artifact.get('version_modelo') != EXPECTED_RECOMMENDATION_MODEL_VERSION:
        raise ValueError('Recommendation model version mismatch.')
    return artifact

def evaluate_recommendation_domain(payload: dict) -> dict:
    traj_artifact = load_trajectory_artifact()
    rec_artifact = load_recommendation_artifact()

    income = float(payload.get('total_income', 0.0))
    expenses = float(payload.get('total_expenses', 0.0))
    balance = income - expenses
    debt_payments = float(payload.get('debt_payments', 0.0))

    metrics_df = pd.DataFrame([{
        'balance_operativo_B': balance,
        'cobertura_esencial_L_meses': 1.0 if income > expenses else 0.5,
        'variabilidad_ingresos_V': 0.1,
        'deuda_inicial': debt_payments,
        'deuda_final': max(debt_payments - 100, 0),
    }])

    traj_model = traj_artifact['modelo']
    state_probs = traj_model.predict_proba(metrics_df[traj_artifact['variables_numericas']])[0]
    best_state_idx = int(state_probs.argmax())
    state_label = str(traj_model.classes_[best_state_idx])
    state_conf = float(state_probs[best_state_idx])

    rec_model = rec_artifact['modelo']
    rec_probs = rec_model.predict_proba(metrics_df[traj_artifact['variables_numericas']])[0]
    best_rec_idx = int(rec_probs.argmax())
    rec_code = str(rec_model.classes_[best_rec_idx])

    catalog = rec_artifact.get('catalogo_recomendaciones', {})
    rec_item = catalog.get(rec_code, {
        'titulo': 'Optimización Financiera',
        'mensaje': 'Mantén el control de tus gastos fijos y variables para sostener tu trayectoria.',
        'prioridad': 'media',
        'tipo_accion': 'seguimiento'
    })

    return {
        'financial_state': {
            'status': 'calculated',
            'state': state_label,
            'confidence_percentage': round(state_conf * 100, 2),
            'model_version': traj_artifact['version_modelo'],
        },
        'recommendation': {
            'status': 'available',
            'code': rec_code,
            'title': rec_item.get('titulo', 'Optimización Financiera'),
            'message': rec_item.get('mensaje', 'Revisa tus gastos para mantener el saldo disponible.'),
            'priority': rec_item.get('prioridad', 'media'),
            'action': rec_item.get('tipo_accion', 'seguimiento'),
            'confidence_percentage': round(float(rec_probs[best_rec_idx]) * 100, 2),
            'model_version': rec_artifact['version_modelo'],
        }
    }
