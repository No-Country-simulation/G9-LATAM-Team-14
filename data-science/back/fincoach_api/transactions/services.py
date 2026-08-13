from datetime import timedelta
from functools import lru_cache
import unicodedata

import joblib
import numpy as np
import pandas as pd
from django.conf import settings
from django.db.models import Q
from sklearn.metrics.pairwise import cosine_similarity


EXPECTED_MODEL_VERSION = 'fincoach_transacciones_mvp_v3'
EXPECTED_PROFILE_MODEL_VERSION = 'fincoach_usuario_mvp_v2'


@lru_cache(maxsize=1)
def load_transaction_model():
    model_path = settings.TRANSACTION_MODEL_PATH
    if not model_path.exists():
        raise FileNotFoundError('The transaction model was not found.')

    artifact = joblib.load(model_path)
    required_keys = {
        'version_modelo',
        'version_modelo_usuario',
        'modelo_categoria',
        'modelo_finalidad',
        'modelo_regularidad_gastos',
        'modelo_regularidad_ingresos',
        'modelo_confirmacion',
        'umbral_transaccion',
        'umbral_confirmacion',
        'umbral_regularidad',
        'parejas_validas',
        'escala_valor',
        'escala_proporcion',
        'columnas_modelo',
        'columnas_modelo_regularidad',
        'columnas_historial',
        'vectorizador_descripciones_regularidad',
        'matriz_descripciones_regularidad',
        'umbral_similitud_regularidad',
    }
    if required_keys.difference(artifact):
        raise ValueError('The transaction model is incomplete.')
    if artifact['version_modelo'] != EXPECTED_MODEL_VERSION:
        raise ValueError('The transaction model version is not supported.')
    if artifact['version_modelo_usuario'] != EXPECTED_PROFILE_MODEL_VERSION:
        raise ValueError('The transaction and user profile models are incompatible.')
    return artifact


def get_model_catalogs():
    artifact = load_transaction_model()
    return {
        'categories': sorted(
            str(category)
            for category in artifact['modelo_categoria'].classes_
        ),
        'purposes': sorted(
            str(purpose)
            for purpose in artifact['modelo_finalidad'].classes_
        ),
    }


def normalize_text(value):
    text = unicodedata.normalize('NFKD', str(value or '').lower())
    text = ''.join(
        character
        for character in text
        if not unicodedata.combining(character)
    )
    text = text.replace('_', ' ').replace('-', ' ')
    return ' '.join(text.split())


def detect_movement_type(description, direction):
    words = set(normalize_text(description).split())
    is_payment = bool({'pago', 'cuota'} & words)
    is_debt = bool({'credito', 'prestamo'} & words)

    if direction == 'salida' and is_payment and is_debt:
        return 'pago_deuda'
    return 'ingreso_generado' if direction == 'entrada' else 'gasto'


def text_value(value, replacement='no_declarado'):
    if value is None or not str(value).strip():
        return replacement
    return str(value).strip()


def build_profile_context(profile):
    result = profile.model_result or {}
    debt_types = result.get('tipos_deuda') or profile.debt_types or ['sin_deuda']
    if isinstance(debt_types, (list, tuple, set)):
        debt_types = ' | '.join(str(debt) for debt in debt_types)

    hobbies = profile.classified_hobbies or ['no_declarado']
    return {
        'primary_activity': profile.primary_activity_classification,
        'secondary_activity': profile.secondary_activity_classification,
        'income_status': result.get(
            'estado_ingreso_actual',
            profile.primary_income_modality,
        ),
        'monthly_income': float(profile.monthly_net_income),
        'hobbies': ' | '.join(str(hobby) for hobby in hobbies),
        'goal': profile.classified_goal or 'no_declarada',
        'responsibility': profile.classified_responsibility or 'no_declarada',
        'debt_types': debt_types,
        'saving_habit': profile.saving_habit,
        'mvp_scope': profile.mvp_scope_status,
    }


