from django.urls import path
from movements.presentation.views import MovementClassifyView

urlpatterns = [
    path('classify/', MovementClassifyView.as_view(), name='classify-movement'),
]
