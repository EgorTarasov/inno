import cv2
import numpy as np
import time
import psycopg2
import os
import argparse
from datetime import datetime
import logging
import tensorflow as tf
import tensorflow_hub as hub
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import img_to_array
import requests
from urllib.parse import urlparse
import io
from minio import Minio
from minio.error import S3Error
import json

# Setup logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize the argument parser
parser = argparse.ArgumentParser(
    description="Video stream processing for city monitoring"
)
parser.add_argument(
    "--interval",
    type=int,
    default=10,
    help="Minimum interval between alerts in seconds",
)
args = parser.parse_args()

# Database configuration
DATABASE_URL = os.environ.get("DATABASE_URL", "localhost")

# MinIO configuration
MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.environ.get("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.environ.get("MINIO_SECRET_KEY", "minioadmin")
MINIO_SECURE = os.environ.get("MINIO_SECURE", "false").lower() == "true"
MINIO_BUCKET = os.environ.get("MINIO_BUCKET", "city-monitoring")
MINIO_PUBLIC_URL = os.environ.get("MINIO_PUBLIC_URL", f"http://{MINIO_ENDPOINT}")


# Initialize MinIO client
def get_minio_client():
    try:
        client = Minio(
            MINIO_ENDPOINT,
            access_key=MINIO_ACCESS_KEY,
            secret_key=MINIO_SECRET_KEY,
            secure=MINIO_SECURE,
        )
        # Make bucket if not exist
        if not client.bucket_exists(MINIO_BUCKET):
            client.make_bucket(MINIO_BUCKET)
        return client
    except S3Error as e:
        logger.error(f"MinIO client error: {e}")
        raise


# Connect to the database
def get_db_connection():
    try:
        conn = psycopg2.connect(dsn=DATABASE_URL)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise


# Get the first active camera from database
def get_first_active_camera():
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT id, name, stream_url, location, latitude, longitude FROM camera_streams WHERE active = true ORDER BY id LIMIT 1"
        )
        camera = cursor.fetchone()

        if not camera:
            raise ValueError("No active cameras found in database")

        return {
            "id": camera[0],
            "name": camera[1],
            "stream_url": camera[2],
            "location": camera[3],
            "latitude": camera[4],
            "longitude": camera[5],
        }
    finally:
        cursor.close()
        conn.close()


# Get camera details from database
def get_camera_details(camera_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT name, location, latitude, longitude FROM camera_streams WHERE id = %s",
            (camera_id,),
        )
        camera = cursor.fetchone()

        if not camera:
            raise ValueError(f"Camera with ID {camera_id} not found in database")

        return {
            "name": camera[0],
            "location": camera[1],
            "latitude": camera[2],
            "longitude": camera[3],
        }
    finally:
        cursor.close()
        conn.close()


