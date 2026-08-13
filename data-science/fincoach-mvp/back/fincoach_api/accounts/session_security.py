from django.conf import settings
from django.contrib.sessions.models import Session
from django.utils import timezone
from django.utils.crypto import salted_hmac

from .models import UserSession


def hash_session_key(session_key):
    return salted_hmac(
        'accounts.user-session',
        session_key,
        secret=settings.SECRET_KEY,
        algorithm='sha256',
    ).hexdigest()


def get_client_ip(request):
    if settings.ENVIRONMENT == 'production':
        forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def get_user_agent(request):
    return request.META.get('HTTP_USER_AGENT', '')[:1000]


def delete_django_session(session_key_hash):
    for session in Session.objects.filter(expire_date__gt=timezone.now()).iterator():
        if hash_session_key(session.session_key) == session_key_hash:
            session.delete()
            return True
    return False


def revoke_user_sessions(user, reason):
    now = timezone.now()
    sessions = UserSession.objects.filter(
        user=user,
        status=UserSession.STATUS_ACTIVE,
    )
    for user_session in sessions:
        delete_django_session(user_session.session_key_hash)
    sessions.update(
        status=UserSession.STATUS_REVOKED,
        revoked_at=now,
        revocation_reason=reason,
    )


def revoke_current_session(request, reason):
    session_key = request.session.session_key
    if not session_key:
        return
    UserSession.objects.filter(
        session_key_hash=hash_session_key(session_key),
        status=UserSession.STATUS_ACTIVE,
    ).update(
        status=UserSession.STATUS_REVOKED,
        revoked_at=timezone.now(),
        revocation_reason=reason,
    )
