from rest_framework import serializers

class MovementInputSerializer(serializers.Serializer):
    description = serializers.CharField(required=True)
    amount = serializers.FloatField(required=True)
    direction = serializers.CharField(required=False, default='salida')
    note = serializers.CharField(required=False, allow_blank=True, default='')

class CategoryOptionSerializer(serializers.Serializer):
    category = serializers.CharField()
    percentage = serializers.FloatField()

class MovementOutputSerializer(serializers.Serializer):
    category = serializers.CharField()
    category_confidence_percentage = serializers.FloatField()
    alternative_categories = CategoryOptionSerializer(many=True)
    purpose = serializers.CharField()
    regularity = serializers.CharField()
    model_requires_review = serializers.BooleanField()
