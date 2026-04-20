from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ZineViewSet, RegisterView

router = DefaultRouter()
router.register(r'zines', ZineViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
]
