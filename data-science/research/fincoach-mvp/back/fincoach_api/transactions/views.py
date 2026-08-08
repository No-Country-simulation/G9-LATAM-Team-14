import logging
from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from django.core.paginator import EmptyPage, Paginator
from django.db import transaction as database_transaction
from django.utils import timezone
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.exceptions import APIException, NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from profiles.models import FinancialProfile
from debts.models import Debt, DebtPayment
from fincoach_api.openapi import (
    AUTHENTICATION_ERROR,
    CONFLICT_ERROR,
    EmptyRequestSerializer,
    MODEL_UNAVAILABLE_ERROR,
    NOT_FOUND_ERROR,
    SECURITY_HEADER,
    VALIDATION_ERROR,
    object_response,
)

from .models import Transaction
from .serializers import (
    TransactionConfirmationSerializer,
    TransactionInputSerializer,
    TransactionSerializer,
)
from .services import (
    EXPECTED_MODEL_VERSION,
    classify_transaction,
    get_model_catalogs,
)


logger = logging.getLogger(__name__)


class TransactionModelUnavailable(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'The transaction model is temporarily unavailable.'
    default_code = 'transaction_model_unavailable'


def get_profile_or_raise(user):
    try:
        return FinancialProfile.objects.get(user=user)
    except FinancialProfile.DoesNotExist as error:
        raise ValidationError({
            'profile': 'Create the financial profile before registering transactions.',
        }) from error


def get_transaction_or_raise(user, transaction_id):
    try:
        return Transaction.objects.get(id=transaction_id, user=user)
    except Transaction.DoesNotExist as error:
        raise NotFound('The transaction was not found.') from error


def execute_model(transaction, profile):
    try:
        return classify_transaction(transaction, profile)
    except Exception as error:
        logger.exception('The transaction model could not be executed.')
        raise TransactionModelUnavailable() from error


def get_catalogs_or_raise():
    try:
        return get_model_catalogs()
    except Exception as error:
        logger.exception('The transaction model catalogs could not be loaded.')
        raise TransactionModelUnavailable() from error


def parse_month(value):
    parts = str(value).split('-')
    if len(parts) != 2:
        raise ValidationError({'month': 'Use the YYYY-MM format.'})
    try:
        year = int(parts[0])
        month = int(parts[1])
        return date(year, month, 1)
    except (TypeError, ValueError) as error:
        raise ValidationError({'month': 'Use a valid month in YYYY-MM format.'}) from error


class TransactionListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Transactions'],
        summary='List transactions',
        description='Returns only transactions owned by the authenticated user.',
        operation_id='transactions_list',
        parameters=[
            OpenApiParameter(
                name='month',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Optional month in YYYY-MM format.',
                examples=[],
            ),
            OpenApiParameter(
                name='direction',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                enum=['entrada', 'salida'],
                description='Filters income or outgoing transactions.',
            ),
            OpenApiParameter(
                name='status',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                enum=['pending_classification', 'awaiting_confirmation', 'confirmed'],
                description='Filters by transaction workflow status.',
            ),
            OpenApiParameter(
                name='page',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Page number. Defaults to 1.',
            ),
            OpenApiParameter(
                name='page_size',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Items per page from 1 to 100. Defaults to 7.',
            ),
        ],
        responses={
            200: object_response(
                'Paginated transaction history.',
                'Transaction history',
                {
                    'pagination': {
                        'page': 1,
                        'page_size': 7,
                        'total_pages': 1,
                        'total_items': 1,
                    },
                    'transactions': [
                        {
                            'id': 3,
                            'transaction_date': '2026-08-03',
                            'description': 'Compra mercado',
                            'amount': 180000.0,
                            'currency': 'COP',
                            'direction': 'salida',
                            'status': 'confirmed',
                        }
                    ],
                },
            ),
            400: VALIDATION_ERROR,
            401: AUTHENTICATION_ERROR,
            404: NOT_FOUND_ERROR,
        },
    )
    def get(self, request):
        transactions = Transaction.objects.filter(user=request.user)
        month_value = request.query_params.get('month')
        direction = request.query_params.get('direction')
        transaction_status = request.query_params.get('status')

        if month_value:
            selected_month = parse_month(month_value)
            transactions = transactions.filter(
                transaction_date__year=selected_month.year,
                transaction_date__month=selected_month.month,
            )
        if direction:
            valid_directions = {choice[0] for choice in Transaction.DIRECTIONS}
            if direction not in valid_directions:
                raise ValidationError({
                    'direction': 'Direction must be entrada or salida.',
                })
            transactions = transactions.filter(direction=direction)
        if transaction_status:
            valid_statuses = {choice[0] for choice in Transaction.STATUSES}
            if transaction_status not in valid_statuses:
                raise ValidationError({
                    'status': 'The transaction status is not valid.',
                })
            transactions = transactions.filter(status=transaction_status)

        try:
            page_number = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 7))
        except (TypeError, ValueError) as error:
            raise ValidationError({
                'pagination': 'Page and page_size must be integers.',
            }) from error
        if page_number < 1 or page_size < 1 or page_size > 100:
            raise ValidationError({
                'pagination': 'Page must be positive and page_size must be between 1 and 100.',
            })

        paginator = Paginator(transactions, page_size)
        try:
            page = paginator.page(page_number)
        except EmptyPage as error:
            raise NotFound('The requested page does not exist.') from error

        return Response({
            'pagination': {
                'page': page.number,
                'page_size': page_size,
                'total_pages': paginator.num_pages,
                'total_items': paginator.count,
            },
            'transactions': TransactionSerializer(page.object_list, many=True).data,
        })

    @extend_schema(
        tags=['Transactions'],
        summary='Register a transaction',
        description=(
            'Creates a pending transaction. Call its classification endpoint '
            'after registration.'
        ),
        operation_id='transactions_create',
        parameters=[SECURITY_HEADER],
        request=TransactionInputSerializer,
        responses={
            201: object_response(
                'The transaction was registered.',
                'Registered transaction',
                {
                    'message': 'Transaction registered. It is ready to be classified.',
                    'transaction': {
                        'id': 3,
                        'transaction_date': '2026-08-03',
                        'description': 'Compra mercado',
                        'note': '',
                        'amount': 180000.0,
                        'currency': 'COP',
                        'direction': 'salida',
                        'status': 'pending_classification',
                    },
                    'next_step': {
                        'method': 'POST',
                        'endpoint': '/api/v1/transactions/3/classify/',
                    },
                },
            ),
            400: VALIDATION_ERROR,
            401: AUTHENTICATION_ERROR,
        },
    )
    def post(self, request):
        profile = get_profile_or_raise(request.user)
        serializer = TransactionInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        transaction = Transaction.objects.create(
            user=request.user,
            financial_profile=profile,
            **serializer.validated_data,
        )
        return Response(
            {
                'message': 'Transaction registered. It is ready to be classified.',
                'transaction': {
                    'id': transaction.id,
                    'transaction_date': transaction.transaction_date,
                    'description': transaction.description,
                    'note': transaction.note,
                    'amount': float(transaction.amount),
                    'currency': transaction.currency,
                    'direction': transaction.direction,
                    'status': transaction.status,
                },
                'next_step': {
                    'method': 'POST',
                    'endpoint': '/api/v1/transactions/{}/classify/'.format(
                        transaction.id,
                    ),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class TransactionClassifyView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Transactions'],
        summary='Classify a transaction',
        description=(
            'Runs the contextual transaction model and returns a suggestion. '
            'The user must confirm or correct it before it affects analyses.'
        ),
        operation_id='transactions_classify',
        parameters=[SECURITY_HEADER],
        request=EmptyRequestSerializer,
        responses={
            200: object_response(
                'The model produced a classification suggestion.',
                'Classification suggestion',
                {
                    'message': 'Transaction classified. Confirm or correct the suggestion.',
                    'transaction_id': 3,
                    'status': 'awaiting_confirmation',
                    'model_suggestion': {
                        'category': 'Alimentación',
                        'category_confidence_percentage': 72.18,
                        'alternative_categories': [
                            {'category': 'Otra / ambigua', 'percentage': 9.77},
                            {'category': 'Ocio', 'percentage': 5.11},
                        ],
                        'purpose': 'consumo_personal',
                        'regularity': 'fijo',
                        'regularity_confidence_percentage': 91.42,
                        'regularity_requires_review': False,
                        'regularity_history_available': True,
                        'category_requires_review': False,
                        'model_requires_review': False,
                    },
                    'user_confirmation_required': True,
                },
            ),
            400: VALIDATION_ERROR,
            401: AUTHENTICATION_ERROR,
            404: NOT_FOUND_ERROR,
            409: CONFLICT_ERROR,
            503: MODEL_UNAVAILABLE_ERROR,
        },
    )
    def post(self, request, transaction_id):
        transaction = get_transaction_or_raise(request.user, transaction_id)
        if transaction.status == 'confirmed':
            return Response(
                {
                    'detail': (
                        'The transaction is already confirmed. Use the confirmation '
                        'endpoint and send the new selected classification to revise it.'
                    ),
                },
                status=status.HTTP_409_CONFLICT,
            )

        profile = get_profile_or_raise(request.user)
        result = execute_model(transaction, profile)

        transaction.financial_profile = profile
        transaction.movement_type = result['movement_type']
        transaction.model_category = result['category']
        transaction.model_purpose = result['purpose']
        transaction.model_category_confidence_percentage = result[
            'category_confidence_percentage'
        ]
        transaction.model_purpose_confidence_percentage = result[
            'purpose_confidence_percentage'
        ]
        transaction.model_regularity = result['regularity']
        transaction.model_regularity_confidence_percentage = result[
            'regularity_confidence_percentage'
        ]
        transaction.model_requires_confirmation = result['requires_confirmation']
        transaction.model_confirmation_probability_percentage = result[
            'confirmation_probability_percentage'
        ]
        transaction.model_top_categories = result['top_categories']
        transaction.model_category_percentages = result['category_percentages']
        transaction.model_category_purpose_pair_valid = result[
            'category_purpose_pair_valid'
        ]
        transaction.model_rule = result['rule']
        transaction.model_version = result['model_version']
        transaction.model_result = result
        transaction.status = 'awaiting_confirmation'
        transaction.save()

        return Response({
            'message': 'Transaction classified. Confirm or correct the suggestion.',
            'transaction_id': transaction.id,
            'status': transaction.status,
            'model_suggestion': {
                'category': transaction.model_category,
                'category_confidence_percentage': float(
                    transaction.model_category_confidence_percentage
                ),
                'alternative_categories': transaction.model_top_categories[1:],
                'purpose': transaction.model_purpose,
                'regularity': transaction.model_regularity,
                'regularity_confidence_percentage': float(
                    transaction.model_regularity_confidence_percentage
                ),
                'regularity_requires_review': result[
                    'regularity_requires_confirmation'
                ],
                'regularity_history_available': result[
                    'regularity_history_available'
                ],
                'category_requires_review': result[
                    'category_requires_confirmation'
                ],
                'model_requires_review': transaction.model_requires_confirmation,
            },
            'user_confirmation_required': True,
            'next_step': {
                'method': 'PATCH',
                'endpoint': '/api/v1/transactions/{}/confirm/'.format(
                    transaction.id,
                ),
            },
        })


class TransactionConfirmView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Transactions'],
        summary='Confirm or correct a classification',
        description=(
            'Saves the categories and regularity selected by the user. Send '
            'selected_regularity as fijo or variable for expenses. Income can '
            'also be estacional. Send one category with '
            '100 percent or several categories whose percentages total exactly '
            '100. For debt payments, also send selected_debt_id.'
        ),
        operation_id='transactions_confirm_or_correct',
        parameters=[SECURITY_HEADER],
        request=TransactionConfirmationSerializer,
        responses={
            200: object_response(
                'The selected classification was saved.',
                'Confirmed classification',
                {
                    'message': 'The selected transaction classification was saved successfully.',
                    'transaction_id': 3,
                    'status': 'confirmed',
                    'confirmed_classification': {
                        'categories': [
                            {'category': 'Alimentación', 'percentage': 100.0}
                        ],
                        'purpose': 'consumo_personal',
                        'regularity': 'variable',
                        'debt_id': None,
                    },
                    'model_suggestion': {
                        'category': 'Alimentación',
                        'purpose': 'consumo_personal',
                        'regularity': 'fijo',
                    },
                    'classification_result': 'user_correction',
                    'was_corrected': True,
                    'revision_count': 1,
                },
            ),
            400: VALIDATION_ERROR,
            401: AUTHENTICATION_ERROR,
            404: NOT_FOUND_ERROR,
            409: CONFLICT_ERROR,
            503: MODEL_UNAVAILABLE_ERROR,
        },
    )
    def patch(self, request, transaction_id):
        transaction = get_transaction_or_raise(request.user, transaction_id)
        if not transaction.model_category:
            return Response(
                {'detail': 'Classify the transaction before confirming it.'},
                status=status.HTTP_409_CONFLICT,
            )
        if (
            transaction.status != 'confirmed'
            and transaction.model_version != EXPECTED_MODEL_VERSION
        ):
            return Response(
                {
                    'detail': (
                        'The pending suggestion was generated by an older model. '
                        'Classify the transaction again before confirming it.'
                    ),
                    'next_step': {
                        'method': 'POST',
                        'endpoint': '/api/v1/transactions/{}/classify/'.format(
                            transaction.id,
                        ),
                    },
                },
                status=status.HTTP_409_CONFLICT,
            )

        serializer = TransactionConfirmationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        catalogs = get_catalogs_or_raise()
        categories = [
            {
                'category': item['category'],
                'percentage': float(item['percentage']),
            }
            for item in data['selected_categories']
        ]
        invalid_categories = sorted({
            item['category']
            for item in categories
            if item['category'] not in catalogs['categories']
        })
        if invalid_categories:
            raise ValidationError({
                'selected_categories': {
                    'invalid': invalid_categories,
                    'available': catalogs['categories'],
                },
            })

        purpose = data.get('selected_purpose', transaction.model_purpose).strip()
        if purpose not in catalogs['purposes']:
            raise ValidationError({
                'selected_purpose': {
                    'invalid': purpose,
                    'available': catalogs['purposes'],
                },
            })
        regularity = data['selected_regularity']
        if transaction.direction == 'salida' and regularity == 'estacional':
            raise ValidationError({
                'selected_regularity': (
                    'Seasonal regularity is only available for income.'
                ),
            })

        debt_percentage = next(
            (
                item['percentage']
                for item in categories
                if item['category'] == 'Deuda y financiación'
            ),
            0.0,
        )
        selected_debt_id = data.get('selected_debt_id')
        selected_debt = None
        if debt_percentage > 0:
            if transaction.direction != 'salida':
                raise ValidationError({
                    'selected_categories': (
                        'A debt payment must be an outgoing transaction.'
                    ),
                })
            if selected_debt_id is None:
                raise ValidationError({
                    'selected_debt_id': (
                        'Select the debt receiving this confirmed payment.'
                    ),
                })
            try:
                selected_debt = Debt.objects.get(
                    id=selected_debt_id,
                    user=request.user,
                )
            except Debt.DoesNotExist as error:
                raise ValidationError({
                    'selected_debt_id': 'The selected debt was not found.',
                }) from error
            if transaction.transaction_date < selected_debt.start_date:
                raise ValidationError({
                    'selected_debt_id': (
                        'The payment date cannot be earlier than the debt start date.'
                    ),
                })
        elif selected_debt_id is not None:
            raise ValidationError({
                'selected_debt_id': (
                    'This field is only valid for the Deuda y financiación category.'
                ),
            })

        matches_model = (
            categories == [{
                'category': transaction.model_category,
                'percentage': 100.0,
            }]
            and purpose == transaction.model_purpose
            and regularity == transaction.model_regularity
        )
        source = 'model_confirmed' if matches_model else 'user_correction'
        current_payment = DebtPayment.objects.filter(
            transaction=transaction,
        ).first()
        current_debt_id = current_payment.debt_id if current_payment else None

        if (
            transaction.status == 'confirmed'
            and categories == transaction.current_categories
            and purpose == transaction.current_purpose
            and regularity == (
                transaction.current_regularity or transaction.model_regularity
            )
            and selected_debt_id == current_debt_id
        ):
            return Response({
                'message': 'The selected classification was already confirmed.',
                'transaction_id': transaction.id,
                'status': transaction.status,
                'confirmed_classification': {
                    'categories': transaction.current_categories,
                    'purpose': transaction.current_purpose,
                    'regularity': (
                        transaction.current_regularity
                        or transaction.model_regularity
                    ),
                    'debt_id': current_debt_id,
                },
                'classification_result': transaction.classification_source,
                'was_corrected': False,
                'revision_count': transaction.revision_count,
            })

        decision = (
            'confirm'
            if not transaction.first_user_decision and matches_model
            else 'correct'
        )

        now = timezone.now()
        audit_entry = {
            'decision': decision,
            'categories': categories,
            'purpose': purpose,
            'regularity': regularity,
            'debt_id': selected_debt_id,
            'actor_user_id': request.user.id,
            'decided_at': now.isoformat(),
        }

        with database_transaction.atomic():
            if not transaction.first_user_decision:
                transaction.first_user_decision = audit_entry
                transaction.first_decided_at = now
            if decision == 'correct':
                transaction.revision_count += 1
                transaction.last_corrected_at = now

            history = list(transaction.decision_history or [])
            history.append(audit_entry)
            transaction.decision_history = history
            transaction.current_categories = categories
            transaction.current_purpose = purpose
            transaction.current_regularity = regularity
            transaction.classification_source = source
            transaction.status = 'confirmed'
            transaction.save()
            if selected_debt is not None:
                allocated_amount = (
                    Decimal(transaction.amount)
                    * Decimal(str(debt_percentage))
                    / Decimal('100')
                ).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
                DebtPayment.objects.update_or_create(
                    transaction=transaction,
                    defaults={
                        'debt': selected_debt,
                        'allocated_amount': allocated_amount,
                    },
                )
            else:
                DebtPayment.objects.filter(transaction=transaction).delete()

        return Response({
            'message': 'The selected transaction classification was saved successfully.',
            'transaction_id': transaction.id,
            'status': transaction.status,
            'confirmed_classification': {
                'categories': transaction.current_categories,
                'purpose': transaction.current_purpose,
                'regularity': transaction.current_regularity,
                'debt_id': selected_debt_id,
            },
            'model_suggestion': {
                'category': transaction.model_category,
                'purpose': transaction.model_purpose,
                'regularity': transaction.model_regularity,
            },
            'classification_result': transaction.classification_source,
            'was_corrected': decision == 'correct',
            'revision_count': transaction.revision_count,
        })