def build_model_text(transaction, context, movement_type):
    parts = [
        'transaccion {}'.format(normalize_text(transaction.description)),
        'nota {}'.format(text_value(transaction.note)),
        'direccion {}'.format(text_value(transaction.direction)),
        'tipo {}'.format(text_value(movement_type)),
        'actividad {}'.format(text_value(context['primary_activity'])),
        'actividad secundaria {}'.format(text_value(context['secondary_activity'])),
        'estado ingreso {}'.format(text_value(context['income_status'])),
        'hobbies {}'.format(text_value(context['hobbies'])),
        'meta {}'.format(text_value(context['goal'], 'no_declarada')),
        'responsabilidad {}'.format(
            text_value(context['responsibility'], 'no_declarada')
        ),
        'deuda {}'.format(text_value(context['debt_types'], 'sin_deuda')),
        'habito ahorro {}'.format(text_value(context['saving_habit'])),
    ]
    return ' | '.join(parts)


def build_regularity_history(transaction):
    normalized_description = normalize_text(transaction.description)
    period_start = transaction.transaction_date - timedelta(days=90)
    previous_transactions = transaction.__class__.objects.filter(
        user=transaction.user,
        status='confirmed',
        direction=transaction.direction,
        transaction_date__gte=period_start,
    ).filter(
        Q(transaction_date__lt=transaction.transaction_date)
        | Q(
            transaction_date=transaction.transaction_date,
            id__lt=transaction.id,
        )
    ).exclude(id=transaction.id).order_by('transaction_date', 'id')
    similar_transactions = [
        previous
        for previous in previous_transactions
        if normalize_text(previous.description) == normalized_description
    ]
    amounts = np.array(
        [float(previous.amount) for previous in similar_transactions],
        dtype=float,
    )
    amount_variation = np.nan
    if len(amounts) >= 2 and float(amounts.mean()) > 0:
        amount_variation = float(amounts.std() / amounts.mean() * 100)

    last_transaction = (
        similar_transactions[-1]
        if similar_transactions
        else None
    )
    return {
        'ocurrencias_previas_90d': float(len(similar_transactions)),
        'meses_previos_con_movimiento': float(len({
            (previous.transaction_date.year, previous.transaction_date.month)
            for previous in similar_transactions
        })),
        'dias_desde_movimiento_similar': (
            float(
                (
                    transaction.transaction_date
                    - last_transaction.transaction_date
                ).days
            )
            if last_transaction
            else np.nan
        ),
        'variacion_valor_previa_pct': amount_variation,
        'historial_disponible_modelo': 1 if similar_transactions else 0,
    }


