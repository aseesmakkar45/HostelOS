import base64
import numpy as np
import cv2
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Any
from deepface import DeepFace
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI()

# Enable CORS so the React frontend can call it directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExtractRequest(BaseModel):
    image: str

class RegisteredFace(BaseModel):
    id: int
    face_data: List[float]

class MatchRequest(BaseModel):
    image: str
    registered_faces: List[RegisteredFace]
    
def base64_to_cv2(base64_str):
    # Remove header if present
    if "base64," in base64_str:
        base64_str = base64_str.split("base64,")[1]
    
    img_data = base64.b64decode(base64_str)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def cosine_distance(a, b):
    a = np.array(a)
    b = np.array(b)
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 1.0
    return 1 - np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Initialize model on startup so the first request is fast
@app.on_event("startup")
def load_model():
    print("Loading ArcFace model...")
    # Just a dummy call to load it into memory
    # We create a dummy black image
    dummy_img = np.zeros((224, 224, 3), dtype=np.uint8)
    try:
        DeepFace.represent(img_path=dummy_img, model_name="ArcFace", enforce_detection=False)
        print("Model loaded successfully!")
    except Exception as e:
        print("Error loading model:", e)


@app.post("/extract")
async def extract_face(req: ExtractRequest):
    try:
        img = base64_to_cv2(req.image)
        # DeepFace represent returns a list of dictionaries (one for each face detected)
        result = DeepFace.represent(img_path=img, model_name="ArcFace", enforce_detection=True)
        if not result or len(result) == 0:
            return {"success": False, "error": "No face detected"}
            
        # Get the embedding of the most prominent face
        embedding = result[0]["embedding"]
        return {"success": True, "embedding": embedding}
    except Exception as e:
        if "Face could not be detected" in str(e):
            return {"success": False, "error": "No face detected"}
        return {"success": False, "error": str(e)}

@app.post("/match")
async def match_face(req: MatchRequest):
    try:
        if len(req.registered_faces) == 0:
            return {"success": False, "error": "No registered faces in database"}
            
        img = base64_to_cv2(req.image)
        result = DeepFace.represent(img_path=img, model_name="ArcFace", enforce_detection=True)
        if not result or len(result) == 0:
            return {"success": False, "error": "No face detected"}
            
        live_embedding = result[0]["embedding"]
        
        # ArcFace Cosine Distance threshold is typically around 0.68.
        # We'll use 0.68 as the cutoff threshold for matching.
        THRESHOLD = 0.68
        
        best_match = None
        best_distance = float('inf')
        
        for reg_face in req.registered_faces:
            dist = cosine_distance(live_embedding, reg_face.face_data)
            if dist < best_distance:
                best_distance = dist
                best_match = reg_face.id
                
        if best_distance <= THRESHOLD:
            return {"success": True, "match": str(best_match), "distance": best_distance}
        else:
            return {"success": False, "error": "Face mismatch", "distance": best_distance}
            
    except Exception as e:
        if "Face could not be detected" in str(e):
            return {"success": False, "error": "No face detected"}
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
