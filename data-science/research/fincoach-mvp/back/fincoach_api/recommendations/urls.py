from django.urls import path

from .views import RecommendationView


app_name = 'recommendations'

urlpatterns = [
    path('', RecommendationView.as_view(), name='current'),
]
