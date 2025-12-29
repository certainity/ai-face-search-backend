# AI Face Search

A full-stack application for AI-powered face recognition, search, and management. Upload images, detect faces, search by similarity, and organize your photo collection with intelligent tagging.

## Features

- **Face Detection & Recognition**: Automatic face detection and encoding using face_recognition library
- **Similarity Search**: Find similar faces using cosine distance comparison
- **Smart Tagging**: Automatic image tagging with YOLO object detection and CLIP
- **OCR Detection**: Extract text and logos from images
- **Web Interface**: Modern React-based UI for easy interaction
- **Cloud Storage**: Firebase Storage and Firestore integration

## Architecture

This project consists of two main components:

### Backend (FastAPI)
- Face detection and encoding
- Face similarity search
- Image storage and metadata management
- Smart tagging with AI models (YOLO, CLIP, OCR)
- RESTful API endpoints

### Frontend (React)
- Upload images with face detection
- Search for similar faces
- Browse gallery of detected faces
- View all photos of a person
- Name labeling

## Quick Start

### Backend Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Set up Firebase:
   - Create a Firebase project
   - Download service account key
   - Configure `firebase_config.py`

3. Run the backend:
```bash
uvicorn main:app --reload
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the web app:
```bash
cd web-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## API Endpoints

- `POST /upload/` - Upload image with face detection
- `POST /search/` - Search for similar faces
- `GET /faces/` - Get all detected faces
- `POST /faces/update_name/` - Update face name
- `GET /person_images/` - Get all images of a person
- `GET /face_by_id/{face_id}` - Get images by face ID

## Tech Stack

**Backend:**
- FastAPI
- face_recognition
- YOLO (Ultralytics)
- CLIP (OpenAI)
- EasyOCR
- Firebase Admin SDK
- OpenCV

**Frontend:**
- React 18
- React Router
- Tailwind CSS
- Axios
- Vite

## Project Structure

```
.
├── main.py              # FastAPI application
├── face_utils.py        # Face detection and tagging utilities
├── firebase_config.py   # Firebase configuration
├── requirements.txt     # Python dependencies
├── yolov8n.pt          # YOLO model
└── web-app/            # React frontend
    ├── src/
    │   ├── pages/      # Page components
    │   ├── App.jsx     # Main app
    │   └── config.js   # API configuration
    └── package.json
```

## License

MIT
