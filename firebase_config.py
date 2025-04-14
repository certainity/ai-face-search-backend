import firebase_admin
from firebase_admin import credentials, storage, firestore

cred = credentials.Certificate("serviceAccountKey.json")  # download from Firebase Console
firebase_admin.initialize_app(cred, {
    'storageBucket': 'facedetector-96fc0.firebasestorage.app'
})

db = firestore.client()
bucket = storage.bucket()
