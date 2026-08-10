from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from transactions.models import Transaction

from .models import Debt, DebtPayment
from .services import prepare_debt


class DebtApiTests(APITestCase):
    request_header = {'HTTP_X_FINCOACH_REQUEST': '1'}

    def setUp(self):
        self.client = APIClient(
            HTTP_USER_AGENT='FinCoachDebtTests/1.0',
            REMOTE_ADDR='127.0.0.1',
        )
        self.password = 'ClaveSegura123!'
        self.user = get_user_model().objects.create_user(
            email='debts@example.com',
            password=self.password,
            acepta_tratamiento_datos=True,
        )
        self.url = reverse('debts:list-create')
        self.payload = {
            'debt_type': 'educational',
            'original_amount': '8000000.00',
            'term_months': 36,
            'start_date': '2026-01-15',
        }

    def login(self):
        response = self.client.post(
            reverse('accounts:login'),
            {'email': self.user.email, 'password': self.password},
            format='json',
            **self.request_header,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def create_debt(self, user=None, debt_type='educational'):
        debt = Debt(
            user=user or self.user,
            debt_type=debt_type,
            original_amount='8000000.00',
            term_months=36,
            start_date='2026-01-15',
        )
        prepare_debt(debt)
        debt.save()
        return debt

    def test_debts_require_authenticated_session(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_registers_debt_and_calculates_rate_and_payment(self):
        self.login()
        response = self.client.post(
            self.url,
            self.payload,
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        debt = Debt.objects.get(user=self.user)
        self.assertEqual(float(debt.annual_effective_rate), 12.0)
        self.assertGreater(float(debt.monthly_payment), 0)
        self.assertEqual(response.data['debt']['type'], 'educational')

    def test_list_only_returns_current_users_debts(self):
        self.login()
        self.create_debt()
        other_user = get_user_model().objects.create_user(
            email='other-debt@example.com',
            password=self.password,
            acepta_tratamiento_datos=True,
        )
        self.create_debt(other_user, 'credit_card')

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['summary']['active_debts'], 1)
        self.assertEqual(len(response.data['debts']), 1)
        self.assertEqual(response.data['debts'][0]['type'], 'educational')

    @patch(
        'transactions.views.get_catalogs_or_raise',
        return_value={
            'categories': ['Deuda y financiación'],
            'purposes': ['pago_deuda'],
        },
    )
    def test_confirmed_payment_is_linked_to_selected_debt(self, catalogs_mock):
        self.login()
        debt = self.create_debt()
        transaction = Transaction.objects.create(
            user=self.user,
            transaction_date='2026-08-03',
            description='Pago crédito educativo',
            amount='150000.00',
            direction='salida',
            status='awaiting_confirmation',
            movement_type='pago_deuda',
            model_category='Deuda y financiación',
            model_purpose='pago_deuda',
            model_category_confidence_percentage='100.00',
            model_purpose_confidence_percentage='100.00',
            model_regularity='fijo',
            model_regularity_confidence_percentage='90.00',
            model_requires_confirmation=False,
            model_confirmation_probability_percentage='0.00',
            model_version='fincoach_transacciones_mvp_v3',
        )

        response = self.client.patch(
            reverse('transactions:confirm', args=[transaction.id]),
            {
                'selected_categories': [
                    {
                        'category': 'Deuda y financiación',
                        'percentage': '100.00',
                    },
                ],
                'selected_purpose': 'pago_deuda',
                'selected_regularity': 'fijo',
                'selected_debt_id': debt.id,
            },
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payment = DebtPayment.objects.get(transaction=transaction)
        self.assertEqual(payment.debt, debt)
        self.assertEqual(float(payment.allocated_amount), 150000.0)

        summary = self.client.get(self.url)
        self.assertEqual(
            summary.data['summary']['total_outstanding_balance'],
            7850000.0,
        )

    def test_rejects_debt_payment_without_selected_debt(self):
        self.login()
        transaction = Transaction.objects.create(
            user=self.user,
            transaction_date='2026-08-03',
            description='Pago crédito',
            amount='150000.00',
            direction='salida',
            status='awaiting_confirmation',
            model_category='Deuda y financiación',
            model_purpose='pago_deuda',
            model_version='fincoach_transacciones_mvp_v3',
        )

        with patch(
            'transactions.views.get_catalogs_or_raise',
            return_value={
                'categories': ['Deuda y financiación'],
                'purposes': ['pago_deuda'],
            },
        ):
            response = self.client.patch(
                reverse('transactions:confirm', args=[transaction.id]),
                {
                    'selected_categories': [
                        {
                            'category': 'Deuda y financiación',
                            'percentage': '100.00',
                        },
                    ],
                    'selected_regularity': 'fijo',
                },
                format='json',
                **self.request_header,
            )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('selected_debt_id', response.data)
