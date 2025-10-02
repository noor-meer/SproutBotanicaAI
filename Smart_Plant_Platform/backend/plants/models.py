from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class UserPlant(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="plants")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="plants/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s {self.name}"


class PlantNote(models.Model):
    plant = models.ForeignKey(UserPlant, on_delete=models.CASCADE, related_name="notes")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Note for {self.plant.name}"


class CareRoutine(models.Model):
    FREQUENCY_CHOICES = [
        ("daily", "Daily"),
        ("weekly", "Weekly"),
        ("biweekly", "Bi-weekly"),
        ("monthly", "Monthly"),
    ]

    plant = models.ForeignKey(
        UserPlant, on_delete=models.CASCADE, related_name="care_routines"
    )
    task = models.CharField(max_length=100)  # e.g., "Watering", "Fertilizing"
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    instructions = models.TextField()
    last_performed = models.DateTimeField(null=True, blank=True)
    next_due = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.task} for {self.plant.name}"


class GrowthRecord(models.Model):
    plant = models.ForeignKey(
        UserPlant, on_delete=models.CASCADE, related_name="growth_records"
    )
    height = models.FloatField(null=True, blank=True)  # in centimeters
    width = models.FloatField(null=True, blank=True)  # in centimeters
    num_leaves = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    image = models.ImageField(upload_to="growth_records/", null=True, blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-recorded_at"]

    def __str__(self):
        return f"Growth record for {self.plant.name} on {self.recorded_at.date()}"
