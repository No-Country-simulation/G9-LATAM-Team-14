from django.urls import path

from .views import (
    TransactionClassifyView,
    TransactionConfirmView,
    TransactionListCreateView,
)


app_name = 'transactions'

urlpatterns = [
    path('', TransactionListCreateView.as_view(), name='list-create'),
    path(
        '<int:transaction_id>/classify/',
        TransactionClassifyView.as_view(),
        name='classify',
    ),
    path(
        '<int:transaction_id>/confirm/',
        TransactionConfirmView.as_view(),
        name='confirm',
    ),
]
