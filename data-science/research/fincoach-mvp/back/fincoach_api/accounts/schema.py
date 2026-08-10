from django.conf import settings
from drf_spectacular.extensions import OpenApiAuthenticationExtension


class FinCoachSessionAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = 'accounts.authentication.SessionAuthentication401'
    name = 'FinCoachSession'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'apiKey',
            'in': 'cookie',
            'name': settings.SESSION_COOKIE_NAME,
            'description': (
                'HTTP-only session cookie issued by POST /api/v1/auth/login/. '
                'The browser sends it automatically and JavaScript cannot read it.'
            ),
        }
