from collections import defaultdict
from datetime import timedelta
from functools import lru_cache
import unicodedata

import joblib
import numpy as np
import pandas as pd
from django.conf import settings
from django.utils import timezone

from debts.models import Debt, DebtPayment
from transactions.models import Transaction


TRAJECTORY_MODEL_VERSION = 'fincoach_estados_trayectoria_mvp_v3'
RECOMMENDATION_MODEL_VERSION = 'fincoach_recomendaciones_mvp_v3'
ESSENTIAL_CATEGORIES = {
    'Vivienda',
    'Alimentación',
    'Salud',
    'Servicios',
    'Transporte',
}
EXTERNAL_INCOME_CATEGORIES = {
    'Apoyos recibidos',
    'Deuda y financiación recibida',
    'Transferencias y apoyo',
}


@lru_cache(maxsize=1)
def load_trajectory_model():
    model_path = settings.TRAJECTORY_MODEL_PATH
    if not model_path.exists():
        raise FileNotFoundError('The financial trajectory model was not found.')
    artifact = joblib.load(model_path)
    required_keys = {
        'version_modelo',
        'modelo',
        'variables_modelo',
        'variables_numericas',
        'umbral_confianza',
        'min_dias_trayectoria',
        'min_transacciones_trayectoria',
        'min_pct_clasificable',
        'mapeo_estados_reto',
        'contextos_ingreso_permitidos',
    }
    if required_keys.difference(artifact):
        raise ValueError('The financial trajectory model is incomplete.')
    if artifact['version_modelo'] != TRAJECTORY_MODEL_VERSION:
        raise ValueError('The financial trajectory model version is not supported.')
    return artifact


@lru_cache(maxsize=1)
def load_recommendation_model():
    model_path = settings.RECOMMENDATION_MODEL_PATH
    if not model_path.exists():
        raise FileNotFoundError('The recommendation model was not found.')
    artifact = joblib.load(model_path)
    required_keys = {
        'version_modelo',
        'version_modelo_estados',
        'modelo',
        'variables_modelo',
        'columnas_probabilidad',
        'catalogo_recomendaciones',
        'umbral_estado',
        'umbral_recomendacion',
        'cobertura_esencial_minima_meses',
    }
    if required_keys.difference(artifact):
        raise ValueError('The recommendation model is incomplete.')
    if artifact['version_modelo'] != RECOMMENDATION_MODEL_VERSION:
        raise ValueError('The recommendation model version is not supported.')
    if artifact['version_modelo_estados'] != TRAJECTORY_MODEL_VERSION:
        raise ValueError('The recommendation and trajectory models are incompatible.')
    return artifact


def normalize_text(value):
    text = unicodedata.normalize('NFKD', str(value or '').lower())
    text = ''.join(
        character
        for character in text
        if not unicodedata.combining(character)
    )
    return ' '.join(text.replace('_', ' ').replace('-', ' ').split())


def declared_goal(value):
    return normalize_text(value) not in {
        '',
        'no declarada',
        'no declarado',
        'ninguna',
    }


def category_share(transaction, categories):
    total = 0.0
    selected = transaction.current_categories or []
    for item in selected:
        if item.get('category') in categories:
            total += float(item.get('percentage', 0)) / 100
    return min(max(total, 0.0), 1.0)


def calculate_debt_context(user, period_start, period_end):
    debts = list(Debt.objects.filter(user=user, start_date__lte=period_end))
    payments = list(
        DebtPayment.objects.filter(
            debt__in=debts,
            transaction__status='confirmed',
            transaction__direction='salida',
            transaction__transaction_date__lte=period_end,
        ).select_related('transaction')
    )
    initial = 0.0
    final = 0.0
    payments_in_period = 0.0

    for debt in debts:
        original_amount = float(debt.original_amount)
        debt_payments = [
            payment
            for payment in payments
            if payment.debt_id == debt.id
        ]
        paid_before = sum(
            float(payment.allocated_amount)
            for payment in debt_payments
            if payment.transaction.transaction_date < period_start
        )
        paid_until_end = sum(
            float(payment.allocated_amount)
            for payment in debt_payments
        )
        if debt.start_date < period_start:
            initial += max(original_amount - paid_before, 0.0)
        final += max(original_amount - paid_until_end, 0.0)
        payments_in_period += sum(
            float(payment.allocated_amount)
            for payment in debt_payments
            if period_start <= payment.transaction.transaction_date <= period_end
        )
    return {
        'initial': initial,
        'final': final,
        'payments': payments_in_period,
    }


