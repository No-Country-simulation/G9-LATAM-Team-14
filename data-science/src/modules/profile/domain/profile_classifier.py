from functools import lru_cache
import unicodedata
import joblib
from django.conf import settings
from sklearn.metrics.pairwise import cosine_similarity

EXPECTED_MODEL_VERSION = 'fincoach_usuario_mvp_v2'


@lru_cache(maxsize=1)
def load_profile_artifact():
    path = settings.USER_PROFILE_MODEL_PATH
    if not path.exists():
        raise FileNotFoundError(f"Profile model file not found at {path}")
    artifact = joblib.load(path)
    if artifact.get('version_modelo') != EXPECTED_MODEL_VERSION:
        raise ValueError('Profile model version mismatch.')
    return artifact


def clean_text(text: str) -> str:
    normalized = unicodedata.normalize('NFKD', str(text or '').lower())
    cleaned = ''.join(c for c in normalized if not unicodedata.combining(c))
    return ' '.join(cleaned.replace('_', ' ').replace('-', ' ').split())


def predict_occupational_activity(artifact, activity_name: str):
    cleaned = clean_text(activity_name)
    model = artifact['modelo_actividad']
    probabilities = dict(zip(model.classes_, model.predict_proba([cleaned])[0]))
    vector = artifact['vectorizador_catalogo'].transform([cleaned])
    similarities = cosine_similarity(vector, artifact['matriz_catalogo'])[0]
    catalog_families = artifact['familias_catalogo']
    
    evaluated = []
    for cls in model.classes_:
        sim = float(similarities[catalog_families == cls].max())
        prob = float(probabilities[cls])
        confidence = (artifact['peso_modelo'] * prob) + (artifact['peso_catalogo'] * sim)
        evaluated.append({
            'activity': str(cls),
            'confidence': confidence,
            'probability': prob,
            'similarity': sim
        })
    return sorted(evaluated, key=lambda item: item['confidence'], reverse=True)



def evaluate_hobbies(artifact, raw_hobbies: list):
    normalized = clean_text(' | '.join(raw_hobbies or []))
    words = set(normalized.replace('|', ' ').replace(',', ' ').replace(';', ' ').split())
    classified = []
    for hobby, variants in artifact.get('variantes_hobbies', {}).items():
        for variant in variants:
            clean_variant = clean_text(variant)
            if ' ' in clean_variant:
                match = clean_variant in normalized
            else:
                match = clean_variant in words
            if match:
                classified.append(hobby)
                break
    out_of_mvp = raw_hobbies if (normalized and not classified) else []
    return classified, out_of_mvp


def classify_profile_domain(payload: dict) -> dict:
    artifact = load_profile_artifact()
    primary_activity = str(payload.get('primary_activity', '')).strip()
    income = float(payload.get('monthly_net_income', 0.0))
    modality = 'sin_ingresos' if income == 0 else payload.get('primary_income_modality', 'fijo')
    debts = payload.get('debt_types') or []
    debt_ratio = payload.get('debt_ratio_percentage')
    saving_habit = payload.get('saving_habit', 'media')

    hobbies, out_hobbies = evaluate_hobbies(artifact, payload.get('hobbies'))
    activities = predict_occupational_activity(artifact, primary_activity)
    top_match = activities[0]
    is_supported = top_match['confidence'] >= artifact['umbral_alcance']

    top_3 = [
        {'activity': item['activity'], 'percentage': round(item['confidence'] * 100, 2)}
        for item in activities[:3]
    ]

    primary_cat = top_match['activity'] if is_supported else 'no_disponible'
    occupation = artifact['mapa_ocupacion'].get(primary_cat, 'no_disponible')
    cuoc = artifact['mapa_codigo_cuoc'].get(primary_cat, 'no_disponible')

    return {
        'actividad_declarada': primary_activity,
        'ingreso_mensual_neto': income,
        'estado_ingreso_actual': modality,
        'modalidad_ingreso_principal': modality,
        'actividad_principal': primary_cat,
        'ocupacion_cuoc': str(occupation),
        'codigo_cuoc': str(cuoc),
        'confianza_actividad_pct': round(top_match['confidence'] * 100, 2),
        'probabilidad_modelo_pct': round(top_match['probability'] * 100, 2),
        'similitud_catalogo_pct': round(top_match['similarity'] * 100, 2),
        'top_3_actividades': top_3,
        'hobbies_intereses': hobbies or ['no_declarado'],
        'hobbies_fuera_mvp': out_hobbies,
        'meta': str(payload.get('next_goal', '')).strip() or 'no_declarada',
        'responsabilidad': str(payload.get('financial_responsibility', '')).strip() or 'no_declarada',
        'tipos_deuda': debts or ['sin_deuda'],
        'nivel_endeudamiento_pct': float(debt_ratio) if debt_ratio is not None else None,
        'habito_ahorro': saving_habit,
        'estado_alcance_mvp': 'dentro_del_mvp' if is_supported else 'no_disponible',
        'version_modelo': artifact['version_modelo'],
    }
