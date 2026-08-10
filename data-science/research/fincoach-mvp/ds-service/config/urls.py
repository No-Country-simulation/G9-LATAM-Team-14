from django.urls import path, include

urlpatterns = [
    path('api/v1/movements/', include('movements.urls')),
]
