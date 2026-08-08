from django.db import transaction
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from fincoach_api.openapi import (
    AUTHENTICATION_ERROR,
    SECURITY_HEADER,
    VALIDATION_ERROR,
    object_response,
)

from .models import Debt
from .serializers import DebtInputSerializer
from .services import debt_detail, prepare_debt, summarize_debts


class DebtListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Debts'],
        summary='List debts',
        description=(
            'Returns debt balances, confirmed payments, projected payoff dates '
            'and balance evolution.'
        ),
        operation_id='debts_list',
        responses={
            200: object_response(
                'Debt summary for the authenticated user.',
                'Debt summary',
                {
                    'summary': {
                        'total_outstanding_balance': 1950000.0,
                        'total_monthly_payment': 224286.02,
                        'projected_end_date': '2027-05-03',
                        'active_debts': 1,
                    },
                    'debts': [
                        {
                            'id': 1,
                            'type': 'credit_card',
                            'type_label': 'Credit card',
                            'original_amount': 2400000.0,
                            'outstanding_balance': 1950000.0,
                            'confirmed_payments': 450000.0,
                            'monthly_payment': 224286.02,
                            'annual_effective_rate_percentage': 24.0,
                            'status': 'active',
                        }
                    ],
                    'evolution': [],
                },
            ),
            401: AUTHENTICATION_ERROR,
        },
    )
    def get(self, request):
        return Response(summarize_debts(request.user))

    @extend_schema(
        tags=['Debts'],
        summary='Register a debt',
        description=(
            'Registers a debt and calculates its annual rate, monthly payment '
            'and projected payoff date.'
        ),
        operation_id='debts_create',
        parameters=[SECURITY_HEADER],
        request=DebtInputSerializer,
        responses={
            201: object_response(
                'The debt was registered successfully.',
                'Registered debt',
                {
                    'message': 'Debt registered successfully.',
                    'debt': {
                        'id': 1,
                        'type': 'credit_card',
                        'type_label': 'Credit card',
                        'original_amount': 2400000.0,
                        'monthly_payment': 224286.02,
                        'annual_effective_rate_percentage': 24.0,
                        'estimated_total_interest': 291432.24,
                        'term_months': 12,
                        'start_date': '2026-05-10',
                        'projected_end_date': '2027-05-03',
                    },
                },
            ),
            400: VALIDATION_ERROR,
            401: AUTHENTICATION_ERROR,
        },
    )
    def post(self, request):
        serializer = DebtInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            debt = Debt(user=request.user, **serializer.validated_data)
            prepare_debt(debt)
            debt.save()

        detail = debt_detail(debt, 0, timezone.localdate())
        return Response(
            {
                'message': 'Debt registered successfully.',
                'debt': {
                    'id': detail['id'],
                    'type': detail['type'],
                    'type_label': detail['type_label'],
                    'original_amount': detail['original_amount'],
                    'monthly_payment': detail['monthly_payment'],
                    'annual_effective_rate_percentage': detail[
                        'annual_effective_rate_percentage'
                    ],
                    'estimated_total_interest': detail[
                        'estimated_total_interest'
                    ],
                    'term_months': detail['term_months'],
                    'start_date': detail['start_date'],
                    'projected_end_date': detail['projected_end_date'],
                },
            },
            status=status.HTTP_201_CREATED,
        )
