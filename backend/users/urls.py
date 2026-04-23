from django.urls import path
from .views import RegisterView, LoginView, MeView, PublicProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('profile/<str:username>/', PublicProfileView.as_view(), name='public-profile'),
]
