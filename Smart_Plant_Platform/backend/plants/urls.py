from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserPlantViewSet

router = DefaultRouter()
router.register(r"", UserPlantViewSet, basename="userplant")

urlpatterns = [
    path("", include(router.urls)),
]
