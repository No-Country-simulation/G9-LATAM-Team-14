from django.contrib import admin

from .models import FinancialProfile


@admin.register(FinancialProfile)
class FinancialProfileAdmin(admin.ModelAdmin):
    list_display = [
        'user',
        'primary_activity',
        'primary_activity_classification',
        'mvp_scope_status',
        'activity_confidence_percentage',
        'monthly_net_income',
        'saving_habit',
        'updated_at',
    ]
    list_filter = [
        'mvp_scope_status',
        'primary_activity_classification',
        'primary_income_modality',
        'saving_habit',
        'debt_calculation_status',
    ]
    search_fields = [
        'user__email',
        'user__first_name',
        'user__last_name',
        'primary_activity',
        'primary_activity_classification',
        'next_goal',
    ]
    readonly_fields = [
        'user',
        'model_paragraph',
        'auxiliary_filter_status',
        'mvp_scope_status',
        'primary_activity_classification',
        'cuoc_occupation',
        'cuoc_code',
        'activity_confidence_percentage',
        'model_probability_percentage',
        'catalog_similarity_percentage',
        'secondary_activity_classification',
        'classified_hobbies',
        'out_of_mvp_hobbies',
        'classified_goal',
        'classified_responsibility',
        'debt_calculation_status',
        'top_3_activities',
        'model_version',
        'model_result',
        'created_at',
        'updated_at',
    ]

    fieldsets = [
        ('User', {'fields': ['user']}),
        ('Declared financial context', {
            'fields': [
                'monthly_net_income',
                'saving_habit',
                'debt_ratio_percentage',
                'debt_types',
                'primary_activity',
                'primary_income_modality',
                'has_additional_income',
                'additional_activity',
                'additional_income_modality',
                'next_goal',
                'hobbies',
                'financial_responsibility',
            ],
        }),
        ('Model classification', {
            'fields': [
                'mvp_scope_status',
                'primary_activity_classification',
                'cuoc_occupation',
                'cuoc_code',
                'activity_confidence_percentage',
                'model_probability_percentage',
                'catalog_similarity_percentage',
                'secondary_activity_classification',
                'classified_hobbies',
                'out_of_mvp_hobbies',
                'classified_goal',
                'classified_responsibility',
                'debt_calculation_status',
                'top_3_activities',
            ],
        }),
        ('Traceability', {
            'fields': [
                'model_paragraph',
                'auxiliary_filter_status',
                'model_version',
                'model_result',
                'created_at',
                'updated_at',
            ],
        }),
    ]

    def has_add_permission(self, request):
        return False
