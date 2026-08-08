from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Transaction(models.Model):
    DIRECTIONS = [
        ('entrada', 'Income'),
        ('salida', 'Expense'),
    ]
    STATUSES = [
        ('pending_classification', 'Pending classification'),
        ('awaiting_confirmation', 'Awaiting confirmation'),
        ('confirmed', 'Confirmed'),
    ]
    CLASSIFICATION_SOURCES = [
        ('', 'Not finalized'),
        ('model_confirmed', 'Model confirmed by user'),
        ('user_correction', 'Corrected by user'),
    ]
    REGULARITIES = [
        ('fijo', 'Fixed'),
        ('variable', 'Variable'),
        ('estacional', 'Seasonal'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='financial_transactions',
    )
    financial_profile = models.ForeignKey(
        'profiles.FinancialProfile',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='transactions',
    )
    transaction_date = models.DateField()
    description = models.CharField(max_length=250)
    note = models.CharField(max_length=300, blank=True)
    amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(0.01)],
    )
    currency = models.CharField(max_length=3, default='COP', editable=False)
    direction = models.CharField(max_length=10, choices=DIRECTIONS)
    status = models.CharField(
        max_length=30,
        choices=STATUSES,
        default='pending_classification',
    )

    movement_type = models.CharField(max_length=40, blank=True)
    model_category = models.CharField(max_length=150, blank=True)
    model_purpose = models.CharField(max_length=150, blank=True)
    model_category_confidence_percentage = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
    )
    model_purpose_confidence_percentage = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
    )
    model_regularity = models.CharField(max_length=50, blank=True)
    model_regularity_confidence_percentage = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
    )
    model_requires_confirmation = models.BooleanField(default=True)
    model_confirmation_probability_percentage = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
    )
    model_top_categories = models.JSONField(default=list, blank=True)
    model_category_percentages = models.JSONField(default=dict, blank=True)
    model_category_purpose_pair_valid = models.BooleanField(null=True, blank=True)
    model_rule = models.CharField(max_length=80, blank=True)
    model_version = models.CharField(max_length=80, blank=True)
    model_result = models.JSONField(default=dict, blank=True)

    current_categories = models.JSONField(default=list, blank=True)
    current_purpose = models.CharField(max_length=150, blank=True)
    current_regularity = models.CharField(
        max_length=20,
        choices=REGULARITIES,
        blank=True,
        default='',
    )
    classification_source = models.CharField(
        max_length=30,
        choices=CLASSIFICATION_SOURCES,
        blank=True,
        default='',
    )
    first_user_decision = models.JSONField(default=dict, blank=True)
    decision_history = models.JSONField(default=list, blank=True)
    first_decided_at = models.DateTimeField(null=True, blank=True)
    last_corrected_at = models.DateTimeField(null=True, blank=True)
    revision_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-transaction_date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'transaction_date']),
            models.Index(fields=['user', 'status']),
        ]
        verbose_name = 'financial transaction'
        verbose_name_plural = 'financial transactions'

    def __str__(self):
        return '{} - {} - {}'.format(
            self.transaction_date,
            self.description,
            self.amount,
        )
