from rest_framework import serializers
from .models import ChatMessage, Conversation


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "content", "timestamp", "is_bot", "metadata"]
        read_only_fields = ["id", "timestamp", "is_bot", "metadata"]


class ConversationSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "title",
            "created_at",
            "updated_at",
            "last_message",
            "message_count",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_last_message(self, obj):
        last_message = obj.messages.last()
        if last_message:
            return ChatMessageSerializer(last_message).data
        return None

    def get_message_count(self, obj):
        return obj.messages.count()
