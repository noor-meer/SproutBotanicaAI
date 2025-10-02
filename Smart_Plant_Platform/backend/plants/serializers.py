from rest_framework import serializers
from .models import UserPlant, PlantNote, CareRoutine, GrowthRecord


class PlantNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlantNote
        fields = ["id", "content", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class CareRoutineSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareRoutine
        fields = [
            "id",
            "task",
            "frequency",
            "instructions",
            "last_performed",
            "next_due",
        ]
        read_only_fields = ["last_performed", "next_due"]


class GrowthRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrowthRecord
        fields = [
            "id",
            "height",
            "width",
            "num_leaves",
            "notes",
            "image",
            "recorded_at",
        ]
        read_only_fields = ["recorded_at"]


class UserPlantSerializer(serializers.ModelSerializer):
    notes = PlantNoteSerializer(many=True, read_only=True)
    care_routines = CareRoutineSerializer(many=True, read_only=True)
    growth_records = GrowthRecordSerializer(many=True, read_only=True)

    class Meta:
        model = UserPlant
        fields = [
            "id",
            "name",
            "description",
            "image",
            "created_at",
            "updated_at",
            "notes",
            "care_routines",
            "growth_records",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def create(self, validated_data):
        user = self.context["request"].user
        # Remove user from validated_data if present to avoid duplicate
        validated_data.pop("user", None)
        return UserPlant.objects.create(user=user, **validated_data)
