from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatViewSet, ConversationViewSet

router = DefaultRouter()
router.register(r"conversations", ConversationViewSet, basename="conversation")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "conversations/<int:conversation_id>/messages/",
        ChatViewSet.as_view({"get": "list", "post": "create"}),
        name="conversation-messages",
    ),
]
