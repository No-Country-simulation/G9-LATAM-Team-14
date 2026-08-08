from decimal import Decimal

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('transactions', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Debt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('debt_type', models.CharField(choices=[('housing', 'Housing loan'), ('educational', 'Educational loan'), ('credit_card', 'Credit card'), ('vehicle', 'Vehicle loan'), ('personal', 'Personal loan')], max_length=30)),
                ('original_amount', models.DecimalField(decimal_places=2, max_digits=14, validators=[django.core.validators.MinValueValidator(Decimal('1.00'))])),
                ('term_months', models.PositiveIntegerField(validators=[django.core.validators.MinValueValidator(1)])),
                ('start_date', models.DateField()),
                ('annual_effective_rate', models.DecimalField(decimal_places=2, max_digits=6)),
                ('monthly_payment', models.DecimalField(decimal_places=2, max_digits=14)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='debts', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'debt',
                'verbose_name_plural': 'debts',
                'ordering': ['start_date', 'id'],
                'indexes': [models.Index(fields=['user', 'start_date'], name='debts_debt_user_id_eb235d_idx')],
            },
        ),
        migrations.CreateModel(
            name='DebtPayment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('allocated_amount', models.DecimalField(decimal_places=2, max_digits=14, validators=[django.core.validators.MinValueValidator(Decimal('0.01'))])),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('debt', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payments', to='debts.debt')),
                ('transaction', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='debt_payment', to='transactions.transaction')),
            ],
            options={
                'verbose_name': 'debt payment',
                'verbose_name_plural': 'debt payments',
                'ordering': ['transaction__transaction_date', 'id'],
            },
        ),
    ]