def build_factors(indicators):
    factors = []
    balance = indicators.get('balance_operativo_B', 0)
    coverage = indicators.get('cobertura_esencial_L_meses', 0)
    variability = indicators.get('variabilidad_ingresos_V', 0)
    initial_debt = indicators.get('deuda_inicial', 0)
    final_debt = indicators.get('deuda_final', 0)

    factors.append({
        'factor': 'operating_balance',
        'assessment': 'positive' if balance >= 0 else 'negative',
    })
    factors.append({
        'factor': 'essential_expense_coverage',
        'assessment': 'sufficient' if coverage >= 1 else 'limited',
    })
    factors.append({
        'factor': 'income_variability',
        'assessment': 'variable' if variability > 0 else 'stable_or_unobserved',
    })
    if final_debt > initial_debt:
        debt_assessment = 'increased'
    elif final_debt < initial_debt:
        debt_assessment = 'decreased'
    else:
        debt_assessment = 'unchanged'
    factors.append({
        'factor': 'debt_balance',
        'assessment': debt_assessment,
    })
    return factors


def insufficient_state(reasons, indicators, period_start, period_end):
    return {
        'calculation_status': 'evidencia_insuficiente',
        'trajectory_state': 'no_disponible',
        'challenge_state': 'no_disponible',
        'most_likely_state': None,
        'confidence_percentage': None,
        'state_percentages': {},
        'reasons': reasons,
        'factors': build_factors(indicators) if indicators else [],
        'period_start': period_start,
        'period_end': period_end,
    }


