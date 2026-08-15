from django.urls import path
from modules.transaction.infrastructure.views import TransactionClassificationController

urlpatterns = [
    path('', TransactionClassificationController.as_view(), name='transaction-register-and-classify'),
    path('classify/', TransactionClassificationController.as_view(), name='transaction-classify'),
    path('<int:transaction_id>/classify/', TransactionClassificationController.as_view(), name='transaction-id-classify'),
]
