from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
import os
from django.conf import settings
from .temp.run_model import (
    load_onnx_model,
    preprocess_image,
    classify_image,
    interpret_predictions,
    load_labels,
)

# Create your views here.


class DiseaseClassificationView(APIView):
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        if "image" not in request.FILES:
            return Response(
                {"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Get the uploaded image
            image_file = request.FILES["image"]

            # Save the image temporarily
            temp_image_path = os.path.join(settings.MEDIA_ROOT, "temp", image_file.name)
            os.makedirs(os.path.dirname(temp_image_path), exist_ok=True)

            with open(temp_image_path, "wb+") as destination:
                for chunk in image_file.chunks():
                    destination.write(chunk)

            # Load model and labels
            model_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "disease",
                "temp",
                "best.onnx",
            )
            session, _ = load_onnx_model(model_path)
            labels = load_labels(model_path)

            if session is None:
                return Response(
                    {"error": "Failed to load model"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            # Preprocess and classify image
            image_array = preprocess_image(temp_image_path)
            if image_array is None:
                return Response(
                    {"error": "Failed to process image"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            predictions = classify_image(session, image_array)
            if predictions is None:
                return Response(
                    {"error": "Failed to classify image"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            # Get results
            class_probs = interpret_predictions(predictions, labels)

            # Clean up temporary file
            os.remove(temp_image_path)

            return Response(
                {
                    "predictions": class_probs,
                    "most_likely": max(class_probs.items(), key=lambda x: x[1]),
                }
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
