from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils import timezone

from .forms import UsuarioChangeForm, UsuarioCreationForm
from .models import UserSession, Usuario
from .session_security import delete_django_session


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    add_form = UsuarioCreationForm
    form = UsuarioChangeForm
    model = Usuario
    ordering = ['email']
    list_display = ['email', 'first_name', 'last_name', 'is_active', 'is_staff']
    search_fields = ['email', 'first_name', 'last_name']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información personal', {'fields': ('first_name', 'last_name')}),
        ('Tratamiento de datos', {'fields': ('acepta_tratamiento_datos', 'fecha_aceptacion_datos')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas', {'fields': ('last_login', 'date_joined', 'creado_en', 'actualizado_en')}),
    )
    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': (
                    'email',
                    'first_name',
                    'last_name',
                    'password1',
                    'password2',
                    'acepta_tratamiento_datos',
                    'is_staff',
                    'is_active',
                ),
            },
        ),
    )
    readonly_fields = ['fecha_aceptacion_datos', 'creado_en', 'actualizado_en']


@admin.action(description='Revoke selected sessions')
def revoke_sessions(modeladmin, request, queryset):
    now = timezone.now()
    for user_session in queryset.filter(status=UserSession.STATUS_ACTIVE):
        delete_django_session(user_session.session_key_hash)
        user_session.status = UserSession.STATUS_REVOKED
        user_session.revoked_at = now
        user_session.revocation_reason = 'admin_revocation'
        user_session.save(
            update_fields=['status', 'revoked_at', 'revocation_reason'],
        )


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = [
        'user',
        'session_reference',
        'display_status',
        'ip_address',
        'created_at',
        'last_activity',
        'inactivity_expires_at',
        'absolute_expires_at',
    ]
    list_filter = ['status', 'created_at', 'absolute_expires_at']
    search_fields = ['user__email', 'session_key_hash', 'ip_address', 'user_agent']
    readonly_fields = [
        'user',
        'session_reference',
        'session_key_hash',
        'display_status',
        'status',
        'created_at',
        'last_activity',
        'inactivity_expires_at',
        'absolute_expires_at',
        'revoked_at',
        'revocation_reason',
        'ip_address',
        'user_agent',
    ]
    actions = [revoke_sessions]

    @admin.display(description='Current status')
    def display_status(self, obj):
        return obj.current_status

    def has_add_permission(self, request):
        return False
