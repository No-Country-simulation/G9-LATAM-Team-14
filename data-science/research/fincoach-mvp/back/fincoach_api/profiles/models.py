from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class FinancialProfile(models.Model):
    SAVING_HABITS = [
        ('nunca', 'Nunca'),
        ('baja', 'Baja'),
        ('media', 'Media'),
        ('alta', 'Alta'),
    ]
    INCOME_MODALITIES = [
        ('fijo', 'Fijo'),
        ('variable', 'Variable'),
        ('mixto', 'Mixto'),
        ('estacional', 'Estacional'),
        ('apoyo', 'Apoyo'),
        ('sin_ingresos', 'Sin ingresos'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='financial_profile',
    )
    monthly_net_income = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    saving_habit = models.CharField(max_length=10, choices=SAVING_HABITS)
    debt_ratio_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    debt_types = models.JSONField(default=list, blank=True)
    primary_activity = models.CharField(max_length=250)
    primary_income_modality = models.CharField(max_length=20, choices=INCOME_MODALITIES)
    has_additional_income = models.BooleanField(default=False)
    additional_activity = models.CharField(max_length=250, blank=True)
    additional_income_modality = models.CharField(
        max_length=20,
        choices=INCOME_MODALITIES,
        blank=True,
    )
    next_goal = models.CharField(max_length=300, blank=True)
    hobbies = models.JSONField(default=list, blank=True)
    financial_responsibility = models.CharField(max_length=300, blank=True)
    model_paragraph = models.TextField()
    auxiliary_filter_status = models.CharField(max_length=50)
    mvp_scope_status = models.CharField(max_length=50)
    primary_activity_classification = models.CharField(max_length=150)
    cuoc_occupation = models.CharField(max_length=300)
    cuoc_code = models.CharField(max_length=50)
    activity_confidence_percentage = models.DecimalField(max_digits=6, decimal_places=2)
    model_probability_percentage = models.DecimalField(max_digits=6, decimal_places=2)
    catalog_similarity_percentage = models.DecimalField(max_digits=6, decimal_places=2)
    secondary_activity_classification = models.CharField(max_length=150)
    classified_hobbies = models.JSONField(default=list, blank=True)
    out_of_mvp_hobbies = models.JSONField(default=list, blank=True)
    classified_goal = models.CharField(max_length=300)
    classified_responsibility = models.CharField(max_length=300)
    debt_calculation_status = models.CharField(max_length=50)
    top_3_activities = models.JSONField(default=list)
    model_version = models.CharField(max_length=50)
    model_result = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'financial profile'
        verbose_name_plural = 'financial profiles'

    def __str__(self):
        return '{} - {}'.format(self.user.email, self.primary_activity_classification)
