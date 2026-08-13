from django.urls import include, path

urlpatterns = [
    path('api/v1/profiles/', include('modules.profile.infrastructure.urls')),
    path('api/v1/transactions/', include('modules.transaction.infrastructure.urls')),
    path('api/v1/recommendations/', include('modules.recommendation.infrastructure.urls')),
]
