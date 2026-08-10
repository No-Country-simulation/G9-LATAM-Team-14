from urllib.parse import urlparse

from django.conf import settings
from django.contrib.auth import logout
from django.http import JsonResponse
from django.utils import timezone

from .models import UserSession
from .session_security import get_client_ip, get_user_agent, hash_session_key


class ApiRequestSecurityMiddleware:
    unsafe_methods = {'POST', 'PUT', 'PATCH', 'DELETE'}
    public_paths = {
        '/api/v1/auth/register/',
        '/api/v1/auth/login/',
        '/api/schema/',
        '/api/docs/',
    }

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        is_api_request = request.path.startswith('/api/')
        if is_api_request:
            security_response = self.validate_request(request)
            if security_response:
                return security_response

            if request.path not in self.public_paths:
                session_response = self.validate_session(request)
                if session_response:
                    return session_response

        response = self.get_response(request)
        if is_api_request:
            response['Cache-Control'] = 'no-store'
        return response

    def validate_request(self, request):
        if request.method not in self.unsafe_methods:
            return None

        if request.headers.get('X-FinCoach-Request') != '1':
            return JsonResponse(
                {'detail': 'The required request security header was not found.'},
                status=403,
            )

        content_type = request.content_type or ''
        if request.method in {'POST', 'PUT', 'PATCH'} and content_type != 'application/json':
            return JsonResponse(
                {'detail': 'Only application/json requests are accepted.'},
                status=415,
            )

        origin = request.headers.get('Origin')
        if origin and not self.is_allowed_origin(request, origin):
            return JsonResponse(
                {'detail': 'The request origin is not allowed.'},
                status=403,
            )
        if settings.ENVIRONMENT == 'production' and not origin:
            return JsonResponse(
                {'detail': 'The request origin was not found.'},
                status=403,
            )

        fetch_site = request.headers.get('Sec-Fetch-Site')
        if fetch_site and fetch_site not in {'same-origin', 'same-site', 'none'}:
            return JsonResponse(
                {'detail': 'Cross-site requests are not allowed.'},
                status=403,
            )
        return None

    def is_allowed_origin(self, request, origin):
        if origin in settings.FINCOACH_ALLOWED_ORIGINS:
            return True
        if settings.ENVIRONMENT != 'local':
            return False

        origin_host = urlparse(origin).hostname
        request_host = request.get_host().split(':')[0]
        return origin_host == request_host

    def validate_session(self, request):
        if not request.user.is_authenticated:
            return None

        session_key = request.session.session_key
        if not session_key:
            return self.close_session(request, None, 'missing_session')

        try:
            user_session = UserSession.objects.get(
                session_key_hash=hash_session_key(session_key),
                user=request.user,
            )
        except UserSession.DoesNotExist:
            return self.close_session(request, None, 'unregistered_session')

        now = timezone.now()
        if user_session.status != UserSession.STATUS_ACTIVE:
            return self.close_session(request, user_session, 'inactive_session')
        if now >= user_session.absolute_expires_at:
            return self.close_session(request, user_session, 'absolute_expiration')
        if now >= user_session.inactivity_expires_at:
            return self.close_session(request, user_session, 'inactivity_expiration')
        if user_session.user_agent != get_user_agent(request):
            return self.close_session(request, user_session, 'user_agent_changed')
        if user_session.ip_address != get_client_ip(request):
            return self.close_session(request, user_session, 'ip_address_changed')

        user_session.last_activity = now
        user_session.inactivity_expires_at = now + settings.FINCOACH_SESSION_INACTIVITY
        user_session.save(update_fields=['last_activity', 'inactivity_expires_at'])
        return None

    def close_session(self, request, user_session, reason):
        if user_session and user_session.status == UserSession.STATUS_ACTIVE:
            user_session.status = UserSession.STATUS_EXPIRED
            user_session.revoked_at = timezone.now()
            user_session.revocation_reason = reason
            user_session.save(
                update_fields=['status', 'revoked_at', 'revocation_reason'],
            )
        logout(request)
        return JsonResponse(
            {'detail': 'The session is invalid or has expired.'},
            status=401,
        )
