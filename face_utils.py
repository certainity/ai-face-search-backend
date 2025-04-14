import face_recognition
import numpy as np
import cv2
import uuid
from ultralytics import YOLO
import clip
import torch
from PIL import Image
import easyocr
from scipy.spatial import distance
from PIL import Image
import io

# Load models
yolo_model = YOLO("yolov8n.pt")  # lightweight; use yolov8s.pt for better accuracy
device = "cuda" if torch.cuda.is_available() else "cpu"
clip_model, preprocess = clip.load("ViT-B/32", device=device)
ocr_reader = easyocr.Reader(['en'], gpu=device == "cuda")


def detect_faces_and_encode(image_path):
    image = face_recognition.load_image_file(image_path)

    # Step 1: Try default face_recognition
    face_locations = face_recognition.face_locations(image)
    face_encodings = face_recognition.face_encodings(image, face_locations)

    if face_encodings:
        return face_locations, face_encodings

    # Step 2: Fallback to OpenCV Haar Cascade
    print("Fallback to OpenCV Haar cascade...")

    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(50, 50))

    fallback_locations = []
    for (x, y, w, h) in faces:
        top = y
        right = x + w
        bottom = y + h
        left = x
        fallback_locations.append((top, right, bottom, left))

    face_encodings = face_recognition.face_encodings(image, fallback_locations)
    return fallback_locations, face_encodings



def compare_faces(known_encodings, encoding_to_check):
    matches = []
    for item in known_encodings:
        dist = distance.cosine(item['encoding'], encoding_to_check)
        matches.append({
            "distance": dist,
            "image_url": item['image_url'],
            "name": item.get('name', '')
        })
    return sorted(matches, key=lambda x: x["distance"])


def detect_tags(image_path):
    results = yolo_model(image_path)
    tags = []

    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            label = r.names[cls_id]

            if conf > 0.4 and label in ["person", "backpack", "handbag", "suitcase", "tie", "shoe"]:
                tags.append(label)

    return list(set(tags))


def smart_tag_image(image_path):
    tags = []

    # OCR (logo/text on shirt)
    ocr_result = ocr_reader.readtext(image_path)
    for _, text, conf in ocr_result:
        if conf > 0.4:
            tags.append(text.lower())

    # CLIP caption matching
    clip_prompts = [
    # Clothing colors
    "black shirt", "white shirt", "red shirt", "blue shirt", "green shirt", "yellow shirt",
    # Logos / symbols
    "Nike logo", "Adidas logo",
    # Others
    "tattoo"
    ]


    image = preprocess(Image.open(image_path)).unsqueeze(0).to(device)
    text = clip.tokenize(clip_prompts).to(device)

    with torch.no_grad():
        image_features = clip_model.encode_image(image)
        text_features = clip_model.encode_text(text)
        logits_per_image, _ = clip_model(image, text)
        probs = logits_per_image.softmax(dim=-1).cpu().numpy()[0]

    for i, prob in enumerate(probs):
        if prob > 0.25:
            tags.append(clip_prompts[i])

    return list(set(tags))

def crop_and_save_face(image_path, face_location):
    top, right, bottom, left = face_location
    image = Image.open(image_path)
    cropped = image.crop((left, top, right, bottom))

    # Save to temp file
    cropped_path = f"thumb_{uuid.uuid4()}.jpg"
    cropped.save(cropped_path)
    return cropped_path