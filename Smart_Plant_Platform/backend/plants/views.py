from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import UserPlant, PlantNote, CareRoutine, GrowthRecord
from .serializers import (
    UserPlantSerializer,
    PlantNoteSerializer,
    CareRoutineSerializer,
    GrowthRecordSerializer,
)

# Create your views here.


class UserPlantViewSet(viewsets.ModelViewSet):
    serializer_class = UserPlantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserPlant.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        # Handle image update
        if "image" in request.FILES:
            # Delete old image if it exists
            if instance.image:
                instance.image.delete(save=False)
        elif "image" in request.data and not request.data["image"]:
            # If image field is empty in request, keep the existing image
            request.data.pop("image")

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def add_note(self, request, pk=None):
        plant = self.get_object()
        serializer = PlantNoteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(plant=plant)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["delete"], url_path="notes/(?P<note_id>[^/.]+)")
    def delete_note(self, request, pk=None, note_id=None):
        plant = self.get_object()
        note = get_object_or_404(PlantNote, id=note_id, plant=plant)
        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def add_care_routine(self, request, pk=None):
        plant = self.get_object()
        serializer = CareRoutineSerializer(data=request.data)
        if serializer.is_valid():
            routine = serializer.save(plant=plant)

            # Set next_due based on frequency
            frequency_days = {
                "daily": 1,
                "weekly": 7,
                "biweekly": 14,
                "monthly": 30,
            }
            days = frequency_days.get(routine.frequency)
            if days:
                routine.next_due = timezone.now() + timedelta(days=days)
                routine.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=True, methods=["delete"], url_path="care_routines/(?P<routine_id>[^/.]+)"
    )
    def delete_care_routine(self, request, pk=None, routine_id=None):
        plant = self.get_object()
        routine = get_object_or_404(CareRoutine, id=routine_id, plant=plant)
        routine.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def record_growth(self, request, pk=None):
        plant = self.get_object()
        serializer = GrowthRecordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(plant=plant)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=True, methods=["delete"], url_path="growth_records/(?P<record_id>[^/.]+)"
    )
    def delete_growth_record(self, request, pk=None, record_id=None):
        plant = self.get_object()
        record = get_object_or_404(GrowthRecord, id=record_id, plant=plant)
        record.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def complete_care_task(self, request, pk=None):
        plant = self.get_object()
        try:
            routine = plant.care_routines.get(id=request.data.get("routine_id"))
            routine.last_performed = timezone.now()

            # Update next_due date
            frequency_days = {
                "daily": 1,
                "weekly": 7,
                "biweekly": 14,
                "monthly": 30,
            }
            days = frequency_days.get(routine.frequency)
            if days:
                routine.next_due = timezone.now() + timedelta(days=days)

            routine.save()
            return Response(CareRoutineSerializer(routine).data)
        except CareRoutine.DoesNotExist:
            return Response(
                {"error": "Care routine not found"}, status=status.HTTP_404_NOT_FOUND
            )
