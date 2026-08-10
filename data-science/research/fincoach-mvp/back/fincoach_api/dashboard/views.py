import csv

from django.core.paginator import EmptyPage, Paginator
from django.http import HttpResponse
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from profiles.models import FinancialProfile
from fincoach_api.openapi import (
    AUTHENTICATION_ERROR,
    NOT_FOUND_ERROR,
    VALIDATION_ERROR,
    object_response,
)

from .serializers import MonthQuerySerializer, MonthlyAnalysisQuerySerializer
from .services import (
    build_dashboard,
    build_monthly_summary,
    confirmed_transactions,
    serialize_transaction,
    transaction_categories,
    transaction_regularity,
)


PAGE_SIZE = 7


def current_profile(user):
    return FinancialProfile.objects.filter(user=user).first()


def safe_csv_text(value):
    text = str(value or '')
    if text.startswith(('=', '+', '-', '@')):
        return "'{}".format(text)
    return text


def categories_csv(transaction):
    return ' | '.join(
        '{}:{:.2f}%'.format(
            item.get('category', ''),
            float(item.get('percentage', 0)),
        )
        for item in transaction_categories(transaction)
    )


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Dashboard'],
        summary='Get the financial dashboard',
        description='Returns totals, evolution, composition, debt context and alerts.',
        operation_id='dashboard_get',
        parameters=[
            OpenApiParameter(
                name='month',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Optional month in YYYY-MM format. Defaults to the current month.',
            ),
        ],
        responses={
            200: object_response(
                'Dashboard data for the selected month.',
                'Financial dashboard',
                {
                    'month': '2026-07',
                    'overview': {
                        'income': 3500000.0,
                        'fixed_expenses': 1290000.0,
                        'variable_expenses': 880000.0,
                        'available': 1330000.0,
                        'expense_change_percentage': -2.5,
                        'average_classification_confidence_percentage': 84.2,
                    },
                    'evolution': [],
                    'income_composition': [],
                    'expense_categories': [],
                    'financial_context': {
                        'declared_monthly_income': 3500000.0,
                        'debt_payments': 150000.0,
                        'declared_debt_ratio_percentage': 20.0,
                        'debt_level': 'manageable',
                        'saving_habit': 'media',
                        'saving_capacity': 1330000.0,
                    },
                    'alerts': [],
                },
            ),
            400: VALIDATION_ERROR,
            401: AUTHENTICATION_ERROR,
        },
    )
    def get(self, request):
        query = MonthQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        data = build_dashboard(
            request.user,
            current_profile(request.user),
            query.selected_month,
        )
        return Response(data)


class MonthlyAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Dashboard'],
        summary='Get the monthly analysis',
        description='Returns a monthly summary and seven transactions per page.',
        operation_id='monthly_analysis_get',
        parameters=[
            OpenApiParameter(
                name='month',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Optional month in YYYY-MM format. Defaults to the current month.',
            ),
            OpenApiParameter(
                name='page',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Page number. Defaults to 1.',
            ),
        ],
        responses={
            200: object_response(
                'Paginated monthly analysis.',
                'Monthly analysis',
                {
                    'month': '2026-07',
                    'summary': {
                        'income': 3500000.0,
                        'expenses': 2170000.0,
                        'balance': 1330000.0,
                        'top_expense_categories': [],
                    },
                    'pagination': {
                        'page': 1,
                        'page_size': 7,
                        'total_pages': 2,
                        'total_items': 10,
                    },
                    'transactions': [
                        {
                            'id': 3,
                            'date': '2026-07-12',
                            'description': 'Compra de mercado',
                            'amount': 180000.0,
                            'currency': 'COP',
                            'direction': 'salida',
                            'categories': [
                                {'category': 'Alimentación', 'percentage': 100.0},
                            ],
                            'confidence_percentage': 90.0,
                        },
                    ],
                },
            ),
            400: VALIDATION_ERROR,
            401: AUTHENTICATION_ERROR,
            404: NOT_FOUND_ERROR,
        },
    )
    def get(self, request):
        query = MonthlyAnalysisQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        transactions = confirmed_transactions(
            request.user,
            query.selected_month,
        )
        paginator = Paginator(transactions, PAGE_SIZE)
        try:
            page = paginator.page(query.validated_data['page'])
        except EmptyPage as error:
            raise NotFound('The requested page does not exist.') from error

        return Response({
            'month': query.selected_month.strftime('%Y-%m'),
            'summary': build_monthly_summary(list(transactions)),
            'pagination': {
                'page': page.number,
                'page_size': PAGE_SIZE,
                'total_pages': paginator.num_pages,
                'total_items': paginator.count,
            },
            'transactions': [
                serialize_transaction(transaction)
                for transaction in page.object_list
            ],
        })


class MonthlyAnalysisExportView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Dashboard'],
        summary='Export monthly transactions',
        description='Downloads all confirmed transactions for a month as a UTF-8 CSV file.',
        operation_id='monthly_analysis_export',
        parameters=[
            OpenApiParameter(
                name='month',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Optional month in YYYY-MM format. Defaults to the current month.',
            ),
        ],
        responses={
            (200, 'text/csv'): OpenApiResponse(
                response=OpenApiTypes.BINARY,
                description='CSV file containing all confirmed monthly transactions.',
            ),
            400: VALIDATION_ERROR,
            401: AUTHENTICATION_ERROR,
        },
    )
    def get(self, request):
        query = MonthQuerySerializer(data=request.query_params)
        query.is_valid(raise_exception=True)
        month_label = query.selected_month.strftime('%Y-%m')
        transactions = confirmed_transactions(
            request.user,
            query.selected_month,
        ).order_by('transaction_date', 'created_at')

        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = (
            'attachment; filename="fincoach-transactions-{}.csv"'.format(
                month_label,
            )
        )
        response.write('\ufeff')
        writer = csv.writer(response)
        writer.writerow([
            'date',
            'description',
            'note',
            'amount',
            'currency',
            'direction',
            'categories',
            'purpose',
            'regularity',
            'debt_id',
            'classification_source',
        ])
        for transaction in transactions:
            writer.writerow([
                transaction.transaction_date.isoformat(),
                safe_csv_text(transaction.description),
                safe_csv_text(transaction.note),
                transaction.amount,
                transaction.currency,
                transaction.direction,
                categories_csv(transaction),
                transaction.current_purpose,
                transaction_regularity(transaction),
                getattr(transaction, 'debt_payment', None).debt_id
                if getattr(transaction, 'debt_payment', None)
                else '',
                transaction.classification_source,
            ])
        return response
