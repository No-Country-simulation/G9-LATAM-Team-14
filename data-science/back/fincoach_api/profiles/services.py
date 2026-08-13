from functools import lru_cache
import unicodedata

import joblib
from django.conf import settings
from sklearn.metrics.pairwise import cosine_similarity


EXPECTED_MODEL_VERSION = 'fincoach_usuario_mvp_v2'


@lru_cache(maxsize=1)
def load_user_model():
    model_path = settings.USER_PROFILE_MODEL_PATH
    if not model_path.exists():
        raise FileNotFoundError('The user profile model was not found.')

    artifact = joblib.load(model_path)
    required_keys = {
        'version_modelo',
        'modelo_actividad',
        'vectorizador_catalogo',
        'matriz_catalogo',
        'familias_catalogo',
        'variantes_hobbies',
        'mapa_ocupacion',
        'mapa_codigo_cuoc',
        'modalidades_ingreso',
        'habitos_ahorro',
        'umbral_alcance',
        'peso_modelo',
        'peso_catalogo',
    }
    missing_keys = sorted(required_keys.difference(artifact))
    if missing_keys:
        raise ValueError('The user profile model is incomplete.')
    if artifact['version_modelo'] != EXPECTED_MODEL_VERSION:
        raise ValueError('The user profile model version is not supported.')
    return artifact


def normalize_text(value):
    text = unicodedata.normalize('NFKD', str(value or '').lower())
    text = ''.join(character for character in text if not unicodedata.combining(character))
    text = text.replace('_', ' ').replace('-', ' ')
    return ' '.join(text.split())


def score_activity(artifact, text):
    model = artifact['modelo_actividad']
    probabilities = dict(zip(model.classes_, model.predict_proba([text])[0]))
    vector = artifact['vectorizador_catalogo'].transform([text])
    similarities = cosine_similarity(vector, artifact['matriz_catalogo'])[0]
    catalog_families = artifact['familias_catalogo']
    results = []

    for activity in model.classes_:
        similarity = float(similarities[catalog_families == activity].max())
        probability = float(probabilities[activity])
        confidence = (
            artifact['peso_modelo'] * probability
            + artifact['peso_catalogo'] * similarity
        )
        results.append({
            'actividad': str(activity),
            'confianza': confidence,
            'probabilidad_modelo': probability,
            'similitud_catalogo': similarity,
        })

    return sorted(results, key=lambda result: result['confianza'], reverse=True)


def classify_hobbies(artifact, hobbies):
    visible_hobbies = ' | '.join(hobbies)
    normalized_hobbies = normalize_text(visible_hobbies)
    separated_hobbies = normalized_hobbies
    for separator in ['|', ',', ';']:
        separated_hobbies = separated_hobbies.replace(separator, ' ')
    hobby_words = set(separated_hobbies.split())
    classified = []

    for hobby, variants in artifact['variantes_hobbies'].items():
        for variant in variants:
            normalized_variant = normalize_text(variant)
            matches = (
                normalized_variant in normalized_hobbies
                if ' ' in normalized_variant
                else normalized_variant in hobby_words
            )
            if matches:
                classified.append(hobby)
                break

    out_of_mvp = []
    if normalized_hobbies and not classified:
        out_of_mvp = hobbies
    return classified, out_of_mvp


def build_model_paragraph(data):
    parts = ['Actividad principal declarada: {}.'.format(data['primary_activity'].strip())]
    income = float(data['monthly_net_income'])
    modality = 'sin_ingresos' if income == 0 else data['primary_income_modality']
    parts.append('Estado de ingreso actual: {}.'.format(modality))
    parts.append('Ingreso mensual neto declarado: {:.0f} COP.'.format(income))

    if data['has_additional_income']:
        parts.append('Ingreso adicional: {}.'.format(data['additional_activity'].strip()))
        parts.append(
            'Modalidad del ingreso adicional: {}.'.format(
                data['additional_income_modality'],
            )
        )
    if data['hobbies']:
        parts.append('Hobbies declarados: {}.'.format(' | '.join(data['hobbies'])))
    if data['next_goal']:
        parts.append('Objetivo: {}.'.format(data['next_goal'].strip()))
    if data['financial_responsibility']:
        parts.append(
            'Responsabilidad: {}.'.format(data['financial_responsibility'].strip())
        )
    return ' '.join(parts)


