import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_delete_tokenaccesorevocado'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('session_key_hash', models.CharField(max_length=64, unique=True)),
                ('status', models.CharField(choices=[('active', 'Active'), ('revoked', 'Revoked'), ('expired', 'Expired')], default='active', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_activity', models.DateTimeField()),
                ('inactivity_expires_at', models.DateTimeField()),
                ('absolute_expires_at', models.DateTimeField()),
                ('revoked_at', models.DateTimeField(blank=True, null=True)),
                ('revocation_reason', models.CharField(blank=True, max_length=50)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_sessions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'user session',
                'verbose_name_plural': 'user sessions',
                'ordering': ['-created_at'],
            },
        ),
    ]
