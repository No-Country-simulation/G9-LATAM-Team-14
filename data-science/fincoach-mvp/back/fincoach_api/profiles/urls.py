from django.urls import path

from .views import FinancialProfileCreateView, MyFinancialProfileView


app_name = 'profiles'

urlpatterns = [
    path('', FinancialProfileCreateView.as_view(), name='create'),
    path('me/', MyFinancialProfileView.as_view(), name='me'),
]
