import logging

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import APIException, NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from profiles.models import FinancialProfile
from fincoach_api.openapi import (
    AUTHENTICATION_ERROR,
    MODEL_UNAVAILABLE_ERROR,
    NOT_FOUND_ERROR,
    SECURITY_HEADER,
    VALIDATION_ERROR,
    object_response,
)

from .serializers import FinancialAnalysisInputSerializer
from .services import build_financial_analysis


logger = logging.getLogger(__name__)


class FinancialAnalysisUnavailable(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'The financial analysis models are temporarily unavailable.'
    default_code = 'financial_analysis_unavailable'


class FinancialAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Financial analysis'],
        summary='Run an integral financial analysis',
        description=(
            'Unifies the selected month totals, expense categories, alerts, '
            'financial trajectory and recommendation for the authenticated user.'
        ),
        operation_id='financial_analysis_create',
        parameters=[SECURITY_HEADER],
        request=FinancialAnalysisInputSerializer,
        responses={
            200: object_response(
                'Integral financial analysis for the selected month.',
                'Integral analysis',
                {
                    'month': '2026-07',
                    'financial_status': {
                        'classification': 'saludable',
                        'trajectory': 'equilibrio_sostenible',
                        'confidence_percentage': 82.4,
                    },
                    'summary': {
                        'total_income': 3500000.0,
                        'total_expenses': 2170000.0,
                        'fixed_expenses': 1290000.0,
                        'variable_expenses': 880000.0,
                        'debt_payments': 150000.0,
                        'available_balance': 1330000.0,
                        'saving_capacity': 1330000.0,
                    },
                    'top_expense_categories': [],
                    'alerts': [],
                    'recommendation': {
                        'status': 'available',
                        'code': 'REC_CUIDAR_MARGEN_CON_DEUDA',
                        'message': 'Mantén un margen disponible mientras reduces tus deudas.',
                    },
                    'evidence': {
                        'status': 'calculated',
                        'observed_period': {
                            'from': '2026-06-01',
                            'to': '2026-07-31',
                            'days_with_history': 57,
                            'confirmed_transactions': 15,
                        },
                        'reasons': [],
                        'main_factors': [],
                    },
                },
            ),
            400: VALIDATION_ERROR,
            401: AUTHENTICATION_ERROR,
            404: NOT_FOUND_ERROR,
            503: MODEL_UNAVAILABLE_ERROR,
        },
    )
    def post(self, request):
        serializer = FinancialAnalysisInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            profile = FinancialProfile.objects.get(user=request.user)
        except FinancialProfile.DoesNotExist as error:
            raise NotFound('The financial profile was not found.') from error

        try:
            result = build_financial_analysis(
                request.user,
                profile,
                serializer.selected_month,
            )
        except Exception as error:
            logger.exception(
                'The integral financial analysis could not be executed.',
            )
            raise FinancialAnalysisUnavailable() from error

        return Response(result)
