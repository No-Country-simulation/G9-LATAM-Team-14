from decimal import Decimal

from rest_framework import serializers

from .models import Transaction


class TransactionInputSerializer(serializers.Serializer):
    transaction_date = serializers.DateField()
    description = serializers.CharField(max_length=250)
    note = serializers.CharField(
        max_length=300,
        allow_blank=True,
        required=False,
        default='',
    )
    amount = serializers.DecimalField(
        max_digits=14,
        decimal_places=2,
        min_value=Decimal('0.01'),
    )
    direction = serializers.ChoiceField(
        choices=[choice[0] for choice in Transaction.DIRECTIONS],
    )

    def validate_description(self, value):
        return value.strip()

    def validate_note(self, value):
        return value.strip()


class CorrectedCategorySerializer(serializers.Serializer):
    category = serializers.CharField(max_length=150)
    percentage = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=Decimal('0.01'),
        max_value=Decimal('100.00'),
    )

    def validate_category(self, value):
        return value.strip()


class TransactionConfirmationSerializer(serializers.Serializer):
    selected_categories = CorrectedCategorySerializer(
        many=True,
        required=True,
        allow_empty=False,
    )
    selected_purpose = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=False,
    )
    selected_regularity = serializers.ChoiceField(
        choices=[choice[0] for choice in Transaction.REGULARITIES],
        required=True,
    )
    selected_debt_id = serializers.IntegerField(
        min_value=1,
        required=False,
    )

    def validate(self, attributes):
        categories = attributes['selected_categories']
        category_names = [item['category'] for item in categories]
        if len(category_names) != len(set(category_names)):
            raise serializers.ValidationError({
                'selected_categories': 'Duplicate categories are not allowed.',
            })

        total = sum(
            (item['percentage'] for item in categories),
            start=Decimal('0.00'),
        )
        if total != Decimal('100.00'):
            raise serializers.ValidationError({
                'selected_categories': 'Category percentages must add up to exactly 100.',
            })
        return attributes


class TransactionSerializer(serializers.Serializer):
    def to_representation(self, transaction):
        suggestion = None
        if transaction.model_category:
            suggestion = {
                'category': transaction.model_category,
                'category_confidence_percentage': float(
                    transaction.model_category_confidence_percentage
                ),
                'top_categories': transaction.model_top_categories,
                'purpose': transaction.model_purpose,
                'purpose_confidence_percentage': float(
                    transaction.model_purpose_confidence_percentage
                ),
                'regularity': transaction.model_regularity,
                'regularity_confidence_percentage': float(
                    transaction.model_regularity_confidence_percentage
                ),
                'regularity_requires_review': bool(
                    (transaction.model_result or {}).get(
                        'regularity_requires_confirmation',
                        False,
                    )
                ),
                'regularity_history_available': bool(
                    (transaction.model_result or {}).get(
                        'regularity_history_available',
                        False,
                    )
                ),
                'model_requires_review': transaction.model_requires_confirmation,
                'confirmation_probability_percentage': float(
                    transaction.model_confirmation_probability_percentage
                ),
                'rule': transaction.model_rule,
                'model_version': transaction.model_version,
            }

        final_classification = None
        if transaction.status == 'confirmed':
            debt_payment = getattr(transaction, 'debt_payment', None)
            final_classification = {
                'categories': transaction.current_categories,
                'purpose': transaction.current_purpose,
                'regularity': (
                    transaction.current_regularity
                    or transaction.model_regularity
                ),
                'source': transaction.classification_source,
                'debt_id': debt_payment.debt_id if debt_payment else None,
            }

        return {
            'id': transaction.id,
            'transaction_date': transaction.transaction_date,
            'description': transaction.description,
            'note': transaction.note,
            'amount': float(transaction.amount),
            'currency': transaction.currency,
            'direction': transaction.direction,
            'status': transaction.status,
            'movement_type': transaction.movement_type or None,
            'model_suggestion': suggestion,
            'final_classification': final_classification,
            'audit': {
                'first_user_decision': transaction.first_user_decision or None,
                'revision_count': transaction.revision_count,
                'first_decided_at': transaction.first_decided_at,
                'last_corrected_at': transaction.last_corrected_at,
            },
            'created_at': transaction.created_at,
            'updated_at': transaction.updated_at,
        }
