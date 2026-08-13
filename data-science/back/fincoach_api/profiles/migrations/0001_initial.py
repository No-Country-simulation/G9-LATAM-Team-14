import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='FinancialProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('monthly_net_income', models.DecimalField(decimal_places=2, max_digits=14, validators=[django.core.validators.MinValueValidator(0)])),
                ('saving_habit', models.CharField(choices=[('nunca', 'Nunca'), ('baja', 'Baja'), ('media', 'Media'), ('alta', 'Alta')], max_length=10)),
                ('debt_ratio_percentage', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('debt_types', models.JSONField(blank=True, default=list)),
                ('primary_activity', models.CharField(max_length=250)),
                ('primary_income_modality', models.CharField(choices=[('fijo', 'Fijo'), ('variable', 'Variable'), ('mixto', 'Mixto'), ('estacional', 'Estacional'), ('apoyo', 'Apoyo'), ('sin_ingresos', 'Sin ingresos')], max_length=20)),
                ('has_additional_income', models.BooleanField(default=False)),
                ('additional_activity', models.CharField(blank=True, max_length=250)),
                ('additional_income_modality', models.CharField(blank=True, choices=[('fijo', 'Fijo'), ('variable', 'Variable'), ('mixto', 'Mixto'), ('estacional', 'Estacional'), ('apoyo', 'Apoyo'), ('sin_ingresos', 'Sin ingresos')], max_length=20)),
                ('next_goal', models.CharField(blank=True, max_length=300)),
                ('hobbies', models.JSONField(blank=True, default=list)),
                ('financial_responsibility', models.CharField(blank=True, max_length=300)),
                ('model_paragraph', models.TextField()),
                ('auxiliary_filter_status', models.CharField(max_length=50)),
                ('mvp_scope_status', models.CharField(max_length=50)),
                ('primary_activity_classification', models.CharField(max_length=150)),
                ('cuoc_occupation', models.CharField(max_length=300)),
                ('cuoc_code', models.CharField(max_length=50)),
                ('activity_confidence_percentage', models.DecimalField(decimal_places=2, max_digits=6)),
                ('model_probability_percentage', models.DecimalField(decimal_places=2, max_digits=6)),
                ('catalog_similarity_percentage', models.DecimalField(decimal_places=2, max_digits=6)),
                ('secondary_activity_classification', models.CharField(max_length=150)),
                ('classified_hobbies', models.JSONField(blank=True, default=list)),
                ('out_of_mvp_hobbies', models.JSONField(blank=True, default=list)),
                ('classified_goal', models.CharField(max_length=300)),
                ('classified_responsibility', models.CharField(max_length=300)),
                ('debt_calculation_status', models.CharField(max_length=50)),
                ('top_3_activities', models.JSONField(default=list)),
                ('model_version', models.CharField(max_length=50)),
                ('model_result', models.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='financial_profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'financial profile',
                'verbose_name_plural': 'financial profiles',
                'ordering': ['-updated_at'],
            },
        ),
    ]
