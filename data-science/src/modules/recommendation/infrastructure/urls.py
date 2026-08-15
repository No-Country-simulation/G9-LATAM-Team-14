from django.urls import path
from modules.recommendation.infrastructure.views import RecommendationController

urlpatterns = [
    path('', RecommendationController.as_view(), name='recommendation-get-or-post'),
    path('status/', RecommendationController.as_view(), name='recommendation-status'),
]
