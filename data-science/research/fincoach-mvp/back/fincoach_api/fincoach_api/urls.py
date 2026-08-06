from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='api-schema'),
    path(
        'api/docs/',
        SpectacularSwaggerView.as_view(url_name='api-schema'),
        name='api-docs',
    ),
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/profiles/', include('profiles.urls')),
    path('api/v1/transactions/', include('transactions.urls')),
    path('api/v1/debts/', include('debts.urls')),
    path('api/v1/recommendations/', include('recommendations.urls')),
    path('api/v1/financial-analysis/', include('financial_analysis.urls')),
    path('api/v1/', include('dashboard.urls')),
]
