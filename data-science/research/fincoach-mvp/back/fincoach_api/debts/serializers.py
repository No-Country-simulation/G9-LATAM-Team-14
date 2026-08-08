from decimal import Decimal

from rest_framework import serializers

from .models import Debt


class DebtInputSerializer(serializers.Serializer):
    debt_type = serializers.ChoiceField(
        choices=[choice[0] for choice in Debt.DEBT_TYPES],
    )
    original_amount = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal('1.00'),
    )
    term_months = serializers.IntegerField(min_value=1, max_value=600)
    start_date = serializers.DateField()
