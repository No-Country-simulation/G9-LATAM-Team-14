from django.db import migrations, models


def copy_confirmed_regularity(apps, schema_editor):
    transaction_model = apps.get_model('transactions', 'Transaction')
    transaction_model.objects.filter(
        status='confirmed',
        current_regularity='',
        model_regularity__in=['fijo', 'variable'],
    ).update(
        current_regularity=models.F('model_regularity'),
    )


class Migration(migrations.Migration):

    dependencies = [
        ('transactions', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='transaction',
            name='current_regularity',
            field=models.CharField(
                blank=True,
                choices=[('fijo', 'Fixed'), ('variable', 'Variable')],
                default='',
                max_length=20,
            ),
        ),
        migrations.RunPython(
            copy_confirmed_regularity,
            migrations.RunPython.noop,
        ),
    ]
