from django.conf import settings
from django.contrib.auth import login, logout
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from fincoach_api.openapi import (
    AUTHENTICATION_ERROR,
    EmptyRequestSerializer,
    SECURITY_HEADER,
    VALIDATION_ERROR,
    object_response,
)

from .models import UserSession
from .serializers import LoginSerializer, RegisterUserSerializer, UserSerializer
from .session_security import (
    get_client_ip,
    get_user_agent,
    hash_session_key,
    revoke_current_session,
    revoke_user_sessions,
)


class RegisterUserView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Register a user',
        description='Creates a user after accepting the personal data processing policy.',
        operation_id='auth_register',
        auth=[],
        parameters=[SECURITY_HEADER],
        request=RegisterUserSerializer,
        responses={
            201: object_response(
                'The user was registered successfully.',
                'Registered user',
                {
                    'message': 'User registered successfully.',
                    'user': {
                        'id': 6,
                        'first_name': 'Jeison',
                        'last_name': 'Test',
                        'email': 'jeis@example.com',
                    },
                },
            ),
            400: VALIDATION_ERROR,
        },
    )
    def post(self, request):
        serializer = RegisterUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'message': 'User registered successfully.',
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Start a session',
        description=(
            'Validates the credentials, revokes previous sessions and sets the '
            'HTTP-only FinCoach session cookie.'
        ),
        operation_id='auth_login',
        auth=[],
        parameters=[SECURITY_HEADER],
        request=LoginSerializer,
        responses={
            200: object_response(
                'The session was created successfully.',
                'Successful login',
                {
                    'message': 'Login successful.',
                    'session': {
                        'inactivity_expires_in_hours': 8,
                        'absolute_expires_in_hours': 24,
                    },
                    'user': {
                        'id': 6,
                        'first_name': 'Jeison',
                        'last_name': 'Test',
                        'email': 'jeis@example.com',
                    },
                },
            ),
            400: VALIDATION_ERROR,
        },
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        if request._request.user.is_authenticated:
            revoke_current_session(request._request, 'new_login')
            logout(request._request)
        revoke_user_sessions(user, 'new_login')

        login(request._request, user)
        request._request.session.set_expiry(settings.SESSION_COOKIE_AGE)
        request._request.session.save()

        now = timezone.now()
        UserSession.objects.create(
            user=user,
            session_key_hash=hash_session_key(request._request.session.session_key),
            status=UserSession.STATUS_ACTIVE,
            last_activity=now,
            inactivity_expires_at=now + settings.FINCOACH_SESSION_INACTIVITY,
            absolute_expires_at=now + settings.FINCOACH_SESSION_ABSOLUTE,
            ip_address=get_client_ip(request._request),
            user_agent=get_user_agent(request._request),
        )

        return Response(
            {
                'message': 'Login successful.',
                'session': {
                    'inactivity_expires_in_hours': int(
                        settings.FINCOACH_SESSION_INACTIVITY.total_seconds() / 3600
                    ),
                    'absolute_expires_in_hours': int(
                        settings.FINCOACH_SESSION_ABSOLUTE.total_seconds() / 3600
                    ),
                },
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Authentication'],
        summary='Close the current session',
        description='Revokes the current server-side session and deletes its cookie.',
        operation_id='auth_logout',
        parameters=[SECURITY_HEADER],
        request=EmptyRequestSerializer,
        responses={
            200: object_response(
                'The session was closed successfully.',
                'Successful logout',
                {'message': 'Logout successful.'},
            ),
            401: AUTHENTICATION_ERROR,
        },
    )
    def post(self, request):
        revoke_current_session(request._request, 'user_logout')
        logout(request._request)
        return Response(
            {'message': 'Logout successful.'},
            status=status.HTTP_200_OK,
        )


class AuthenticatedUserView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Authentication'],
        summary='Get the authenticated user',
        description='Validates the session cookie and returns its user.',
        operation_id='auth_me',
        responses={
            200: object_response(
                'The current session is valid.',
                'Authenticated user',
                {
                    'authenticated': True,
                    'user': {
                        'id': 6,
                        'first_name': 'Jeison',
                        'last_name': 'Test',
                        'email': 'jeis@example.com',
                    },
                },
            ),
            401: AUTHENTICATION_ERROR,
        },
    )
    def get(self, request):
        return Response(
            {
                'authenticated': True,
                'user': UserSerializer(request.user).data,
            },
            status=status.HTTP_200_OK,
        )
