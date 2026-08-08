from django.contrib import admin

from .models import Debt, DebtPayment


@admin.register(Debt)
class DebtAdmin(admin.ModelAdmin):
    list_display = [
        'user',
        'debt_type',
        'original_amount',
        'monthly_payment',
        'annual_effective_rate',
        'term_months',
        'start_date',
    ]
    list_filter = ['debt_type', 'start_date']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = [
        'user',
        'annual_effective_rate',
        'monthly_payment',
        'created_at',
        'updated_at',
    ]

    def has_add_permission(self, request):
        return False


@admin.register(DebtPayment)
class DebtPaymentAdmin(admin.ModelAdmin):
    list_display = [
        'debt',
        'transaction',
        'allocated_amount',
        'created_at',
    ]
    search_fields = [
        'debt__user__email',
        'transaction__description',
    ]
    readonly_fields = [
        'debt',
        'transaction',
        'allocated_amount',
        'created_at',
        'updated_at',
    ]

    def has_add_permission(self, request):
        return False
