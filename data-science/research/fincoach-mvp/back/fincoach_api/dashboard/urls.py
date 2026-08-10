from django.urls import path

from .views import DashboardView, MonthlyAnalysisExportView, MonthlyAnalysisView


app_name = 'dashboard'

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='overview'),
    path('monthly-analysis/', MonthlyAnalysisView.as_view(), name='monthly-analysis'),
    path(
        'monthly-analysis/export/',
        MonthlyAnalysisExportView.as_view(),
        name='monthly-analysis-export',
    ),
]
