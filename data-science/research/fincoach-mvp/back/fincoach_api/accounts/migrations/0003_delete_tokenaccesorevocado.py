from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_tokenaccesorevocado'),
    ]

    operations = [
        migrations.DeleteModel(
            name='TokenAccesoRevocado',
        ),
    ]