def evaluate_auxiliary_filter(saving_habit):
    return {
        'nunca': 'requiere_validacion_auxiliar',
        'baja': 'seguimiento_auxiliar',
        'media': 'sin_alerta_auxiliar',
        'alta': 'habito_alto_declarado',
    }[saving_habit]


def classify_profile(data):
    artifact = load_user_model()
    declared_activity = data['primary_activity'].strip()
    income = float(data['monthly_net_income'])
    income_modality = 'sin_ingresos' if income == 0 else data['primary_income_modality']
    debt_types = data['debt_types'] or []
    debt_ratio = data['debt_ratio_percentage']

    if income_modality not in artifact['modalidades_ingreso']:
        raise ValueError('The income modality is outside the MVP catalog.')
    if data['saving_habit'] not in artifact['habitos_ahorro']:
        raise ValueError('The saving habit is outside the MVP catalog.')

    if income == 0:
        debt_status = (
            'no_calculable_sin_ingresos'
            if debt_types
            else 'sin_ingresos_sin_pago_observado'
        )
    else:
        debt_status = 'calculado'

    classified_hobbies, out_of_mvp_hobbies = classify_hobbies(
        artifact,
        data['hobbies'],
    )
    activity_results = score_activity(artifact, declared_activity)
    best_result = activity_results[0]
    confidence = best_result['confianza']
    is_in_scope = confidence >= artifact['umbral_alcance']

    top_3_activities = [
        {
            'activity': result['actividad'],
            'percentage': round(result['confianza'] * 100, 2),
        }
        for result in activity_results[:3]
    ]

    secondary_activity = 'no_declarada'
    if data['has_additional_income']:
        additional_result = score_activity(artifact, data['additional_activity'].strip())[0]
        secondary_activity = (
            additional_result['actividad']
            if additional_result['confianza'] >= artifact['umbral_alcance']
            else 'fuera_del_mvp'
        )

    primary_classification = best_result['actividad'] if is_in_scope else 'no_disponible'
    occupation = artifact['mapa_ocupacion'].get(
        primary_classification,
        'no_disponible',
    )
    cuoc_code = artifact['mapa_codigo_cuoc'].get(
        primary_classification,
        'no_disponible',
    )
    return {
        'actividad_declarada': declared_activity,
        'ingreso_mensual_neto': income,
        'estado_ingreso_actual': income_modality,
        'modalidad_ingreso_principal': income_modality,
        'fuente_modalidad': 'declarada_por_usuario',
        'actividad_secundaria': secondary_activity,
        'ingreso_adicional': (
            data['additional_activity'].strip()
            if data['has_additional_income']
            else 'no_declarado'
        ),
        'modalidad_ingreso_adicional': (
            data['additional_income_modality']
            if data['has_additional_income']
            else 'no_declarada'
        ),
        'hobbies_intereses': classified_hobbies or ['no_declarado'],
        'hobbies_fuera_mvp': out_of_mvp_hobbies,
        'meta': data['next_goal'].strip() or 'no_declarada',
        'responsabilidad': (
            data['financial_responsibility'].strip() or 'no_declarada'
        ),
        'tipos_deuda': debt_types or ['sin_deuda'],
        'nivel_endeudamiento_pct': float(debt_ratio) if debt_ratio is not None else None,
        'estado_calculo_endeudamiento': debt_status,
        'habito_ahorro': data['saving_habit'],
        'estado_alcance_mvp': 'dentro_del_mvp' if is_in_scope else 'no_disponible',
        'actividad_principal': primary_classification,
        'ocupacion_cuoc': str(occupation),
        'codigo_cuoc': str(cuoc_code),
        'confianza_actividad_pct': round(confidence * 100, 2),
        'probabilidad_modelo_pct': round(best_result['probabilidad_modelo'] * 100, 2),
        'similitud_catalogo_pct': round(best_result['similitud_catalogo'] * 100, 2),
        'top_3_actividades': top_3_activities,
        'motivo': (
            'Actividad reconocida dentro de las diez ocupaciones del MVP'
            if is_in_scope
            else 'La actividad declarada no alcanzó el 50% dentro del catálogo cerrado del MVP'
        ),
        'principio_etico': (
            'Los datos declarados se conservan sin inventar profesión, ingresos, '
            'hobbies ni responsabilidades.'
        ),
        'version_modelo': artifact['version_modelo'],
    }
