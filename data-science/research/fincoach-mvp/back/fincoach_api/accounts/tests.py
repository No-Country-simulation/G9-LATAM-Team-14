from django.conf import settings
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .models import UserSession


class ApiSecurityMixin:
    request_header = {'HTTP_X_FINCOACH_REQUEST': '1'}

    def create_client(self, user_agent='FinCoachTests/1.0', ip_address='127.0.0.1'):
        return APIClient(
            HTTP_USER_AGENT=user_agent,
            REMOTE_ADDR=ip_address,
        )


class RegisterUserTests(ApiSecurityMixin, APITestCase):
    def setUp(self):
        self.client = self.create_client()
        self.url = reverse('accounts:register')
        self.data = {
            'first_name': 'Jeison',
            'last_name': 'Test',
            'email': 'jeis@example.com',
            'password': 'ClaveSegura123!',
            'accepts_data_processing': True,
        }

    def test_registers_user_without_creating_session(self):
        response = self.client.post(
            self.url,
            self.data,
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = get_user_model().objects.get(email=self.data['email'])
        self.assertTrue(user.check_password(self.data['password']))
        self.assertNotEqual(user.password, self.data['password'])
        self.assertNotIn('password', response.data['user'])
        self.assertNotIn(settings.SESSION_COOKIE_NAME, response.cookies)

    def test_rejects_registration_without_security_header(self):
        response = self.client.post(self.url, self.data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            response.json()['detail'],
            'The required request security header was not found.',
        )

    def test_rejects_registration_without_data_processing_acceptance(self):
        self.data['accepts_data_processing'] = False
        response = self.client.post(
            self.url,
            self.data,
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('accepts_data_processing', response.data)

    def test_rejects_duplicate_email(self):
        self.client.post(
            self.url,
            self.data,
            format='json',
            **self.request_header,
        )
        response = self.client.post(
            self.url,
            self.data,
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)


class LoginTests(ApiSecurityMixin, APITestCase):
    def setUp(self):
        self.client = self.create_client()
        self.url = reverse('accounts:login')
        self.password = 'ClaveSegura123!'
        self.user = get_user_model().objects.create_user(
            email='jeis@example.com',
            password=self.password,
            first_name='Jeison',
            last_name='Prueba',
            acepta_tratamiento_datos=True,
        )

    def test_login_creates_only_server_session_cookie(self):
        response = self.client.post(
            self.url,
            {'email': self.user.email, 'password': self.password},
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn('access', response.data)
        self.assertNotIn('refresh', response.data)
        self.assertNotIn('csrf_token', response.data)
        self.assertIn(settings.SESSION_COOKIE_NAME, response.cookies)
        self.assertEqual(response.data['session']['inactivity_expires_in_hours'], 8)
        self.assertEqual(response.data['session']['absolute_expires_in_hours'], 24)

        user_session = UserSession.objects.get(user=self.user)
        cookie_value = response.cookies[settings.SESSION_COOKIE_NAME].value
        self.assertNotEqual(user_session.session_key_hash, cookie_value)
        self.assertEqual(user_session.status, UserSession.STATUS_ACTIVE)

    def test_login_rejects_incorrect_credentials(self):
        response = self.client.post(
            self.url,
            {'email': self.user.email, 'password': 'PasswordIncorrecto123!'},
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn(settings.SESSION_COOKIE_NAME, response.cookies)

    def test_new_login_revokes_previous_session(self):
        first_client = self.create_client()
        second_client = self.create_client()
        credentials = {'email': self.user.email, 'password': self.password}

        first_client.post(
            self.url,
            credentials,
            format='json',
            **self.request_header,
        )
        second_client.post(
            self.url,
            credentials,
            format='json',
            **self.request_header,
        )

        first_me = first_client.get(reverse('accounts:me'))
        second_me = second_client.get(reverse('accounts:me'))

        self.assertEqual(first_me.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(second_me.status_code, status.HTTP_200_OK)
        self.assertEqual(
            UserSession.objects.filter(status=UserSession.STATUS_ACTIVE).count(),
            1,
        )


class AuthenticatedUserTests(ApiSecurityMixin, APITestCase):
    def setUp(self):
        self.client = self.create_client()
        self.login_url = reverse('accounts:login')
        self.me_url = reverse('accounts:me')
        self.password = 'ClaveSegura123!'
        self.user = get_user_model().objects.create_user(
            email='authenticated@example.com',
            password=self.password,
            first_name='Usuario',
            last_name='Autenticado',
            acepta_tratamiento_datos=True,
        )

    def login(self):
        return self.client.post(
            self.login_url,
            {'email': self.user.email, 'password': self.password},
            format='json',
            **self.request_header,
        )

    def test_returns_user_from_valid_session(self):
        self.login()
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['authenticated'])
        self.assertEqual(response.data['user']['email'], self.user.email)
        self.assertNotIn('password', response.data['user'])

    def test_rejects_request_without_session(self):
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            response.data['detail'],
            'Authentication credentials were not found.',
        )

    def test_rejects_forged_session(self):
        self.client.cookies[settings.SESSION_COOKIE_NAME] = 'forged-session'
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('authenticated', response.data)

    def test_authorization_header_does_not_authenticate(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invented-token')
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn('authenticated', response.data)

    def test_rejects_session_from_different_device(self):
        self.login()
        self.client.defaults['HTTP_USER_AGENT'] = 'DifferentDevice/2.0'
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            response.json()['detail'],
            'The session is invalid or has expired.',
        )
        self.assertEqual(
            UserSession.objects.get(user=self.user).revocation_reason,
            'user_agent_changed',
        )


class LogoutTests(ApiSecurityMixin, APITestCase):
    def setUp(self):
        self.client = self.create_client()
        self.login_url = reverse('accounts:login')
        self.logout_url = reverse('accounts:logout')
        self.password = 'ClaveSegura123!'
        self.user = get_user_model().objects.create_user(
            email='logout@example.com',
            password=self.password,
            acepta_tratamiento_datos=True,
        )

    def test_logout_revokes_session(self):
        self.client.post(
            self.login_url,
            {'email': self.user.email, 'password': self.password},
            format='json',
            **self.request_header,
        )
        response = self.client.post(
            self.logout_url,
            {},
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user_session = UserSession.objects.get(user=self.user)
        self.assertEqual(user_session.status, UserSession.STATUS_REVOKED)
        self.assertEqual(user_session.revocation_reason, 'user_logout')

        me_response = self.client.get(reverse('accounts:me'))
        self.assertEqual(me_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_requires_session(self):
        response = self.client.post(
            self.logout_url,
            {},
            format='json',
            **self.request_header,
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
