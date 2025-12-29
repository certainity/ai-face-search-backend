# AI Face Search Web App

A modern web application for AI-powered face recognition and search, built with React and Tailwind CSS.

## Features

- **Upload Images**: Upload images with faces for automatic detection and storage
- **Face Search**: Search for similar faces by uploading an image
- **Gallery View**: Browse all detected faces with name labeling
- **Person View**: View all photos containing a specific person
- **Smart Tagging**: Automatic image tagging using YOLO and CLIP

## Tech Stack

- React 18
- React Router v6
- Tailwind CSS
- Axios
- Vite

## Prerequisites

- Node.js (v16 or higher)
- Running backend API (see parent directory)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file (optional):
```bash
cp .env.example .env
```

3. Configure API endpoint in `.env`:
```
VITE_API_URL=http://localhost:8000
```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Usage

1. **Upload**: Navigate to the Upload page and select an image with faces
2. **Search**: Use the Search page to find similar faces in your database
3. **Gallery**: Browse all detected faces and add names
4. **Person**: Click on any face in the gallery to see all photos of that person

## API Integration

The app connects to the FastAPI backend. Make sure the backend is running on the configured API URL (default: `http://localhost:8000`).

## Project Structure

```
src/
├── pages/
│   ├── Upload.jsx      # Image upload page
│   ├── Search.jsx      # Face search page
│   ├── Gallery.jsx     # All faces gallery
│   └── Person.jsx      # Person photos view
├── config.js           # API configuration
├── App.jsx             # Main app with routing
└── main.jsx            # App entry point
```