def evaluate_trajectory(user, profile, reference_date=None):
    artifact = load_trajectory_model()
    period_end = reference_date or timezone.localdate()
    period_start = period_end - timedelta(days=60)
    transactions = list(
        Transaction.objects.filter(
            user=user,
            status='confirmed',
            transaction_date__gte=period_start,
            transaction_date__lte=period_end,
        ).order_by('transaction_date', 'id')
    )
    if not transactions:
        return insufficient_state(
            ['no_confirmed_transactions'],
            {},
            period_start,
            period_end,
        ), {}

    income = sum(
        float(transaction.amount)
        for transaction in transactions
        if transaction.direction == 'entrada'
    )
    expenses = sum(
        float(transaction.amount)
        for transaction in transactions
        if transaction.direction == 'salida'
    )
    activity = income + expenses
    balance = income - expenses
    observed_days = (
        transactions[-1].transaction_date
        - transactions[0].transaction_date
    ).days + 1

    daily_balances = defaultdict(float)
    for transaction in transactions:
        sign = 1 if transaction.direction == 'entrada' else -1
        daily_balances[transaction.transaction_date] += (
            sign * float(transaction.amount)
        )
    accumulated = 0.0
    maximum = 0.0
    maximum_drawdown = 0.0
    last_maximum_date = transactions[0].transaction_date
    for transaction_date, daily_balance in sorted(daily_balances.items()):
        accumulated += daily_balance
        if accumulated >= maximum:
            maximum = accumulated
            last_maximum_date = transaction_date
        maximum_drawdown = max(maximum_drawdown, maximum - accumulated)
    days_without_recovery = (
        (period_end - last_maximum_date).days
        if accumulated < maximum
        else 0
    )

    monthly_income = defaultdict(float)
    for transaction in transactions:
        if transaction.direction == 'entrada':
            key = (transaction.transaction_date.year, transaction.transaction_date.month)
            monthly_income[key] += float(transaction.amount)
    income_values = list(monthly_income.values())
    average_income = float(np.mean(income_values)) if income_values else 0.0
    income_variability = (
        float(np.std(income_values) / average_income)
        if average_income
        else 0.0
    )

    essential_expenses = sum(
        float(transaction.amount)
        * category_share(transaction, ESSENTIAL_CATEGORIES)
        for transaction in transactions
        if transaction.direction == 'salida'
    )
    observed_months = max(len({
        (transaction.transaction_date.year, transaction.transaction_date.month)
        for transaction in transactions
    }), 1)
    monthly_essential_expense = essential_expenses / observed_months
    coverage = (
        max(balance, 0) / monthly_essential_expense
        if monthly_essential_expense
        else 0.0
    )
    recovery = (
        1.0
        if balance >= 0
        else min(1.0, income / expenses) if expenses else 0.0
    )
    external_income = sum(
        float(transaction.amount)
        * category_share(transaction, EXTERNAL_INCOME_CATEGORIES)
        for transaction in transactions
        if transaction.direction == 'entrada'
    )
    external_dependency = external_income / income if income else 0.0
    debt = calculate_debt_context(user, period_start, period_end)
    income_status = (profile.model_result or {}).get(
        'estado_ingreso_actual',
        profile.primary_income_modality,
    )
    goal_is_declared = declared_goal(profile.classified_goal)
    periods_without_income = max(observed_months - len(monthly_income), 0)

    indicators = {
        'dias_observados': observed_days,
        'transacciones_observadas': len(transactions),
        'porcentaje_transacciones_clasificables': 100.0,
        'actividad_A': activity,
        'balance_operativo_B': balance,
        'presion_deficit_Q': max(0.0, -balance),
        'caida_maxima_M': maximum_drawdown,
        'tiempo_sin_recuperar_U_dias': days_without_recovery,
        'recuperacion_R': recovery,
        'curvatura_K': 0.0,
        'variabilidad_ingresos_V': income_variability,
        'cobertura_esencial_L_meses': coverage,
        'dependencia_externa_X': external_dependency,
        'deuda_inicial': debt['initial'],
        'deuda_final': debt['final'],
        'pagos_deuda': debt['payments'],
        'periodos_sin_ingreso': periods_without_income,
        'estado_ingreso_actual': income_status,
        'objetivo_declarado': goal_is_declared,
    }
    reasons = []
    if observed_days < artifact['min_dias_trayectoria']:
        reasons.append('history_shorter_than_minimum_days')
    if len(transactions) < artifact['min_transacciones_trayectoria']:
        reasons.append('fewer_than_minimum_transactions')
    if income_status not in artifact['contextos_ingreso_permitidos']:
        reasons.append('income_context_outside_mvp')
    if activity <= 0:
        reasons.append('financial_activity_not_calculable')
    if reasons:
        return insufficient_state(
            reasons,
            indicators,
            period_start,
            period_end,
        ), indicators

    vector = pd.DataFrame([{
        'balance_relativo_B': balance / activity,
        'presion_relativa_Q': indicators['presion_deficit_Q'] / activity,
        'caida_relativa_M': maximum_drawdown / activity,
        'tiempo_sin_recuperar_U': days_without_recovery / observed_days,
        'recuperacion_R': recovery,
        'curvatura_relativa_K': 0.0,
        'variabilidad_ingresos_V': income_variability,
        'cobertura_esencial_L_meses': coverage,
        'dependencia_externa_X': external_dependency,
        'crecimiento_deuda_relativo_J': (
            (debt['final'] - debt['initial']) / activity
        ),
        'estado_ingreso_actual': income_status,
    }])[artifact['variables_modelo']]
    probabilities = artifact['modelo'].predict_proba(vector)[0]
    position = int(np.argmax(probabilities))
    confidence = float(probabilities[position])
    most_likely_state = str(artifact['modelo'].classes_[position])
    state_percentages = {
        str(state): round(float(probability) * 100, 2)
        for state, probability in zip(
            artifact['modelo'].classes_,
            probabilities,
        )
    }
    trajectory_state = most_likely_state
    calculation_status = 'calculado'
    output_reasons = []
    if confidence < artifact['umbral_confianza']:
        trajectory_state = 'estado_incierto'
        calculation_status = 'requiere_confirmacion'
        output_reasons.append('state_confidence_below_threshold')
    elif most_likely_state == 'uso_planificado_reserva' and not goal_is_declared:
        trajectory_state = 'estado_incierto'
        calculation_status = 'requiere_confirmacion'
        output_reasons.append('reserve_use_without_declared_goal')

    challenge_state = artifact['mapeo_estados_reto'].get(
        trajectory_state,
        'no_disponible',
    )
    if trajectory_state == 'variable_resiliente':
        challenge_state = (
            'saludable'
            if recovery >= 0.5 and coverage >= 1
            else 'en_observacion'
        )
    return {
        'calculation_status': calculation_status,
        'trajectory_state': trajectory_state,
        'challenge_state': challenge_state,
        'most_likely_state': most_likely_state,
        'confidence_percentage': round(confidence * 100, 2),
        'state_percentages': state_percentages,
        'reasons': output_reasons,
        'factors': build_factors(indicators),
        'period_start': period_start,
        'period_end': period_end,
    }, indicators


