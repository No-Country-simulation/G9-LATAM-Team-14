from django.contrib import admin

from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = [
        'transaction_date',
        'user',
        'description',
        'amount',
        'direction',
        'status',
        'model_category',
        'current_regularity',
        'classification_source',
        'revision_count',
    ]
    list_filter = [
        'direction',
        'status',
        'movement_type',
        'model_category',
        'classification_source',
        'model_version',
    ]
    search_fields = [
        'user__email',
        'user__first_name',
        'user__last_name',
        'description',
        'note',
        'model_category',
        'current_purpose',
        'current_regularity',
    ]
    readonly_fields = [
        'user',
        'financial_profile',
        'currency',
        'status',
        'movement_type',
        'model_category',
        'model_purpose',
        'model_category_confidence_percentage',
        'model_purpose_confidence_percentage',
        'model_regularity',
        'model_regularity_confidence_percentage',
        'model_requires_confirmation',
        'model_confirmation_probability_percentage',
        'model_top_categories',
        'model_category_percentages',
        'model_category_purpose_pair_valid',
        'model_rule',
        'model_version',
        'model_result',
        'current_categories',
        'current_purpose',
        'current_regularity',
        'classification_source',
        'first_user_decision',
        'decision_history',
        'first_decided_at',
        'last_corrected_at',
        'revision_count',
        'created_at',
        'updated_at',
    ]
    fieldsets = [
        ('Declared transaction', {
            'fields': [
                'user',
                'financial_profile',
                'transaction_date',
                'description',
                'note',
                'amount',
                'currency',
                'direction',
                'status',
            ],
        }),
        ('Model suggestion', {
            'fields': [
                'movement_type',
                'model_category',
                'model_category_confidence_percentage',
                'model_top_categories',
                'model_category_percentages',
                'model_purpose',
                'model_purpose_confidence_percentage',
                'model_regularity',
                'model_regularity_confidence_percentage',
                'model_requires_confirmation',
                'model_confirmation_probability_percentage',
                'model_category_purpose_pair_valid',
                'model_rule',
                'model_version',
            ],
        }),
        ('Final classification', {
            'fields': [
                'current_categories',
                'current_purpose',
                'current_regularity',
                'classification_source',
            ],
        }),
        ('Audit', {
            'fields': [
                'first_user_decision',
                'decision_history',
                'first_decided_at',
                'last_corrected_at',
                'revision_count',
                'model_result',
                'created_at',
                'updated_at',
            ],
        }),
    ]

    def has_add_permission(self, request):
        return False
