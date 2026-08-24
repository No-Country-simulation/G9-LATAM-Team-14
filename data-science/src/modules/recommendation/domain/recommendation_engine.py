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
    debt_balance = float(payload.get('debt_balance', 0.0))
    income_status = str(payload.get('income_status', 'fijo'))
    income_variability = max(float(payload.get('income_variability', 0.0)), 0.0)
    periods_without_income = max(int(payload.get('periods_without_income', 0)), 0)
    observed_periods = max(int(payload.get('observed_periods', 1)), 1)
    goal_context = str(payload.get('goal_context', 'no declarado')) or 'no declarado'
    goal_declared = bool(payload.get('goal_declared', False))

    activity = max(income + expenses, 1.0)
    monthly_expenses = expenses / observed_periods if expenses > 0 else 0.0
    coverage = max(balance, 0.0) / monthly_expenses if monthly_expenses > 0 else 0.0
    deficit = max(-balance, 0.0)

    trajectory_row = {
        'balance_relativo_B': balance / activity,
        'presion_relativa_Q': deficit / activity,
        'caida_relativa_M': deficit / activity,
        'tiempo_sin_recuperar_U': 1.0 if balance < 0 else 0.0,
        'recuperacion_R': 0.0 if balance < 0 else 1.0,
        'curvatura_relativa_K': 0.0,
        'variabilidad_ingresos_V': income_variability,
        'cobertura_esencial_L_meses': coverage,
        'dependencia_externa_X': 0.0,
        'crecimiento_deuda_relativo_J': -debt_payments / activity,
        'estado_ingreso_actual': income_status,
    }
    metrics_df = pd.DataFrame([trajectory_row])

    traj_model = traj_artifact['modelo']
    state_probs = traj_model.predict_proba(metrics_df[traj_artifact['variables_modelo']])[0]
    best_state_idx = int(state_probs.argmax())
    state_label = str(traj_model.classes_[best_state_idx])
    state_conf = float(state_probs[best_state_idx])

    state_probabilities = {
        str(label): float(probability) * 100
        for label, probability in zip(traj_model.classes_, state_probs)
    }
    recommendation_row = {
        'estado_modelo': state_label,
        'estado_ingreso_actual': income_status,
        'tiene_deuda': 'si' if debt_balance > 0 else 'no',
        'objetivo_contexto': goal_context,
        'balance_relativo': balance / activity,
        'deuda_relativa': debt_balance / activity,
        'pago_deuda_relativo': debt_payments / activity,
        'periodos_sin_ingreso': periods_without_income,
        'variabilidad_ingresos_V': income_variability,
        'cobertura_esencial_L_meses': coverage,
    }
    for state in traj_model.classes_:
        recommendation_row[f'prob_{state}_pct'] = state_probabilities[str(state)]

    rec_model = rec_artifact['modelo']
    recommendation_df = pd.DataFrame([recommendation_row])
    rec_probs = rec_model.predict_proba(recommendation_df[rec_artifact['variables_modelo']])[0]
    best_rec_idx = int(rec_probs.argmax())
    candidate_code = str(rec_model.classes_[best_rec_idx])
    rec_code = candidate_code
    safeguards = []

    if income_status == 'sin_ingresos':
        rec_code = 'REC_CUIDAR_RECURSOS_SIN_INGRESO'
        safeguards.append('recursos_protegidos_sin_ingresos')
    elif state_label == 'situacion_critica':
        rec_code = 'REC_BUSCAR_APOYO_Y_CONTENER'
        safeguards.append('situacion_critica_con_revision_humana')
    elif state_label == 'fragilidad_sostenida' or coverage < 1.0:
        rec_code = 'REC_PROTEGER_ESENCIALES_Y_DEUDA' if debt_balance > 0 else 'REC_PROTEGER_ESENCIALES'
        safeguards.append('necesidades_esenciales_protegidas')
    elif state_label == 'equilibrio_sostenible':
        rec_code = 'REC_CUIDAR_MARGEN_CON_DEUDA' if debt_balance > 0 else 'REC_CUIDAR_MARGEN'
        safeguards.append('margen_y_deuda_considerados' if debt_balance > 0 else 'margen_considerado')
    elif state_label == 'acumulacion_estable':
        rec_code = 'REC_APARTAR_PARA_META' if goal_declared else 'REC_CREAR_RESPALDO'
        safeguards.append('meta_confirmada' if goal_declared else 'meta_no_supuesta')
    elif state_label == 'variable_resiliente':
        rec_code = 'REC_GUARDAR_EN_MESES_ALTOS'
        safeguards.append('variabilidad_no_tratada_como_riesgo')
    elif state_label == 'uso_planificado_reserva':
        rec_code = 'REC_MEDIR_USO_DE_RESERVA'
        safeguards.append('duracion_de_reserva_considerada')
    elif state_label == 'deterioro_reciente':
        rec_code = 'REC_ENTENDER_CAMBIO_RECIENTE'
        safeguards.append('cambio_reciente_requiere_revision')

    catalog_items = rec_artifact.get('catalogo_recomendaciones', [])
    catalog = {
        item.get('recomendacion_id'): item
        for item in catalog_items
        if isinstance(item, dict) and item.get('recomendacion_id')
    }
    rec_item = catalog.get(rec_code, {})
    state_map = traj_artifact.get('mapeo_estados_reto', {})
    challenge_state = state_map.get(state_label, 'no_disponible')
    selected_probability = next(
        (float(probability) for label, probability in zip(rec_model.classes_, rec_probs) if str(label) == rec_code),
        float(rec_probs[best_rec_idx]),
    )
    state_threshold = float(traj_artifact.get('umbral_confianza', 0.5))
    recommendation_threshold = float(rec_artifact.get('umbral_recomendacion', 0.5))
    state_available = state_conf >= state_threshold
    recommendation_available = state_available and selected_probability >= recommendation_threshold

    main_factors = [
        {'factor': 'Balance del periodo', 'assessment': f'$ {balance:,.0f}'},
        {'factor': 'Cobertura estimada', 'assessment': f'{coverage:.2f} meses'},
        {'factor': 'Variabilidad de ingresos', 'assessment': f'{income_variability * 100:.2f} %'},
        {'factor': 'Pago mensual de deuda', 'assessment': f'$ {debt_payments:,.0f}'},
    ]
    reasons = [
        f'Se analizaron {observed_periods} periodos con un balance acumulado de $ {balance:,.0f}.',
        f'El modelo 04 estimó el estado {state_label} con {state_conf * 100:.2f} % de confianza.',
    ]

    return {
        'financial_state': {
            'status': 'calculated' if state_available else 'requires_confirmation',
            'state': state_label if state_available else 'estado_incierto',
            'challenge_state': challenge_state if state_available else 'no_disponible',
            'confidence_percentage': round(state_conf * 100, 2),
            'model_version': traj_artifact['version_modelo'],
            'main_factors': main_factors,
            'state_percentages': {
                state: round(percentage, 2)
                for state, percentage in sorted(
                    state_probabilities.items(),
                    key=lambda item: item[1],
                    reverse=True,
                )
            },
        },
        'recommendation': {
            'status': 'available' if recommendation_available else 'not_available',
            'code': rec_code if recommendation_available else 'no_disponible',
            'candidate_code': candidate_code,
            'title': rec_item.get('tipo_recomendacion', 'seguimiento').replace('_', ' ').title(),
            'message': rec_item.get('recomendacion', 'Mantén el control de tus gastos fijos y variables para sostener tu trayectoria.')
                if recommendation_available
                else 'No se genera una recomendación hasta alcanzar la confianza mínima.',
            'priority': rec_item.get('prioridad', 'media'),
            'action': rec_item.get('decision', 'revisar') if recommendation_available else 'registrar_mas_evidencia',
            'confidence_percentage': round(selected_probability * 100, 2),
            'model_version': rec_artifact['version_modelo'],
            'related_goal': goal_context if goal_declared else 'No se asumió una meta',
            'applied_safeguards': safeguards,
            'reasons': reasons,
        }
    }