# Insert alert into database
def create_alert(
    title,
    description,
    location,
    status,
    priority,
    law_reference,
    source,
    image_url,
    camera_id,
):
    conn = get_db_connection()
    cursor = conn.cursor()
    logger.info("Saving alert in database")
    try:
        cursor.execute(
            """
            INSERT INTO alerts (title, description, location, status, priority, law_reference, source, image_url, camera_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
            """,
            (
                title,
                description,
                location,
                status,
                priority,
                law_reference,
                source,
                image_url,
                camera_id,
            ),
        )
        alert_id = cursor.fetchone()[0]
        conn.commit()
        return alert_id
    except Exception as e:
        conn.rollback()
        logger.error(f"Error creating alert: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


# Save frame to MinIO
def save_frame(frame, camera_id):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    object_name = f"violations/camera_{camera_id}_{timestamp}.jpg"

    try:
        # Get MinIO client
        client = get_minio_client()

        # Convert frame to JPEG buffer
        _, buffer = cv2.imencode(".jpg", frame)
        file_data = io.BytesIO(buffer)
        file_size = len(buffer)

        # Upload to MinIO
        client.put_object(
            MINIO_BUCKET, object_name, file_data, file_size, content_type="image/jpeg"
        )

        # Generate URL for the uploaded image
        url = f"{MINIO_PUBLIC_URL}/{MINIO_BUCKET}/{object_name}"
        logger.info(f"Image uploaded to MinIO: {url}")
        return url

    except S3Error as e:
        logger.error(f"Error saving image to MinIO: {e}")
        # Fallback to local file system if MinIO upload fails
        return save_frame_local(frame, camera_id)


# Save frame locally as fallback
def save_frame_local(frame, camera_id):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"camera_{camera_id}_{timestamp}.jpg"

    # Create directory if it doesn't exist
    os.makedirs("public/violations", exist_ok=True)

    filepath = os.path.join("public/violations", filename)
    cv2.imwrite(filepath, frame)

    logger.warning(f"Falling back to local storage: {filepath}")
    return f"/violations/{filename}"


# Load model for object detection
def load_model():
    # Load COCO-SSD model from TensorFlow Hub
    model = hub.load("https://tfhub.dev/tensorflow/ssd_mobilenet_v2/2")
    logger.info("COCO-SSD model loaded successfully")
    return model


# Detect objects in frame
def detect_objects(frame, model):
    # Convert to RGB (OpenCV uses BGR)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Ensure the frame has the correct data type (uint8)
    if rgb_frame.dtype != np.uint8:
        rgb_frame = rgb_frame.astype(np.uint8)

    # TF Hub models expect batched images
    input_tensor = tf.convert_to_tensor(rgb_frame, dtype=tf.uint8)
    input_tensor = tf.expand_dims(input_tensor, 0)  # Add batch dimension

    # Run inference
    result = model(input_tensor)

    # Process results
    boxes = result["detection_boxes"][0].numpy()
    classes = result["detection_classes"][0].numpy().astype(int)
    scores = result["detection_scores"][0].numpy()

    coco_classes = {
        1: "person",
        2: "bicycle",
        3: "car",
        4: "motorcycle",
        5: "airplane",
        6: "bus",
        7: "train",
        8: "truck",
        9: "boat",
        10: "traffic light",
        11: "fire hydrant",
        13: "stop sign",
        14: "parking meter",
        15: "bench",
        16: "bird",
        17: "cat",
        18: "dog",
        19: "horse",
        20: "sheep",
        21: "cow",
        22: "elephant",
        23: "bear",
        24: "zebra",
        25: "giraffe",
        27: "backpack",
        28: "umbrella",
        31: "handbag",
        32: "tie",
        33: "suitcase",
        34: "frisbee",
        35: "skis",
        36: "snowboard",
        37: "sports ball",
        38: "kite",
        39: "baseball bat",
        40: "baseball glove",
        41: "skateboard",
        42: "surfboard",
        43: "tennis racket",
        44: "bottle",
        46: "wine glass",
        47: "cup",
        48: "fork",
        49: "knife",
        50: "spoon",
        51: "bowl",
        52: "banana",
        53: "apple",
        54: "sandwich",
        55: "orange",
        56: "broccoli",
        57: "carrot",
        58: "hot dog",
        59: "pizza",
        60: "donut",
        61: "cake",
        62: "chair",
        63: "couch",
        64: "potted plant",
        65: "bed",
        67: "dining table",
        70: "toilet",
        72: "tv",
        73: "laptop",
        74: "mouse",
        75: "remote",
        76: "keyboard",
        77: "cell phone",
        78: "microwave",
        79: "oven",
        80: "toaster",
        81: "sink",
        82: "refrigerator",
        84: "book",
        85: "clock",
        86: "vase",
        87: "scissors",
        88: "teddy bear",
        89: "hair drier",
        90: "toothbrush",
    }

    detections = []
    for i in range(len(scores)):
        if scores[i] > 0.3:
            class_id = classes[i]
            if class_id in coco_classes:
                detections.append(
                    {
                        "class": coco_classes[class_id],
                        "confidence": float(scores[i]),
                        "box": boxes[i].tolist(),
                    }
                )

    return detections


# Map detection classes to violations and law references
violation_map = {
    "car": {
        "title": "Неправильная парковка",
        "law_reference": "КоАП РФ Статья 12.19",
        "priority": "low",
    },
    "garbage": {
        "title": "Мусор в общественном месте",
        "law_reference": "КоАП РФ Статья 8.2",
        "priority": "medium",
    },
    "person": {
        "title": "Нарушение общественного порядка",
        "law_reference": "КоАП РФ Статья 20.1",
        "priority": "medium",
    },
}


def main():
    min_interval = args.interval
    logger.info(f"Minimum alert interval: {min_interval} seconds")

    # Get the first active camera from the database
    try:
        camera = get_first_active_camera()
        camera_id = camera["id"]
        stream_url = camera["stream_url"]
        logger.info(
            f"Processing stream for camera: {camera['name']} at {camera['location']}"
        )
    except Exception as e:
        logger.error(f"Failed to get camera: {e}")
        return

    # Load model
    try:
        model = load_model()
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        return

    # Initialize video capture
    try:
        cap = cv2.VideoCapture(stream_url)
        if not cap.isOpened():
            raise ValueError("Could not open video stream")
        logger.info("Video stream opened successfully")
    except Exception as e:
        logger.error(f"Error opening video stream: {e}")
        return

    last_alert_time = 0
    frame_count = 0
    process_interval = 30  # Process every 30 frames

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                logger.warning("Could not read frame, reconnecting...")
                cap.release()
                time.sleep(5)  # Wait before reconnecting
                cap = cv2.VideoCapture(stream_url)
                continue

            frame_count += 1
            if frame_count % process_interval != 0:
                continue  # Skip processing this frame

            current_time = time.time()
            if current_time - last_alert_time < min_interval:
                continue  # Skip processing if within minimum interval

            # Detect objects in the frame
            detections = detect_objects(frame, model)

            # Check if any detections match our violation criteria
            for detection in detections:
                if (
                    detection["class"] in violation_map
                    and detection["confidence"] > 0.5
                ):
                    violation = violation_map[detection["class"]]

                    # Save the frame to MinIO
                    image_url = save_frame(frame, camera_id)

                    # Create alert in database
                    description = f"Обнаружено: {detection['class']} с вероятностью {int(detection['confidence'] * 100)}%"
                    alert_id = create_alert(
                        title=violation["title"],
                        description=description,
                        location=camera["location"],
                        status="new",
                        priority=violation["priority"],
                        law_reference=violation["law_reference"],
                        source="CAMERA",
                        image_url=image_url,
                        camera_id=camera_id,
                    )

                    logger.info(f"Created alert ID {alert_id} for {detection['class']}")

                    # Update the last alert time
                    last_alert_time = current_time
                    break  # Only create one alert per processing cycle

    except KeyboardInterrupt:
        logger.info("Stopping video processing")
    except Exception as e:
        logger.error(f"Error in video processing: {e}")
    finally:
        if cap is not None:
            cap.release()
        logger.info("Video processing stopped")


if __name__ == "__main__":
    main()
