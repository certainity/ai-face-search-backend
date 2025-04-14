from fastapi import FastAPI, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from firebase_config import db, bucket
from face_utils import detect_faces_and_encode, compare_faces, detect_tags, smart_tag_image
import uuid
import shutil
import os
import tempfile
from PIL import Image
from fastapi import Body


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    temp_filename = f"temp_{uuid.uuid4()}.jpg"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Detect faces and tags
    face_locations, face_encodings = detect_faces_and_encode(temp_filename)

    tags_yolo = detect_tags(temp_filename)
    tags_clip = smart_tag_image(temp_filename)
    tags = list(set(tags_yolo + tags_clip))

    if not face_encodings:
        os.remove(temp_filename)
        return {"error": "No face found."}

    # Upload full image to Firebase
    blob = bucket.blob(f"faces/{uuid.uuid4()}.jpg")
    blob.upload_from_filename(temp_filename)
    token = str(uuid.uuid4())
    blob.metadata = {"firebaseStorageDownloadTokens": token}
    blob.patch()
    image_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/{blob.name.replace('/', '%2F')}?alt=media&token={token}"

    # Save each face and cropped version
    for i, encoding in enumerate(face_encodings):
        # Crop face
        top, right, bottom, left = face_locations[i]
        image = Image.open(temp_filename)
        cropped = image.crop((left, top, right, bottom))
        cropped_path = f"thumb_{uuid.uuid4()}.jpg"
        cropped.save(cropped_path)

        # Upload cropped face
        thumb_blob = bucket.blob(f"faces/thumbs/{uuid.uuid4()}.jpg")
        thumb_blob.upload_from_filename(cropped_path)
        thumb_token = str(uuid.uuid4())
        thumb_blob.metadata = {"firebaseStorageDownloadTokens": thumb_token}
        thumb_blob.patch()
        face_url = f"https://firebasestorage.googleapis.com/v0/b/{bucket.name}/o/{thumb_blob.name.replace('/', '%2F')}?alt=media&token={thumb_token}"
        os.remove(cropped_path)

        # Save to Firestore
        db.collection("faces").add({
            "encoding": encoding.tolist(),
            "image_url": image_url,
            "face_url": face_url,  # ✅ Used for Immich-style thumbnail
            "name": "",
            "tags": tags
        })

    os.remove(temp_filename)

    return {
        "message": "Uploaded and face saved",
        "faces": len(face_encodings),
        "image_url": image_url
    }


@app.post("/search/")
async def search_face(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    face_locations, face_encodings = detect_faces_and_encode(tmp_path)

    if not face_encodings:
        os.remove(tmp_path)
        return {"error": "No face detected in image."}

    target_encoding = face_encodings[0]

    # Load known encodings from Firestore
    docs = db.collection("faces").stream()
    known_encodings = []
    for doc in docs:
        data = doc.to_dict()
        if "encoding" in data:
            known_encodings.append({
                "encoding": data["encoding"],
                "image_url": data.get("image_url", ""),
                "face_url": data.get("face_url", ""),
                "name": data.get("name", "")
            })

    os.remove(tmp_path)

    results = compare_faces(known_encodings, target_encoding)
    top_matches = results[:5]

    return {"matches": top_matches}


# @app.get("/faces/")
# def get_all_faces():
#     docs = db.collection("faces").stream()
#     faces = []
#     for doc in docs:
#         data = doc.to_dict()
#         if "image_url" in data:
#             faces.append({
#                 "image_url": data["image_url"],
#                 "face_url": data.get("face_url", ""),  # ✅ Add face_url for cropped view
#                 "name": data.get("name", ""),
#                 "tags": data.get("tags", [])
#             })
#     return {"faces": faces}

@app.get("/faces/")
def get_all_faces():
    docs = db.collection("faces").stream()
    faces = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id  # ✅ Add document ID
        if "image_url" in data:
            faces.append({
                "id": data["id"],              # Include Firestore doc ID
                "image_url": data["image_url"],
                "face_url": data.get("face_url", ""),
                "name": data.get("name", ""),
                "tags": data.get("tags", []),
                "encoding": data.get("encoding", [])
            })
    return {"faces": faces}


@app.post("/faces/update_name/")
def update_name(face_url: str = Body(...), name: str = Body(...)):
    docs = db.collection("faces").where("face_url", "==", face_url).stream()
    for doc in docs:
        doc.reference.update({"name": name})
        return {"status": "success", "message": f"Name '{name}' updated."}
    return {"status": "error", "message": "Face not found."}

from fastapi import Query

@app.get("/person_images/")
def get_images_for_face(face_url: str = Query(...)):
    # Find all faces with the same cropped face_url
    matching_faces = db.collection("faces").where("face_url", "==", face_url).stream()
    image_urls = set()
    for face in matching_faces:
        data = face.to_dict()
        if "image_url" in data:
            image_urls.add(data["image_url"])
    return {"images": [{"image_url": url} for url in image_urls]}

@app.post("/faces/by_face_url/")
def get_faces_by_face_url(face_url: str = Body(...)):
    docs = db.collection("faces").where("face_url", "==", face_url).stream()
    image_urls = set()
    for doc in docs:
        data = doc.to_dict()
        if "image_url" in data:
            image_urls.add(data["image_url"])
    return {"images": [{"image_url": url} for url in image_urls]}

@app.get("/face_by_id/{face_id}")
def get_face_by_id(face_id: str):
    doc = db.collection("faces").document(face_id).get()
    if not doc.exists:
        return {"images": []}
    face_data = doc.to_dict()
    target_encoding = face_data.get("encoding")

    if not target_encoding:
        return {"images": []}

    # Find all similar encodings in DB
    all_faces = db.collection("faces").stream()
    matches = set()
    for face in all_faces:
        data = face.to_dict()
        if "encoding" in data and "image_url" in data:
            if compare_faces([data["encoding"]], target_encoding)[0]["match"]:  # adjust logic here
                matches.add(data["image_url"])
    return {"images": [{"image_url": url} for url in matches]}

