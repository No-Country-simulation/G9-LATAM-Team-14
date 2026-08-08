from django.urls import path

from .views import DebtListCreateView


app_name = 'debts'

urlpatterns = [
    path('', DebtListCreateView.as_view(), name='list-create'),
]
