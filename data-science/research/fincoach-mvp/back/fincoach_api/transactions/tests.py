from datetime import date
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from profiles.models import FinancialProfile

from .models import Transaction
from .services import build_regularity_history, load_transaction_model


MODEL_CLASSIFICATION = {
    'movement_type': 'gasto',
    'category': 'Alimentación',
    'category_confidence_percentage': 86.5,
    'category_percentages': {
        'Alimentación': 86.5,
        'Ocio': 8.5,
        'Otra / ambigua': 5.0,
    },
    'top_categories': [
        {'category': 'Alimentación', 'percentage': 86.5},
        {'category': 'Ocio', 'percentage': 8.5},
        {'category': 'Otra / ambigua', 'percentage': 3.0},
        {'category': 'Servicios', 'percentage': 2.0},
    ],
    'purpose': 'consumo_personal',
    'purpose_confidence_percentage': 82.0,
    'regularity': 'variable',
    'regularity_confidence_percentage': 90.0,
    'regularity_model_confidence_percentage': 94.0,
    'regularity_description_similarity_percentage': 92.0,
    'regularity_history_available': True,
    'regularity_description_known': True,
    'regularity_requires_confirmation': False,
    'category_requires_confirmation': False,
    'regularity_history': {
        'ocurrencias_previas_90d': 2.0,
        'meses_previos_con_movimiento': 2.0,
        'dias_desde_movimiento_similar': 30.0,
        'variacion_valor_previa_pct': 3.5,
        'historial_disponible_modelo': 1,
    },
    'requires_confirmation': False,
    'confirmation_probability_percentage': 12.0,
    'category_purpose_pair_valid': True,
    'rule': 'modelo_contextual',
    'model_version': 'fincoach_transacciones_mvp_v3',
    'profile_context': {'mvp_scope': 'dentro_del_mvp'},
    'model_text': 'transaction model input',
}

MODEL_CATALOGS = {
    'categories': [
        'Alimentación',
        'Inversión productiva',
        'Ocio',
        'Otra / ambigua',
    ],
    'purposes': ['consumo_mixto', 'consumo_personal', 'laboral'],
}


class TransactionModelContractTests(SimpleTestCase):
    def test_loads_the_v3_transaction_artifact(self):
        load_transaction_model.cache_clear()

        artifact = load_transaction_model()

        self.assertEqual(
            artifact['version_modelo'],
            'fincoach_transacciones_mvp_v3',
        )
        self.assertEqual(
            set(artifact['modelo_regularidad_gastos'].classes_),
            {'fijo', 'variable'},
        )
        self.assertEqual(
            set(artifact['modelo_regularidad_ingresos'].classes_),
            {'fijo', 'variable', 'estacional'},
        )


