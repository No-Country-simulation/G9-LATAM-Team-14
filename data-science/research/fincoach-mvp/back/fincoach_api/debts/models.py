from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Debt(models.Model):
    DEBT_TYPES = [
        ('housing', 'Housing loan'),
        ('educational', 'Educational loan'),
        ('credit_card', 'Credit card'),
        ('vehicle', 'Vehicle loan'),
        ('personal', 'Personal loan'),
    ]
    ANNUAL_EFFECTIVE_RATES = {
        'housing': Decimal('10.00'),
        'educational': Decimal('12.00'),
        'credit_card': Decimal('24.00'),
        'vehicle': Decimal('16.00'),
        'personal': Decimal('18.00'),
    }

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='debts',
    )
    debt_type = models.CharField(max_length=30, choices=DEBT_TYPES)
    original_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('1.00'))],
    )
    term_months = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
    )
    start_date = models.DateField()
    annual_effective_rate = models.DecimalField(max_digits=6, decimal_places=2)
    monthly_payment = models.DecimalField(max_digits=14, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_date', 'id']
        indexes = [models.Index(fields=['user', 'start_date'])]
        verbose_name = 'debt'
        verbose_name_plural = 'debts'

    def __str__(self):
        return '{} - {}'.format(self.user.email, self.get_debt_type_display())


class DebtPayment(models.Model):
    debt = models.ForeignKey(
        Debt,
        on_delete=models.CASCADE,
        related_name='payments',
    )
    transaction = models.OneToOneField(
        'transactions.Transaction',
        on_delete=models.CASCADE,
        related_name='debt_payment',
    )
    allocated_amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['transaction__transaction_date', 'id']
        verbose_name = 'debt payment'
        verbose_name_plural = 'debt payments'

    def __str__(self):
        return '{} - {}'.format(self.debt, self.allocated_amount)
