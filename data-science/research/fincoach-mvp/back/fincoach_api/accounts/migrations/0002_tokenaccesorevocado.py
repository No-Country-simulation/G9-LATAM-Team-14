from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='TokenAccesoRevocado',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('jti', models.CharField(max_length=255, unique=True)),
                ('expira_en', models.DateTimeField()),
                ('revocado_en', models.DateTimeField(auto_now_add=True)),
                (
                    'usuario',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='tokens_acceso_revocados',
                        to='accounts.usuario',
                    ),
                ),
            ],
            options={
                'verbose_name': 'token de acceso revocado',
                'verbose_name_plural': 'tokens de acceso revocados',
                'ordering': ['-revocado_en'],
            },
        ),
    ]
