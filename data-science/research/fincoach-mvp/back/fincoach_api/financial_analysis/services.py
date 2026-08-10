from datetime import timedelta

from django.utils import timezone

from dashboard.services import build_dashboard, shift_month
from recommendations.services import generate_recommendation_response


def build_financial_analysis(user, profile, selected_month):
    dashboard = build_dashboard(user, profile, selected_month)
    month_end = shift_month(selected_month, 1) - timedelta(days=1)
    analysis_date = min(month_end, timezone.localdate())
    model_analysis = generate_recommendation_response(
        user,
        profile,
        reference_date=analysis_date,
    )
    state = model_analysis['financial_state']
    overview = dashboard['overview']
    financial_context = dashboard['financial_context']

    return {
        'month': dashboard['month'],
        'financial_status': {
            'classification': state['challenge_state'],
            'trajectory': state['state'],
            'confidence_percentage': state['confidence_percentage'],
        },
        'summary': {
            'total_income': overview['income'],
            'total_expenses': (
                overview['fixed_expenses']
                + overview['variable_expenses']
            ),
            'fixed_expenses': overview['fixed_expenses'],
            'variable_expenses': overview['variable_expenses'],
            'debt_payments': financial_context['debt_payments'],
            'available_balance': overview['available'],
            'saving_capacity': financial_context['saving_capacity'],
        },
        'top_expense_categories': dashboard['expense_categories'][:4],
        'alerts': dashboard['alerts'],
        'recommendation': model_analysis['recommendation'],
        'evidence': {
            'status': state['status'],
            'observed_period': state['observed_period'],
            'reasons': state['reasons'],
            'main_factors': state['main_factors'],
        },
    }
