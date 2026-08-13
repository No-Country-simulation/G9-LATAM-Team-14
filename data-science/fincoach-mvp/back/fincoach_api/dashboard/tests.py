import csv
import io

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from profiles.models import FinancialProfile
from transactions.models import Transaction


class DashboardApiTests(APITestCase):
    request_header = {'HTTP_X_FINCOACH_REQUEST': '1'}

    def setUp(self):
        self.client = APIClient(
            HTTP_USER_AGENT='FinCoachDashboardTests/1.0',
            REMOTE_ADDR='127.0.0.1',
        )
        self.password = 'ClaveSegura123!'
        self.user = get_user_model().objects.create_user(
            email='dashboard@example.com',
            password=self.password,
            first_name='Dashboard',
            last_name='Test',
            acepta_tratamiento_datos=True,
        )
        self.profile = self.create_profile(self.user)

    def create_profile(self, user):
        return FinancialProfile.objects.create(
            user=user,
            monthly_net_income='3500000.00',
            saving_habit='media',
            debt_ratio_percentage='20.00',
            debt_types=['tarjeta de credito'],
            primary_activity='Desarrollador de software',
            primary_income_modality='fijo',
            has_additional_income=False,
            additional_activity='',
            additional_income_modality='',
            next_goal='crear fondo de emergencia',
            hobbies=['ciclismo'],
            financial_responsibility='apoyo familiar',
            model_paragraph='Profile context',
            auxiliary_filter_status='sin_alerta_auxiliar',
            mvp_scope_status='dentro_del_mvp',
            primary_activity_classification='ingenieria_y_desarrollo_de_software',
            cuoc_occupation='Desarrolladores de software',
            cuoc_code='25120',
            activity_confidence_percentage='95.00',
            model_probability_percentage='91.00',
            catalog_similarity_percentage='100.00',
            secondary_activity_classification='no_declarada',
            classified_hobbies=['ciclismo'],
            out_of_mvp_hobbies=[],
            classified_goal='crear fondo de emergencia',
            classified_responsibility='apoyo familiar',
            debt_calculation_status='calculado',
            top_3_activities=[],
            model_version='fincoach_usuario_mvp_v2',
            model_result={},
        )

    def login(self):
        response = self.client.post(
            reverse('accounts:login'),
            {'email': self.user.email, 'password': self.password},
            format='json',
            **self.request_header,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def create_transaction(
        self,
        transaction_date,
        amount,
        direction,
        category,
        regularity='variable',
        user=None,
        transaction_status='confirmed',
        description='Test transaction',
    ):
        owner = user or self.user
        profile = self.profile if owner == self.user else None
        return Transaction.objects.create(
            user=owner,
            financial_profile=profile,
            transaction_date=transaction_date,
            description=description,
            amount=amount,
            direction=direction,
            status=transaction_status,
            movement_type=(
                'ingreso_generado'
                if direction == 'entrada'
                else 'gasto'
            ),
            model_category=category,
            model_purpose='consumo_personal',
            model_category_confidence_percentage='90.00',
            model_purpose_confidence_percentage='85.00',
            model_regularity=regularity,
            model_regularity_confidence_percentage='80.00',
            model_requires_confirmation=False,
            model_confirmation_probability_percentage='5.00',
            model_top_categories=[
                {'category': category, 'percentage': 90.0},
            ],
            model_category_percentages={category: 90.0},
            model_category_purpose_pair_valid=True,
            model_rule='modelo_contextual',
            model_version='fincoach_transacciones_mvp_v3',
            current_categories=[
                {'category': category, 'percentage': 100.0},
            ],
            current_purpose='consumo_personal',
            classification_source='model_confirmed',
        )

    def test_dashboard_requires_authenticated_session(self):
        response = self.client.get(reverse('dashboard:overview'))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_dashboard_uses_only_confirmed_transactions_from_current_user(self):
        self.login()
        self.create_transaction(
            '2026-08-01',
            '3500000.00',
            'entrada',
            'Ingresos laborales',
            regularity='fijo',
        )
        self.create_transaction(
            '2026-08-05',
            '1000000.00',
            'salida',
            'Vivienda',
            regularity='fijo',
        )
        self.create_transaction(
            '2026-08-10',
            '500000.00',
            'salida',
            'Alimentación',
        )
        self.create_transaction(
            '2026-08-12',
            '9000000.00',
            'salida',
            'Ocio',
            transaction_status='pending_classification',
        )
        other_user = get_user_model().objects.create_user(
            email='other-dashboard@example.com',
            password=self.password,
            acepta_tratamiento_datos=True,
        )
        self.create_transaction(
            '2026-08-13',
            '8000000.00',
            'salida',
            'Ocio',
            user=other_user,
        )

        response = self.client.get(
            '{}?month=2026-08'.format(reverse('dashboard:overview')),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['overview']['income'], 3500000.0)
        self.assertEqual(response.data['overview']['fixed_expenses'], 1000000.0)
        self.assertEqual(response.data['overview']['variable_expenses'], 500000.0)
        self.assertEqual(response.data['overview']['available'], 2000000.0)
        self.assertEqual(
            response.data['expense_categories'][0]['category'],
            'Vivienda',
        )

    def test_monthly_analysis_paginates_seven_transactions(self):
        self.login()
        for day in range(1, 10):
            self.create_transaction(
                '2026-08-{:02d}'.format(day),
                '10000.00',
                'salida',
                'Alimentación',
                description='Expense {}'.format(day),
            )
        self.create_transaction(
            '2026-07-31',
            '500000.00',
            'salida',
            'Ocio',
        )

        response = self.client.get(
            '{}?month=2026-08&page=2'.format(
                reverse('dashboard:monthly-analysis'),
            ),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['summary']['expenses'], 90000.0)
        self.assertEqual(response.data['pagination']['total_pages'], 2)
        self.assertEqual(response.data['pagination']['total_items'], 9)
        self.assertEqual(len(response.data['transactions']), 2)
        self.assertEqual(
            response.data['transactions'][0]['confidence_percentage'],
            90.0,
        )

    def test_dashboard_uses_user_confirmed_regularity(self):
        self.login()
        transaction = self.create_transaction(
            '2026-08-10',
            '120000.00',
            'salida',
            'Educación',
            regularity='fijo',
        )
        transaction.current_regularity = 'variable'
        transaction.save(update_fields=['current_regularity'])

        response = self.client.get(
            '{}?month=2026-08'.format(reverse('dashboard:overview')),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['overview']['fixed_expenses'], 0.0)
        self.assertEqual(response.data['overview']['variable_expenses'], 120000.0)

    def test_dashboard_groups_seasonal_income_in_variable_composition(self):
        self.login()
        self.create_transaction(
            '2026-08-10',
            '900000.00',
            'entrada',
            'Ventas y actividad comercial',
            regularity='estacional',
        )

        response = self.client.get(
            '{}?month=2026-08'.format(reverse('dashboard:overview')),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        variable = next(
            item
            for item in response.data['income_composition']
            if item['type'] == 'variable'
        )
        self.assertEqual(variable['amount'], 900000.0)

    def test_csv_exports_the_complete_month_without_pagination(self):
        self.login()
        for day in range(1, 10):
            self.create_transaction(
                '2026-08-{:02d}'.format(day),
                '10000.00',
                'salida',
                'Alimentación',
                description='Expense {}'.format(day),
            )

        response = self.client.get(
            '{}?month=2026-08'.format(
                reverse('dashboard:monthly-analysis-export'),
            ),
        )

        rows = list(csv.reader(io.StringIO(response.content.decode('utf-8-sig'))))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv; charset=utf-8')
        self.assertIn('fincoach-transactions-2026-08.csv', response['Content-Disposition'])
        self.assertEqual(len(rows), 10)
        self.assertEqual(rows[0][0], 'date')
