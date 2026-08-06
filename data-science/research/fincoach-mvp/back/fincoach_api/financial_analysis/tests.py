from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from profiles.models import FinancialProfile


ANALYSIS_RESPONSE = {
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
    'recommendation': {'status': 'available'},
    'evidence': {
        'status': 'calculated',
        'observed_period': {
            'from': '2026-06-04',
            'to': '2026-08-03',
            'days_with_history': 60,
            'confirmed_transactions': 17,
        },
        'reasons': [],
        'main_factors': [],
    },
}


class FinancialAnalysisApiTests(APITestCase):
    request_header = {'HTTP_X_FINCOACH_REQUEST': '1'}

    def setUp(self):
        self.client = APIClient(
            HTTP_USER_AGENT='FinCoachFinancialAnalysisTests/1.0',
            REMOTE_ADDR='127.0.0.1',
        )
        self.password = 'ClaveSegura123!'
        self.user = get_user_model().objects.create_user(
            email='financial-analysis@example.com',
            password=self.password,
            acepta_tratamiento_datos=True,
        )
        self.url = reverse('financial_analysis:create')

    def create_profile(self):
        return FinancialProfile.objects.create(
            user=self.user,
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
            model_result={'estado_ingreso_actual': 'fijo'},
        )

    def login(self):
        response = self.client.post(
            reverse('accounts:login'),
            {'email': self.user.email, 'password': self.password},
            format='json',
            **self.request_header,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_requires_authenticated_session(self):
        response = self.client.post(
            self.url,
            {'month': '2026-07'},
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_rejects_invalid_month(self):
        self.login()
        response = self.client.post(
            self.url,
            {'month': '07-2026'},
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_requires_financial_profile(self):
        self.login()
        response = self.client.post(
            self.url,
            {'month': '2026-07'},
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch(
        'financial_analysis.views.build_financial_analysis',
        return_value=ANALYSIS_RESPONSE,
    )
    def test_returns_compact_integral_analysis(self, service_mock):
        self.create_profile()
        self.login()
        response = self.client.post(
            self.url,
            {'month': '2026-07'},
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['month'], '2026-07')
        self.assertEqual(
            response.data['financial_status']['classification'],
            'saludable',
        )
        self.assertIn('recommendation', response.data)
        self.assertNotIn('model_result', response.data)
        service_mock.assert_called_once()

    @patch(
        'financial_analysis.views.build_financial_analysis',
        side_effect=ValueError('invalid model'),
    )
    def test_returns_service_unavailable_when_models_fail(self, service_mock):
        self.create_profile()
        self.login()
        response = self.client.post(
            self.url,
            {'month': '2026-07'},
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
