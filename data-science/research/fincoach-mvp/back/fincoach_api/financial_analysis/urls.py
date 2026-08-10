from django.urls import path

from .views import FinancialAnalysisView


app_name = 'financial_analysis'

urlpatterns = [
    path('', FinancialAnalysisView.as_view(), name='create'),
]
