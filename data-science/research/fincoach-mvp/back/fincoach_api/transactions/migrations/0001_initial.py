import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('profiles', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('transaction_date', models.DateField()),
                ('description', models.CharField(max_length=250)),
                ('note', models.CharField(blank=True, max_length=300)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=14, validators=[django.core.validators.MinValueValidator(0.01)])),
                ('currency', models.CharField(default='COP', editable=False, max_length=3)),
                ('direction', models.CharField(choices=[('entrada', 'Income'), ('salida', 'Expense')], max_length=10)),
                ('status', models.CharField(choices=[('pending_classification', 'Pending classification'), ('awaiting_confirmation', 'Awaiting confirmation'), ('confirmed', 'Confirmed')], default='pending_classification', max_length=30)),
                ('movement_type', models.CharField(blank=True, max_length=40)),
                ('model_category', models.CharField(blank=True, max_length=150)),
                ('model_purpose', models.CharField(blank=True, max_length=150)),
                ('model_category_confidence_percentage', models.DecimalField(blank=True, decimal_places=2, max_digits=6, null=True)),
                ('model_purpose_confidence_percentage', models.DecimalField(blank=True, decimal_places=2, max_digits=6, null=True)),
                ('model_regularity', models.CharField(blank=True, max_length=50)),
                ('model_regularity_confidence_percentage', models.DecimalField(blank=True, decimal_places=2, max_digits=6, null=True)),
                ('model_requires_confirmation', models.BooleanField(default=True)),
                ('model_confirmation_probability_percentage', models.DecimalField(blank=True, decimal_places=2, max_digits=6, null=True)),
                ('model_top_categories', models.JSONField(blank=True, default=list)),
                ('model_category_percentages', models.JSONField(blank=True, default=dict)),
                ('model_category_purpose_pair_valid', models.BooleanField(blank=True, null=True)),
                ('model_rule', models.CharField(blank=True, max_length=80)),
                ('model_version', models.CharField(blank=True, max_length=80)),
                ('model_result', models.JSONField(blank=True, default=dict)),
                ('current_categories', models.JSONField(blank=True, default=list)),
                ('current_purpose', models.CharField(blank=True, max_length=150)),
                ('classification_source', models.CharField(blank=True, choices=[('', 'Not finalized'), ('model_confirmed', 'Model confirmed by user'), ('user_correction', 'Corrected by user')], default='', max_length=30)),
                ('first_user_decision', models.JSONField(blank=True, default=dict)),
                ('decision_history', models.JSONField(blank=True, default=list)),
                ('first_decided_at', models.DateTimeField(blank=True, null=True)),
                ('last_corrected_at', models.DateTimeField(blank=True, null=True)),
                ('revision_count', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('financial_profile', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='transactions', to='profiles.financialprofile')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='financial_transactions', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'financial transaction',
                'verbose_name_plural': 'financial transactions',
                'ordering': ['-transaction_date', '-created_at'],
                'indexes': [
                    models.Index(fields=['user', 'transaction_date'], name='transactio_user_id_70cd5e_idx'),
                    models.Index(fields=['user', 'status'], name='transactio_user_id_e896d6_idx'),
                ],
            },
        ),
    ]
