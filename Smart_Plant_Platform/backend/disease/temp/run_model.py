import onnxruntime as ort
import numpy as np
from PIL import Image
import os
import argparse
import json


def load_onnx_model(model_path):
    """
    Load an ONNX model and create an inference session.

    Args:
        model_path (str): Path to the ONNX model file

    Returns:
        tuple: (ONNX Runtime inference session, model metadata)
    """
    try:
        # Create an inference session
        session = ort.InferenceSession(model_path)

        # Try to get model metadata
        metadata = {}
        try:
            # Check for metadata in model properties
            model_props = session.get_modelmeta()
            if hasattr(model_props, "custom_metadata_map"):
                metadata = model_props.custom_metadata_map
        except:
            pass

        return session, metadata
    except Exception as e:
        print(f"Error loading model: {e}")
        return None, None


def load_labels(model_path):
    """
    Try to load class labels from various possible sources.

    Args:
        model_path (str): Path to the ONNX model file

    Returns:
        list: List of class labels if found, None otherwise
    """
    # Check for labels.json in the same directory
    labels_path = os.path.join(os.path.dirname(model_path), "labels.json")
    if os.path.exists(labels_path):
        try:
            with open(labels_path, "r") as f:
                return json.load(f)
        except:
            pass

    # Check for labels.txt in the same directory
    labels_path = os.path.join(os.path.dirname(model_path), "labels.txt")
    if os.path.exists(labels_path):
        try:
            with open(labels_path, "r") as f:
                return [line.strip() for line in f.readlines()]
        except:
            pass

    return None


def get_model_info(session):
    """
    Print information about the model's inputs and outputs.

    Args:
        session (ort.InferenceSession): ONNX Runtime inference session
    """
    print("\nModel Inputs:")
    for input in session.get_inputs():
        print(f"Name: {input.name}")
        print(f"Shape: {input.shape}")
        print(f"Type: {input.type}")
        print("---")

    print("\nModel Outputs:")
    for output in session.get_outputs():
        print(f"Name: {output.name}")
        print(f"Shape: {output.shape}")
        print(f"Type: {output.type}")
        print("---")


def preprocess_image(image_path, target_size=(224, 224)):
    """
    Preprocess an image for model input.

    Args:
        image_path (str): Path to the image file
        target_size (tuple): Target size for the image (width, height)

    Returns:
        numpy.ndarray: Preprocessed image array
    """
    try:
        # Open and resize image
        img = Image.open(image_path).convert("RGB")
        img = img.resize(target_size)

        # Convert to numpy array and normalize
        img_array = np.array(img).astype(np.float32)
        img_array = img_array.transpose(2, 0, 1)  # Change to CHW format
        img_array = img_array / 255.0  # Normalize to [0, 1]

        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)

        return img_array
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return None


def classify_image(session, image_array):
    """
    Run inference on a preprocessed image.

    Args:
        session (ort.InferenceSession): ONNX Runtime inference session
        image_array (numpy.ndarray): Preprocessed image array

    Returns:
        numpy.ndarray: Model predictions
    """
    try:
        # Get input name
        input_name = session.get_inputs()[0].name

        # Run inference
        outputs = session.run(None, {input_name: image_array})
        return outputs[0]
    except Exception as e:
        print(f"Error running inference: {e}")
        return None


def interpret_predictions(predictions, labels=None):
    """
    Interpret the model's predictions.

    Args:
        predictions (numpy.ndarray): Raw model predictions
        labels (list): Optional list of class labels

    Returns:
        dict: Class probabilities with labels if available
    """
    # Convert predictions to probabilities using softmax
    exp_preds = np.exp(predictions - np.max(predictions))
    probabilities = exp_preds / exp_preds.sum()

    # Create a dictionary of class probabilities
    if labels and len(labels) == probabilities.shape[1]:
        class_probs = {
            labels[i]: float(prob) for i, prob in enumerate(probabilities[0])
        }
    else:
        class_probs = {
            f"Class {i}": float(prob) for i, prob in enumerate(probabilities[0])
        }

    return class_probs


def main():
    parser = argparse.ArgumentParser(
        description="Run image classification using ONNX model"
    )
    parser.add_argument("image_path", help="Path to the image file to classify")
    args = parser.parse_args()

    # Check if image exists
    if not os.path.exists(args.image_path):
        print(f"Error: Image file not found at {args.image_path}")
        return

    # Load the model and metadata
    model_path = "best.onnx"
    session, metadata = load_onnx_model(model_path)
    if session is None:
        return

    # Try to load labels
    labels = load_labels(model_path)

    # Print model information
    print("\nModel Information:")
    print("-----------------")
    if metadata:
        print("Model Metadata:")
        for key, value in metadata.items():
            print(f"{key}: {value}")
    else:
        print("No metadata found in model")

    if labels:
        print("\nClass Labels:")
        for i, label in enumerate(labels):
            print(f"Class {i}: {label}")
    else:
        print("\nNo class labels found. Using generic class names.")

    # Preprocess the image
    image_array = preprocess_image(args.image_path)
    if image_array is None:
        return

    # Run classification
    predictions = classify_image(session, image_array)
    if predictions is None:
        return

    # Interpret and display results
    class_probs = interpret_predictions(predictions, labels)

    print("\nClassification Results:")
    print("----------------------")
    for class_name, prob in class_probs.items():
        print(f"{class_name}: {prob:.4f}")

    # Get the most likely class
    best_class = max(class_probs.items(), key=lambda x: x[1])
    print(f"\nMost likely class: {best_class[0]} (confidence: {best_class[1]:.4f})")


if __name__ == "__main__":
    main()
