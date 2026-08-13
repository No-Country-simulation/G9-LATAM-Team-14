from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transactions', '0002_transaction_current_regularity'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='current_regularity',
            field=models.CharField(
                blank=True,
                choices=[
                    ('fijo', 'Fixed'),
                    ('variable', 'Variable'),
                    ('estacional', 'Seasonal'),
                ],
                default='',
                max_length=20,
            ),
        ),
    ]
