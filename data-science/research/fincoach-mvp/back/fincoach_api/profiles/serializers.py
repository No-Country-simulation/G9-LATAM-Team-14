from rest_framework import serializers

from .models import FinancialProfile


class FinancialProfileInputSerializer(serializers.Serializer):
    monthly_net_income = serializers.DecimalField(max_digits=14, decimal_places=2, min_value=0)
    saving_habit = serializers.ChoiceField(
        choices=[choice[0] for choice in FinancialProfile.SAVING_HABITS],
    )
    debt_ratio_percentage = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=0,
        max_value=100,
        allow_null=True,
    )
    debt_types = serializers.ListField(
        child=serializers.CharField(max_length=120),
        allow_empty=True,
        required=False,
        default=list,
    )
    primary_activity = serializers.CharField(max_length=250)
    primary_income_modality = serializers.ChoiceField(
        choices=[choice[0] for choice in FinancialProfile.INCOME_MODALITIES],
    )
    has_additional_income = serializers.BooleanField(required=False, default=False)
    additional_activity = serializers.CharField(
        max_length=250,
        allow_blank=True,
        required=False,
        default='',
    )
    additional_income_modality = serializers.ChoiceField(
        choices=[choice[0] for choice in FinancialProfile.INCOME_MODALITIES],
        allow_blank=True,
        required=False,
        default='',
    )
    next_goal = serializers.CharField(max_length=300)
    hobbies = serializers.ListField(
        child=serializers.CharField(max_length=120),
        allow_empty=True,
        required=False,
        default=list,
    )
    financial_responsibility = serializers.CharField(
        max_length=300,
        allow_blank=True,
        required=False,
        default='',
    )

    def current_value(self, attributes, field_name):
        if field_name in attributes:
            return attributes[field_name]
        if self.instance is not None:
            return getattr(self.instance, field_name)
        return None

    def validate_debt_types(self, value):
        return list(dict.fromkeys(item.strip() for item in value if item.strip()))

    def validate_hobbies(self, value):
        return list(dict.fromkeys(item.strip() for item in value if item.strip()))

    def validate(self, attributes):
        income = self.current_value(attributes, 'monthly_net_income')
        modality = self.current_value(attributes, 'primary_income_modality')
        debt_ratio = self.current_value(attributes, 'debt_ratio_percentage')
        debt_types = self.current_value(attributes, 'debt_types') or []
        has_additional = self.current_value(attributes, 'has_additional_income')
        additional_activity = self.current_value(attributes, 'additional_activity') or ''
        additional_modality = self.current_value(
            attributes,
            'additional_income_modality',
        ) or ''

        if income == 0:
            attributes['primary_income_modality'] = 'sin_ingresos'
            if has_additional:
                raise serializers.ValidationError({
                    'has_additional_income': (
                        'Additional income cannot be declared when monthly net income is zero.'
                    ),
                })
        elif modality == 'sin_ingresos':
            raise serializers.ValidationError({
                'primary_income_modality': (
                    'This modality is only valid when monthly net income is zero.'
                ),
            })

        if income and debt_ratio is None:
            raise serializers.ValidationError({
                'debt_ratio_percentage': 'This field is required when income is greater than zero.',
            })
        if debt_ratio and not debt_types:
            raise serializers.ValidationError({
                'debt_types': 'Declare at least one debt type when the debt percentage is greater than zero.',
            })

        if has_additional:
            if not additional_activity.strip():
                raise serializers.ValidationError({
                    'additional_activity': 'Describe the additional income activity.',
                })
            if not additional_modality or additional_modality == 'sin_ingresos':
                raise serializers.ValidationError({
                    'additional_income_modality': 'Declare a valid additional income modality.',
                })
        else:
            attributes['additional_activity'] = ''
            attributes['additional_income_modality'] = ''
        return attributes


class FinancialProfileSerializer(serializers.Serializer):
    def to_representation(self, profile):
        additional_income = None
        if profile.has_additional_income:
            additional_income = {
                'activity': profile.additional_activity,
                'modality': profile.additional_income_modality,
            }

        result = profile.model_result
        return {
            'id': profile.id,
            'declared_data': {
                'monthly_net_income': float(profile.monthly_net_income),
                'saving_habit': profile.saving_habit,
                'debt_ratio_percentage': (
                    float(profile.debt_ratio_percentage)
                    if profile.debt_ratio_percentage is not None
                    else None
                ),
                'debt_types': profile.debt_types,
                'primary_activity': profile.primary_activity,
                'primary_income_modality': profile.primary_income_modality,
                'additional_income': additional_income,
                'next_goal': profile.next_goal,
                'hobbies': profile.hobbies,
                'financial_responsibility': profile.financial_responsibility,
            },
            'classification': {
                'mvp_scope': profile.mvp_scope_status,
                'primary_activity': profile.primary_activity_classification,
                'secondary_activity': profile.secondary_activity_classification,
                'cuoc_occupation': profile.cuoc_occupation,
                'cuoc_code': profile.cuoc_code,
                'confidence_percentage': float(
                    profile.activity_confidence_percentage,
                ),
                'alternative_activities': profile.top_3_activities[1:],
                'hobbies': profile.classified_hobbies,
                'out_of_mvp_hobbies': profile.out_of_mvp_hobbies,
                'debt_status': profile.debt_calculation_status,
                'saving_status': profile.auxiliary_filter_status,
                'reason': result.get('motivo'),
                'ethical_principle': result.get('principio_etico'),
                'model_version': profile.model_version,
            },
            'created_at': profile.created_at,
            'updated_at': profile.updated_at,
        }
