from django.urls import path
from .views import DiseaseClassificationView

urlpatterns = [
    path(
        "classify/", DiseaseClassificationView.as_view(), name="disease-classification"
    ),
]
