from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from profiles.models import FinancialProfile

from .services import load_recommendation_model, load_trajectory_model


RECOMMENDATION_RESPONSE = {
    'financial_state': {
        'status': 'calculated',
        'state': 'equilibrio_sostenible',
        'challenge_state': 'saludable',
        'confidence_percentage': 82.4,
        'observed_period': {
            'from': '2026-06-04',
            'to': '2026-08-03',
            'days_with_history': 60,
            'confirmed_transactions': 18,
        },
        'main_factors': [
            {'factor': 'operating_balance', 'assessment': 'positive'},
        ],
        'reasons': [],
    },
    'recommendation': {
        'status': 'available',
        'code': 'REC_CUIDAR_MARGEN_CON_DEUDA',
        'message': 'Mantén un margen disponible mientras reduces tus deudas.',
        'action': 'Separar una parte del saldo disponible.',
        'type': 'organizacion',
        'priority': 'media',
        'human_review': 'no',
        'confidence_percentage': 78.2,
        'selection_source': 'model_validated_by_safeguards',
        'applied_safeguards': ['active_debt_considered'],
        'related_goal': 'crear fondo de emergencia',
        'reasons': [],
    },
}


class RecommendationModelContractTests(SimpleTestCase):
    def test_loads_compatible_v3_artifacts(self):
        load_trajectory_model.cache_clear()
        load_recommendation_model.cache_clear()

        trajectory = load_trajectory_model()
        recommendation = load_recommendation_model()

        self.assertEqual(
            trajectory['version_modelo'],
            'fincoach_estados_trayectoria_mvp_v3',
        )
        self.assertEqual(
            recommendation['version_modelo'],
            'fincoach_recomendaciones_mvp_v3',
        )
        self.assertEqual(
            recommendation['version_modelo_estados'],
            trajectory['version_modelo'],
        )


class RecommendationApiTests(APITestCase):
    def setUp(self):
        self.client = APIClient(
            HTTP_USER_AGENT='FinCoachRecommendationTests/1.0',
            REMOTE_ADDR='127.0.0.1',
        )
        self.password = 'ClaveSegura123!'
        self.user = get_user_model().objects.create_user(
            email='recommendations@example.com',
            password=self.password,
            acepta_tratamiento_datos=True,
        )
        self.url = reverse('recommendations:current')

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
            HTTP_X_FINCOACH_REQUEST='1',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_requires_authenticated_session(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_requires_financial_profile(self):
        self.login()
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @patch(
        'recommendations.views.generate_recommendation_response',
        return_value=RECOMMENDATION_RESPONSE,
    )
    def test_returns_compact_state_and_recommendation(self, service_mock):
        self.create_profile()
        self.login()
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data['financial_state']['state'],
            'equilibrio_sostenible',
        )
        self.assertEqual(
            response.data['recommendation']['code'],
            'REC_CUIDAR_MARGEN_CON_DEUDA',
        )
        self.assertNotIn('overview', response.data)
        self.assertNotIn('evolution', response.data)
        self.assertNotIn('transactions', response.data)
        service_mock.assert_called_once()

    @patch(
        'recommendations.views.generate_recommendation_response',
        side_effect=ValueError('invalid model'),
    )
    def test_returns_service_unavailable_when_models_fail(self, service_mock):
        self.create_profile()
        self.login()
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
