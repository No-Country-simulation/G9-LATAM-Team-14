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
    object_response,
)

from .services import generate_recommendation_response


logger = logging.getLogger(__name__)


class RecommendationModelsUnavailable(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'The financial state and recommendation models are temporarily unavailable.'
    default_code = 'recommendation_models_unavailable'


class RecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Recommendations'],
        summary='Get the current financial recommendation',
        description=(
            'Evaluates the recent financial trajectory and returns one '
            'evidence-based recommendation or an explicit abstention.'
        ),
        operation_id='recommendations_current',
        responses={
            200: object_response(
                'Current financial state and recommendation.',
                'Financial recommendation',
                {
                    'financial_state': {
                        'status': 'calculated',
                        'state': 'equilibrio_sostenible',
                        'challenge_state': 'saludable',
                        'confidence_percentage': 82.4,
                        'observed_period': {
                            'from': '2026-06-04',
                            'to': '2026-08-03',
                            'days_with_history': 60,
                            'confirmed_transactions': 17,
                        },
                        'main_factors': [],
                        'reasons': [],
                    },
                    'recommendation': {
                        'status': 'available',
                        'code': 'REC_CUIDAR_MARGEN_CON_DEUDA',
                        'message': 'Mantén un margen disponible mientras reduces tus deudas.',
                        'action': 'Separar una parte del saldo disponible.',
                        'confidence_percentage': 78.2,
                        'reasons': [],
                    },
                },
            ),
            401: AUTHENTICATION_ERROR,
            404: NOT_FOUND_ERROR,
            503: MODEL_UNAVAILABLE_ERROR,
        },
    )
    def get(self, request):
        try:
            profile = FinancialProfile.objects.get(user=request.user)
        except FinancialProfile.DoesNotExist as error:
            raise NotFound('The financial profile was not found.') from error

        try:
            result = generate_recommendation_response(request.user, profile)
        except Exception as error:
            logger.exception('The recommendation models could not be executed.')
            raise RecommendationModelsUnavailable() from error
        return Response(result)