def classify_transaction(transaction, profile):
    artifact = load_transaction_model()
    context = build_profile_context(profile)
    amount = float(transaction.amount)
    movement_type = detect_movement_type(
        transaction.description,
        transaction.direction,
    )
    model_text = build_model_text(transaction, context, movement_type)
    income_proportion = amount / max(context['monthly_income'], 1)
    model_input = pd.DataFrame([{
        'texto_modelo': model_text,
        'valor_modelo': np.log1p(amount) / artifact['escala_valor'],
        'proporcion_ingreso_modelo': (
            np.log1p(income_proportion) / artifact['escala_proporcion']
        ),
    }])
    regularity_history = build_regularity_history(transaction)
    regularity_input = model_input.assign(**regularity_history)

    category_model = artifact['modelo_categoria']
    purpose_model = artifact['modelo_finalidad']
    regularity_model = (
        artifact['modelo_regularidad_ingresos']
        if transaction.direction == 'entrada'
        else artifact['modelo_regularidad_gastos']
    )
    confirmation_model = artifact['modelo_confirmacion']

    category_probabilities = category_model.predict_proba(model_input)[0]
    purpose_probabilities = purpose_model.predict_proba(model_input)[0]
    regularity_probabilities = regularity_model.predict_proba(
        regularity_input
    )[0]
    rule = 'modelo_contextual'

    if movement_type == 'pago_deuda':
        category_probabilities = np.zeros_like(category_probabilities)
        debt_position = list(category_model.classes_).index('Deuda y financiación')
        category_probabilities[debt_position] = 1.0
        purpose = 'pago_deuda'
        purpose_confidence = 1.0
        rule = 'pago_deuda_explicito'
    else:
        purpose_position = int(np.argmax(purpose_probabilities))
        purpose = str(purpose_model.classes_[purpose_position])
        purpose_confidence = float(purpose_probabilities[purpose_position])

    category_order = np.argsort(category_probabilities)[::-1]
    category = str(category_model.classes_[category_order[0]])
    category_confidence = float(category_probabilities[category_order[0]])
    category_percentages = {
        str(category_model.classes_[position]): round(
            float(category_probabilities[position]) * 100,
            2,
        )
        for position in category_order
    }
    top_categories = [
        {
            'category': str(category_model.classes_[position]),
            'percentage': round(float(category_probabilities[position]) * 100, 2),
        }
        for position in category_order[:4]
        if category_probabilities[position] > 0
    ]

    regularity_position = int(np.argmax(regularity_probabilities))
    regularity = str(regularity_model.classes_[regularity_position])
    regularity_model_confidence = float(
        regularity_probabilities[regularity_position]
    )
    description_vector = artifact[
        'vectorizador_descripciones_regularidad'
    ].transform([normalize_text(transaction.description)])
    description_similarity = float(cosine_similarity(
        description_vector,
        artifact['matriz_descripciones_regularidad'],
    ).max())
    description_known = (
        description_similarity >= artifact['umbral_similitud_regularidad']
    )
    history_available = regularity_history['historial_disponible_modelo'] == 1
    evidence_factor = (
        1.0
        if history_available
        else 0.45 + 0.55 * description_similarity
    )
    regularity_confidence = regularity_model_confidence * evidence_factor
    if not history_available and not description_known:
        regularity_confidence = min(regularity_confidence, 0.49)
    regularity_requires_confirmation = (
        regularity_confidence < artifact['umbral_regularidad']
        or (not history_available and not description_known)
    )

    confirmation_probabilities = confirmation_model.predict_proba(model_input)[0]
    confirmation_position = list(confirmation_model.classes_).index('si')
    confirmation_probability = float(
        confirmation_probabilities[confirmation_position]
    )
    valid_pair = (category, purpose) in artifact['parejas_validas']
    contextual_category = category in [
        'Ocio',
        'Inversión productiva',
        'Trabajo independiente',
    ]
    category_requires_confirmation = (
        category_confidence < artifact['umbral_transaccion']
        or category == 'Otra / ambigua'
        or confirmation_probability >= artifact['umbral_confirmacion']
        or not valid_pair
        or (context['mvp_scope'] == 'no_disponible' and contextual_category)
    )

    if rule == 'pago_deuda_explicito':
        category_requires_confirmation = False
        confirmation_probability = 0.0

    requires_confirmation = (
        category_requires_confirmation
        or regularity_requires_confirmation
    )

    return {
        'movement_type': movement_type,
        'category': category,
        'category_confidence_percentage': round(category_confidence * 100, 2),
        'category_percentages': category_percentages,
        'top_categories': top_categories,
        'purpose': purpose,
        'purpose_confidence_percentage': round(purpose_confidence * 100, 2),
        'regularity': regularity,
        'regularity_confidence_percentage': round(
            regularity_confidence * 100,
            2,
        ),
        'regularity_model_confidence_percentage': round(
            regularity_model_confidence * 100,
            2,
        ),
        'regularity_description_similarity_percentage': round(
            description_similarity * 100,
            2,
        ),
        'regularity_history_available': bool(history_available),
        'regularity_description_known': bool(description_known),
        'regularity_requires_confirmation': bool(
            regularity_requires_confirmation
        ),
        'category_requires_confirmation': bool(
            category_requires_confirmation
        ),
        'regularity_history': {
            key: (
                None
                if pd.isna(value)
                else value
            )
            for key, value in regularity_history.items()
        },
        'requires_confirmation': bool(requires_confirmation),
        'confirmation_probability_percentage': round(
            confirmation_probability * 100,
            2,
        ),
        'category_purpose_pair_valid': bool(valid_pair),
        'rule': rule,
        'model_version': artifact['version_modelo'],
        'profile_context': context,
        'model_text': model_text,
    }