def abstained_recommendation(reasons):
    return {
        'status': 'not_available',
        'code': None,
        'message': 'No recommendation is generated with the available evidence.',
        'confidence_percentage': None,
        'reasons': reasons,
        'applied_safeguards': [],
    }


def evaluate_recommendation(user, profile, state, indicators):
    artifact = load_recommendation_model()
    activity = float(indicators.get('actividad_A', 0))
    goal = profile.classified_goal or 'no declarado'
    goal_is_declared = declared_goal(goal)
    has_debt = (
        float(indicators.get('deuda_final', 0)) > 0
        or bool(profile.debt_types)
    )
    hobbies = ' | '.join(profile.classified_hobbies or ['no_declarado'])
    model_input = {
        'estado_modelo': state['trajectory_state'],
        'estado_calculo_modelo': state['calculation_status'],
        'confianza_pct': state.get('confidence_percentage'),
        'estado_ingreso_actual': indicators.get(
            'estado_ingreso_actual',
            profile.primary_income_modality,
        ),
        'objetivo_declarado': goal_is_declared,
        'tiene_deuda': 'si' if has_debt else 'no',
        'objetivo_contexto': goal,
        'balance_relativo': (
            float(indicators.get('balance_operativo_B', 0)) / activity
            if activity
            else np.nan
        ),
        'deuda_relativa': (
            float(indicators.get('deuda_final', 0)) / activity
            if activity
            else np.nan
        ),
        'pago_deuda_relativo': (
            float(indicators.get('pagos_deuda', 0)) / activity
            if activity
            else np.nan
        ),
        'periodos_sin_ingreso': indicators.get('periodos_sin_ingreso', 0),
        'variabilidad_ingresos_V': indicators.get(
            'variabilidad_ingresos_V',
            np.nan,
        ),
        'cobertura_esencial_L_meses': indicators.get(
            'cobertura_esencial_L_meses',
            np.nan,
        ),
    }
    for column in artifact['columnas_probabilidad']:
        state_name = column.removeprefix('prob_').removesuffix('_pct')
        model_input[column] = state['state_percentages'].get(
            state_name,
            np.nan,
        )

    reasons = []
    if state['calculation_status'] != 'calculado':
        reasons.append('financial_state_without_sufficient_evidence')
    valid_states = {
        'acumulacion_estable',
        'deterioro_reciente',
        'equilibrio_sostenible',
        'fragilidad_sostenida',
        'situacion_critica',
        'uso_planificado_reserva',
        'variable_resiliente',
    }
    if state['trajectory_state'] not in valid_states:
        reasons.append('financial_state_outside_catalog')
    confidence = state.get('confidence_percentage')
    if confidence is None or confidence < artifact['umbral_estado'] * 100:
        reasons.append('financial_state_confidence_insufficient')
    numeric_fields = [
        'balance_relativo',
        'deuda_relativa',
        'pago_deuda_relativo',
        'periodos_sin_ingreso',
        'variabilidad_ingresos_V',
        'cobertura_esencial_L_meses',
    ]
    if any(pd.isna(model_input[field]) for field in numeric_fields):
        reasons.append('financial_context_incomplete')
    if any(
        pd.isna(model_input[column])
        for column in artifact['columnas_probabilidad']
    ):
        reasons.append('state_probabilities_incomplete')
    if reasons:
        return abstained_recommendation(list(dict.fromkeys(reasons)))

    row = pd.DataFrame([model_input])[artifact['variables_modelo']]
    probabilities = artifact['modelo'].predict_proba(row)[0]
    position = int(np.argmax(probabilities))
    candidate = str(artifact['modelo'].classes_[position])
    recommendation_confidence = float(probabilities[position])
    if recommendation_confidence < artifact['umbral_recomendacion']:
        return abstained_recommendation([
            'recommendation_confidence_insufficient',
        ])

    final = candidate
    safeguards = []
    coverage = float(model_input['cobertura_esencial_L_meses'])
    income_status = model_input['estado_ingreso_actual']
    current_state = model_input['estado_modelo']
    if (
        income_status == 'sin_ingresos'
        and current_state in {
            'fragilidad_sostenida',
            'situacion_critica',
            'uso_planificado_reserva',
        }
    ):
        final = 'REC_CUIDAR_RECURSOS_SIN_INGRESO'
        safeguards.append('protect_resources_without_income')
    elif current_state == 'situacion_critica':
        final = 'REC_BUSCAR_APOYO_Y_CONTENER'
        safeguards.append('critical_situation_requires_human_review')
    elif (
        current_state == 'fragilidad_sostenida'
        or coverage < artifact['cobertura_esencial_minima_meses']
    ):
        final = (
            'REC_PROTEGER_ESENCIALES_Y_DEUDA'
            if has_debt
            else 'REC_PROTEGER_ESENCIALES'
        )
        safeguards.append(
            'protect_essentials_and_debt'
            if has_debt
            else 'protect_essential_needs'
        )
    elif current_state == 'equilibrio_sostenible':
        final = (
            'REC_CUIDAR_MARGEN_CON_DEUDA'
            if has_debt
            else 'REC_CUIDAR_MARGEN'
        )
        safeguards.append(
            'active_debt_considered'
            if has_debt
            else 'available_margin_considered'
        )
    elif current_state == 'acumulacion_estable':
        final = 'REC_APARTAR_PARA_META' if goal_is_declared else 'REC_CREAR_RESPALDO'
        safeguards.append('declared_goal_considered' if goal_is_declared else 'goal_not_assumed')
    elif current_state == 'variable_resiliente':
        final = 'REC_GUARDAR_EN_MESES_ALTOS'
        safeguards.append('income_variability_not_treated_as_risk')
    elif current_state == 'uso_planificado_reserva':
        final = 'REC_MEDIR_USO_DE_RESERVA'
        safeguards.append('reserve_duration_considered')
    elif current_state == 'deterioro_reciente':
        final = 'REC_ENTENDER_CAMBIO_RECIENTE'
        safeguards.append('recent_change_requires_review')
    if hobbies != 'no_declarado':
        safeguards.append('declared_hobbies_preserved')

    catalog = {
        item['recomendacion_id']: item
        for item in artifact['catalogo_recomendaciones']
    }
    if final not in catalog:
        return abstained_recommendation(['recommendation_outside_catalog'])
    card = catalog[final]
    changed_by_safeguard = final != candidate
    if changed_by_safeguard:
        selection_source = 'ethical_safeguard'
    elif safeguards:
        selection_source = 'model_validated_by_safeguards'
    else:
        selection_source = 'restricted_model'
    return {
        'status': 'available',
        'code': final,
        'message': str(card['recomendacion']),
        'action': str(card['decision']),
        'type': str(card['tipo_recomendacion']),
        'priority': str(card['prioridad']),
        'human_review': str(card['revision_humana']),
        'confidence_percentage': (
            None
            if changed_by_safeguard
            else round(recommendation_confidence * 100, 2)
        ),
        'selection_source': selection_source,
        'applied_safeguards': safeguards,
        'related_goal': goal if goal_is_declared else None,
        'reasons': [],
    }


def public_status(value):
    return {
        'calculado': 'calculated',
        'requiere_confirmacion': 'requires_review',
        'evidencia_insuficiente': 'insufficient_evidence',
    }.get(value, value)


def generate_recommendation_response(user, profile, reference_date=None):
    state, indicators = evaluate_trajectory(
        user,
        profile,
        reference_date=reference_date,
    )
    recommendation = evaluate_recommendation(
        user,
        profile,
        state,
        indicators,
    )
    return {
        'financial_state': {
            'status': public_status(state['calculation_status']),
            'state': state['trajectory_state'],
            'challenge_state': state['challenge_state'],
            'confidence_percentage': state['confidence_percentage'],
            'observed_period': {
                'from': state['period_start'],
                'to': state['period_end'],
                'days_with_history': indicators.get('dias_observados', 0),
                'confirmed_transactions': indicators.get(
                    'transacciones_observadas',
                    0,
                ),
            },
            'main_factors': state['factors'],
            'reasons': state['reasons'],
        },
        'recommendation': recommendation,
    }
