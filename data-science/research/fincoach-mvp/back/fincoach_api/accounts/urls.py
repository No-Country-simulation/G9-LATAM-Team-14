from django.urls import path
from .views import (
    AuthenticatedUserView,
    LoginView,
    LogoutView,
    RegisterUserView,
)

app_name = 'accounts'

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', AuthenticatedUserView.as_view(), name='me'),
]
