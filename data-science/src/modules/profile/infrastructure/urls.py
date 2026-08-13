from django.urls import path
from modules.profile.infrastructure.views import ProfileClassificationController

urlpatterns = [
    path('', ProfileClassificationController.as_view(), name='profile-classify'),
    path('classify/', ProfileClassificationController.as_view(), name='profile-classify-alias'),
]
