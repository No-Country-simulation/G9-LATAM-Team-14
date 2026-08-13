from rest_framework import serializers

from .services import parse_month


class MonthQuerySerializer(serializers.Serializer):
    month = serializers.CharField(required=False, allow_blank=False)

    def validate_month(self, value):
        try:
            parse_month(value)
        except ValueError as error:
            raise serializers.ValidationError(str(error)) from error
        return value

    @property
    def selected_month(self):
        return parse_month(self.validated_data.get('month'))


class MonthlyAnalysisQuerySerializer(MonthQuerySerializer):
    page = serializers.IntegerField(required=False, min_value=1, default=1)