class TransactionApiTests(APITestCase):
    request_header = {'HTTP_X_FINCOACH_REQUEST': '1'}

    def setUp(self):
        self.client = APIClient(
            HTTP_USER_AGENT='FinCoachTransactionTests/1.0',
            REMOTE_ADDR='127.0.0.1',
        )
        self.password = 'ClaveSegura123!'
        self.user = get_user_model().objects.create_user(
            email='transactions@example.com',
            password=self.password,
            first_name='Transaction',
            last_name='Test',
            acepta_tratamiento_datos=True,
        )
        self.profile = self.create_profile(self.user)
        self.list_create_url = reverse('transactions:list-create')
        self.payload = {
            'transaction_date': '2026-08-03',
            'description': 'Compra mercado',
            'note': 'Alimentos para el hogar',
            'amount': '180000.00',
            'direction': 'salida',
        }

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
            model_result={
                'estado_ingreso_actual': 'fijo',
                'tipos_deuda': ['tarjeta de credito'],
            },
        )

    def login(self):
        response = self.client.post(
            reverse('accounts:login'),
            {'email': self.user.email, 'password': self.password},
            format='json',
            **self.request_header,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def register_transaction(self):
        response = self.client.post(
            self.list_create_url,
            self.payload,
            format='json',
            **self.request_header,
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return Transaction.objects.get(id=response.data['transaction']['id'])

    def classify(self, transaction):
        with patch(
            'transactions.views.execute_model',
            return_value=MODEL_CLASSIFICATION,
        ), patch(
            'transactions.views.get_catalogs_or_raise',
            return_value=MODEL_CATALOGS,
        ):
            return self.client.post(
                reverse('transactions:classify', args=[transaction.id]),
                {},
                format='json',
                **self.request_header,
            )

    def test_registration_requires_authenticated_session(self):
        response = self.client.post(
            self.list_create_url,
            self.payload,
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_registers_transaction_without_classifying_it(self):
        self.login()
        transaction = self.register_transaction()

        self.assertEqual(transaction.status, 'pending_classification')
        self.assertEqual(transaction.model_category, '')

    def test_classifies_transaction_and_waits_for_user_decision(self):
        self.login()
        transaction = self.register_transaction()
        response = self.classify(transaction)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        transaction.refresh_from_db()
        self.assertEqual(transaction.status, 'awaiting_confirmation')
        self.assertEqual(transaction.model_category, 'Alimentación')
        self.assertEqual(
            response.data['model_suggestion']['category'],
            'Alimentación',
        )
        self.assertEqual(
            len(response.data['model_suggestion']['alternative_categories']),
            3,
        )
        self.assertNotIn('selection_options', response.data)
        self.assertTrue(response.data['user_confirmation_required'])
        self.assertTrue(
            response.data['model_suggestion'][
                'regularity_history_available'
            ]
        )
        self.assertFalse(
            response.data['model_suggestion'][
                'regularity_requires_review'
            ]
        )

    def test_executes_the_real_v3_model_contract(self):
        self.login()
        transaction = self.register_transaction()
        response = self.client.post(
            reverse('transactions:classify', args=[transaction.id]),
            {},
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        transaction.refresh_from_db()
        self.assertEqual(
            transaction.model_version,
            'fincoach_transacciones_mvp_v3',
        )
        self.assertIn(
            transaction.model_regularity,
            {'fijo', 'variable'},
        )
        self.assertIn(
            'regularity_history_available',
            transaction.model_result,
        )

    def test_confirms_model_suggestion(self):
        self.login()
        transaction = self.register_transaction()
        self.classify(transaction)
        response = self.client.patch(
            reverse('transactions:confirm', args=[transaction.id]),
            {
                'selected_categories': [
                    {'category': 'Alimentación', 'percentage': '100.00'},
                ],
                'selected_regularity': 'variable',
            },
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        transaction.refresh_from_db()
        self.assertEqual(transaction.status, 'confirmed')
        self.assertEqual(transaction.classification_source, 'model_confirmed')
        self.assertEqual(
            response.data['confirmed_classification']['categories'][0]['category'],
            'Alimentación',
        )
        self.assertFalse(response.data['was_corrected'])
        self.assertEqual(
            transaction.current_categories,
            [{'category': 'Alimentación', 'percentage': 100.0}],
        )

    def test_corrects_with_multiple_categories_and_keeps_audit(self):
        self.login()
        transaction = self.register_transaction()
        self.classify(transaction)
        response = self.client.patch(
            reverse('transactions:confirm', args=[transaction.id]),
            {
                'selected_categories': [
                    {'category': 'Inversión productiva', 'percentage': '60.00'},
                    {'category': 'Ocio', 'percentage': '40.00'},
                ],
                'selected_purpose': 'consumo_mixto',
                'selected_regularity': 'variable',
            },
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        transaction.refresh_from_db()
        self.assertEqual(transaction.classification_source, 'user_correction')
        self.assertEqual(transaction.revision_count, 1)
        self.assertEqual(transaction.first_user_decision['decision'], 'correct')
        self.assertEqual(len(transaction.decision_history), 1)
        self.assertEqual(transaction.model_category, 'Alimentación')

    def test_rejects_correction_percentages_that_do_not_add_to_one_hundred(self):
        self.login()
        transaction = self.register_transaction()
        self.classify(transaction)
        response = self.client.patch(
            reverse('transactions:confirm', args=[transaction.id]),
            {
                'selected_categories': [
                    {'category': 'Inversión productiva', 'percentage': '60.00'},
                    {'category': 'Ocio', 'percentage': '30.00'},
                ],
                'selected_purpose': 'consumo_mixto',
                'selected_regularity': 'variable',
            },
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('selected_categories', response.data)

    def test_allows_a_confirmed_transaction_to_be_corrected_later(self):
        self.login()
        transaction = self.register_transaction()
        self.classify(transaction)
        confirmation_url = reverse(
            'transactions:confirm',
            args=[transaction.id],
        )
        self.client.patch(
            confirmation_url,
            {
                'selected_categories': [
                    {'category': 'Alimentación', 'percentage': '100.00'},
                ],
                'selected_regularity': 'variable',
            },
            format='json',
            **self.request_header,
        )

        with patch(
            'transactions.views.get_catalogs_or_raise',
            return_value=MODEL_CATALOGS,
        ):
            response = self.client.patch(
                confirmation_url,
                {
                    'selected_categories': [
                        {'category': 'Ocio', 'percentage': '100.00'},
                    ],
                    'selected_purpose': 'consumo_personal',
                    'selected_regularity': 'variable',
                },
                format='json',
                **self.request_header,
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        transaction.refresh_from_db()
        self.assertEqual(transaction.first_user_decision['decision'], 'confirm')
        self.assertEqual(transaction.classification_source, 'user_correction')
        self.assertEqual(transaction.revision_count, 1)
        self.assertEqual(len(transaction.decision_history), 2)

    def test_corrects_regularity_without_overwriting_model_suggestion(self):
        self.login()
        transaction = self.register_transaction()
        self.classify(transaction)
        transaction.model_regularity = 'fijo'
        transaction.save(update_fields=['model_regularity'])

        with patch(
            'transactions.views.get_catalogs_or_raise',
            return_value=MODEL_CATALOGS,
        ):
            response = self.client.patch(
                reverse('transactions:confirm', args=[transaction.id]),
                {
                    'selected_categories': [
                        {'category': 'Alimentación', 'percentage': '100.00'},
                    ],
                    'selected_regularity': 'variable',
                },
                format='json',
                **self.request_header,
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        transaction.refresh_from_db()
        self.assertEqual(transaction.model_regularity, 'fijo')
        self.assertEqual(transaction.current_regularity, 'variable')
        self.assertEqual(transaction.classification_source, 'user_correction')
        self.assertEqual(
            response.data['confirmed_classification']['regularity'],
            'variable',
        )

    def test_rejects_a_pending_suggestion_from_an_older_model(self):
        self.login()
        transaction = self.register_transaction()
        self.classify(transaction)
        transaction.model_version = 'fincoach_transacciones_mvp_v2'
        transaction.save(update_fields=['model_version'])

        response = self.client.patch(
            reverse('transactions:confirm', args=[transaction.id]),
            {
                'selected_categories': [
                    {'category': 'Alimentación', 'percentage': '100.00'},
                ],
                'selected_regularity': 'variable',
            },
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(
            response.data['next_step']['method'],
            'POST',
        )

    def test_accepts_seasonal_regularity_only_for_income(self):
        self.login()
        income = Transaction.objects.create(
            user=self.user,
            financial_profile=self.profile,
            transaction_date=date(2026, 8, 3),
            description='Ingreso cosecha',
            amount='800000.00',
            direction='entrada',
            status='awaiting_confirmation',
            model_category='Alimentación',
            model_purpose='consumo_personal',
            model_regularity='estacional',
            model_version='fincoach_transacciones_mvp_v3',
        )
        expense = Transaction.objects.create(
            user=self.user,
            financial_profile=self.profile,
            transaction_date=date(2026, 8, 3),
            description='Compra mercado',
            amount='180000.00',
            direction='salida',
            status='awaiting_confirmation',
            model_category='Alimentación',
            model_purpose='consumo_personal',
            model_regularity='variable',
            model_version='fincoach_transacciones_mvp_v3',
        )
        payload = {
            'selected_categories': [
                {'category': 'Alimentación', 'percentage': '100.00'},
            ],
            'selected_regularity': 'estacional',
        }
        with patch(
            'transactions.views.get_catalogs_or_raise',
            return_value=MODEL_CATALOGS,
        ):
            income_response = self.client.patch(
                reverse('transactions:confirm', args=[income.id]),
                payload,
                format='json',
                **self.request_header,
            )
            expense_response = self.client.patch(
                reverse('transactions:confirm', args=[expense.id]),
                payload,
                format='json',
                **self.request_header,
            )

        self.assertEqual(income_response.status_code, status.HTTP_200_OK)
        self.assertEqual(expense_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_builds_regularity_history_from_previous_confirmed_movements(self):
        Transaction.objects.create(
            user=self.user,
            financial_profile=self.profile,
            transaction_date=date(2026, 4, 29),
            description='Supermercado',
            amount='147000.00',
            direction='salida',
            status='confirmed',
        )
        Transaction.objects.create(
            user=self.user,
            financial_profile=self.profile,
            transaction_date=date(2026, 5, 3),
            description='SUPERMERCADO',
            amount='151000.00',
            direction='salida',
            status='confirmed',
        )
        current = Transaction.objects.create(
            user=self.user,
            financial_profile=self.profile,
            transaction_date=date(2026, 6, 1),
            description='supermercado',
            amount='82000.00',
            direction='salida',
        )

        history = build_regularity_history(current)

        self.assertEqual(history['ocurrencias_previas_90d'], 2.0)
        self.assertEqual(history['meses_previos_con_movimiento'], 2.0)
        self.assertEqual(history['dias_desde_movimiento_similar'], 29.0)
        self.assertAlmostEqual(history['variacion_valor_previa_pct'], 1.34, places=2)
        self.assertEqual(history['historial_disponible_modelo'], 1)

    def test_does_not_expose_another_users_transaction(self):
        self.login()
        other_user = get_user_model().objects.create_user(
            email='other@example.com',
            password=self.password,
            acepta_tratamiento_datos=True,
        )
        other_profile = self.create_profile(other_user)
        transaction = Transaction.objects.create(
            user=other_user,
            financial_profile=other_profile,
            **self.payload,
        )
        response = self.client.post(
            reverse('transactions:classify', args=[transaction.id]),
            {},
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_history_is_paginated_and_can_filter_by_month(self):
        self.login()
        for day in range(1, 10):
            Transaction.objects.create(
                user=self.user,
                financial_profile=self.profile,
                transaction_date='2026-08-{:02d}'.format(day),
                description='Transaction {}'.format(day),
                amount='10000.00',
                direction='salida',
            )
        Transaction.objects.create(
            user=self.user,
            financial_profile=self.profile,
            transaction_date='2026-07-31',
            description='Previous month',
            amount='10000.00',
            direction='salida',
        )

        response = self.client.get(
            '{}?month=2026-08&page=2'.format(self.list_create_url),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['pagination']['total_items'], 9)
        self.assertEqual(response.data['pagination']['total_pages'], 2)
        self.assertEqual(len(response.data['transactions']), 2)
