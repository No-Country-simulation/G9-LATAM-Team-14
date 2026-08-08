from django.utils import timezone
from rest_framework import serializers

from dashboard.services import parse_month


class FinancialAnalysisInputSerializer(serializers.Serializer):
    month = serializers.CharField(required=False, allow_blank=False)

    def validate_month(self, value):
        try:
            selected_month = parse_month(value)
        except ValueError as error:
            raise serializers.ValidationError(str(error)) from error
        if selected_month > timezone.localdate().replace(day=1):
            raise serializers.ValidationError('Future months cannot be analyzed.')
        return value

    @property
    def selected_month(self):
        return parse_month(self.validated_data.get('month'))
