from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .models import FinancialProfile
from .services import classify_profile, evaluate_auxiliary_filter, load_user_model


MODEL_RESULT = {
    'actividad_declarada': 'Desarrollador de software',
    'ingreso_mensual_neto': 3500000.0,
    'estado_ingreso_actual': 'fijo',
    'modalidad_ingreso_principal': 'fijo',
    'fuente_modalidad': 'declarada_por_usuario',
    'actividad_secundaria': 'no_declarada',
    'ingreso_adicional': 'no_declarado',
    'modalidad_ingreso_adicional': 'no_declarada',
    'hobbies_intereses': ['ciclismo', 'fotografia_y_video'],
    'hobbies_fuera_mvp': [],
    'meta': 'crear fondo de emergencia',
    'responsabilidad': 'apoyo familiar',
    'tipos_deuda': ['tarjeta de credito'],
    'nivel_endeudamiento_pct': 20.0,
    'estado_calculo_endeudamiento': 'calculado',
    'habito_ahorro': 'media',
    'estado_alcance_mvp': 'dentro_del_mvp',
    'actividad_principal': 'ingenieria_y_desarrollo_de_software',
    'ocupacion_cuoc': 'Desarrolladores de software',
    'codigo_cuoc': '2512',
    'confianza_actividad_pct': 96.5,
    'probabilidad_modelo_pct': 95.0,
    'similitud_catalogo_pct': 100.0,
    'top_3_actividades': [
        {'activity': 'ingenieria_y_desarrollo_de_software', 'percentage': 96.5},
    ],
    'motivo': 'Actividad reconocida dentro de las diez ocupaciones del MVP',
    'principio_etico': 'Los datos declarados se conservan sin inventar información.',
    'version_modelo': 'fincoach_usuario_mvp_v2',
}


class FinancialProfileApiTests(APITestCase):
    request_header = {'HTTP_X_FINCOACH_REQUEST': '1'}

    def setUp(self):
        self.client = APIClient(
            HTTP_USER_AGENT='FinCoachProfileTests/1.0',
            REMOTE_ADDR='127.0.0.1',
        )
        self.password = 'ClaveSegura123!'
        self.user = get_user_model().objects.create_user(
            email='profile@example.com',
            password=self.password,
            first_name='Profile',
            last_name='Test',
            acepta_tratamiento_datos=True,
        )
        self.create_url = reverse('profiles:create')
        self.me_url = reverse('profiles:me')
        self.payload = {
            'monthly_net_income': '3500000.00',
            'saving_habit': 'media',
            'debt_ratio_percentage': '20.00',
            'debt_types': ['tarjeta de credito'],
            'primary_activity': 'Desarrollador de software',
            'primary_income_modality': 'fijo',
            'has_additional_income': False,
            'additional_activity': '',
            'additional_income_modality': '',
            'next_goal': 'crear fondo de emergencia',
            'hobbies': ['ciclismo', 'fotografia'],
            'financial_responsibility': 'apoyo familiar',
        }

    def login(self):
        response = self.client.post(
            reverse('accounts:login'),
            {'email': self.user.email, 'password': self.password},
            format='json',
            **self.request_header,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_requires_authenticated_session(self):
        response = self.client.post(
            self.create_url,
            self.payload,
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('profiles.views.execute_model', return_value=MODEL_RESULT)
    def test_creates_profile_for_authenticated_user(self, model_mock):
        self.login()
        response = self.client.post(
            self.create_url,
            self.payload,
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        profile = FinancialProfile.objects.get(user=self.user)
        self.assertEqual(
            profile.primary_activity_classification,
            'ingenieria_y_desarrollo_de_software',
        )
        self.assertEqual(
            response.data['profile']['classification']['mvp_scope'],
            'dentro_del_mvp',
        )
        self.assertNotIn('model_result', response.data['profile'])
        self.assertNotIn('model_paragraph', response.data['profile'])
        model_mock.assert_called_once()

    @patch('profiles.views.execute_model', return_value=MODEL_RESULT)
    def test_rejects_second_profile_for_same_user(self, model_mock):
        self.login()
        self.client.post(
            self.create_url,
            self.payload,
            format='json',
            **self.request_header,
        )
        response = self.client.post(
            self.create_url,
            self.payload,
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(FinancialProfile.objects.filter(user=self.user).count(), 1)

    @patch('profiles.views.execute_model', return_value=MODEL_RESULT)
    def test_get_returns_current_user_profile(self, model_mock):
        self.login()
        self.client.post(
            self.create_url,
            self.payload,
            format='json',
            **self.request_header,
        )
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data['profile']['declared_data']['primary_activity'],
            'Desarrollador de software',
        )

    @patch('profiles.views.execute_model', return_value=MODEL_RESULT)
    def test_patch_reclassifies_profile(self, model_mock):
        self.login()
        self.client.post(
            self.create_url,
            self.payload,
            format='json',
            **self.request_header,
        )
        response = self.client.patch(
            self.me_url,
            {'next_goal': 'comprar equipo de trabajo'},
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            FinancialProfile.objects.get(user=self.user).next_goal,
            'comprar equipo de trabajo',
        )
        self.assertEqual(model_mock.call_count, 2)

    def test_rejects_debt_percentage_without_debt_type(self):
        self.login()
        self.payload['debt_types'] = []
        response = self.client.post(
            self.create_url,
            self.payload,
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('debt_types', response.data)


class FinancialProfileModelTests(APITestCase):
    def tearDown(self):
        load_user_model.cache_clear()

    def test_classifies_known_mvp_activity(self):
        result = classify_profile({
            'monthly_net_income': '3500000.00',
            'saving_habit': 'media',
            'debt_ratio_percentage': '20.00',
            'debt_types': ['tarjeta de credito'],
            'primary_activity': 'Desarrollador de software',
            'primary_income_modality': 'fijo',
            'has_additional_income': False,
            'additional_activity': '',
            'additional_income_modality': '',
            'next_goal': 'crear fondo de emergencia',
            'hobbies': ['ciclismo', 'fotografia'],
            'financial_responsibility': 'apoyo familiar',
        })

        self.assertEqual(result['estado_alcance_mvp'], 'dentro_del_mvp')
        self.assertEqual(
            result['actividad_principal'],
            'ingenieria_y_desarrollo_de_software',
        )
        self.assertEqual(result['version_modelo'], 'fincoach_usuario_mvp_v2')

    def test_evaluates_saving_habit_without_model_context(self):
        self.assertEqual(
            evaluate_auxiliary_filter('media'),
            'sin_alerta_auxiliar',
        )
