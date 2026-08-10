from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **campos_adicionales):
        if not email:
            raise ValueError('El correo es obligatorio.')
        email = self.normalize_email(email)
        usuario = self.model(email=email, **campos_adicionales)
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, email, password=None, **campos_adicionales):
        campos_adicionales.setdefault('is_staff', True)
        campos_adicionales.setdefault('is_superuser', True)
        campos_adicionales.setdefault('is_active', True)
        campos_adicionales.setdefault('acepta_tratamiento_datos', True)

        if campos_adicionales.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if campos_adicionales.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')
        return self.create_user(email, password, **campos_adicionales)


class Usuario(AbstractUser):
    username = None
    email = models.EmailField('correo electrónico', unique=True)
    acepta_tratamiento_datos = models.BooleanField(default=False)
    fecha_aceptacion_datos = models.DateTimeField(null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UsuarioManager()

    class Meta:
        verbose_name = 'usuario'
        verbose_name_plural = 'usuarios'

    def __str__(self):
        return self.email


class UserSession(models.Model):
    STATUS_ACTIVE = 'active'
    STATUS_REVOKED = 'revoked'
    STATUS_EXPIRED = 'expired'
    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_REVOKED, 'Revoked'),
        (STATUS_EXPIRED, 'Expired'),
    ]

    user = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='user_sessions',
    )
    session_key_hash = models.CharField(max_length=64, unique=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField()
    inactivity_expires_at = models.DateTimeField()
    absolute_expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)
    revocation_reason = models.CharField(max_length=50, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'user session'
        verbose_name_plural = 'user sessions'

    @property
    def current_status(self):
        if self.status == self.STATUS_ACTIVE and timezone.now() >= self.absolute_expires_at:
            return self.STATUS_EXPIRED
        if self.status == self.STATUS_ACTIVE and timezone.now() >= self.inactivity_expires_at:
            return self.STATUS_EXPIRED
        return self.status

    @property
    def session_reference(self):
        return self.session_key_hash[:12]

    def __str__(self):
        return '{} - {}'.format(self.user.email, self.current_status)
