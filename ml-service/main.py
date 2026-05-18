from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest
import numpy as np
import requests
from apscheduler.schedulers.background import BackgroundScheduler
import os
from dotenv import load_dotenv

load_dotenv()
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")

app = FastAPI(title="SafeZone ML Service")

class ZoneData(BaseModel):
    zone_id: str
    crime_count: int

class DetectRequest(BaseModel):
    data: list[ZoneData]

# Global state to hold our trained model
model = None

def run_anomaly_detection_job():
    print("Running scheduled anomaly detection...")
    # In a production environment, this would fetch real counts from the database
    # For demo, simulate data points
    import random
    mock_data = [
        {"zone_id": "Downtown", "crime_count": random.randint(1, 10)},
        {"zone_id": "Uptown", "crime_count": random.randint(15, 30)} # High anomaly chance
    ]
    
    try:
        results = []
        for zone in mock_data:
            X = np.array([[zone["crime_count"]]])
            score = float(model.decision_function(X)[0])
            prediction = int(model.predict(X)[0]) # -1 is anomaly, 1 is normal
            is_anomaly = prediction == -1
            
            results.append({
                "zone_id": zone["zone_id"],
                "anomaly_score": score,
                "is_anomaly": is_anomaly
            })
            
        requests.post(f"{BACKEND_URL}/api/alerts/webhook", json={"results": results})
        print("Anomaly detection job finished, webhook triggered.")
    except Exception as e:
        print("Error in background job:", e)

@app.on_event("startup")
def startup_event():
    # Initialize a baseline model with some dummy historical data
    global model
    model = IsolationForest(contamination=0.1, random_state=42)
    # Baseline counts (e.g., 5-20 crimes per zone per hour)
    X_train = np.array([[5], [10], [15], [12], [8], [11], [14], [18], [20], [6]])
    model.fit(X_train)
    print("Baseline Isolation Forest model loaded.")
    
    scheduler = BackgroundScheduler()
    scheduler.add_job(run_anomaly_detection_job, 'interval', minutes=15)
    scheduler.start()

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "SafeZone ML Service", "model_loaded": model is not None}

@app.post("/detect")
def detect_anomaly(request: DetectRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Model not initialized")
    
    results = []
    for zone in request.data:
        # Reshape for sklearn
        X = np.array([[zone.crime_count]])
        
        # Isolation Forest score: negative = anomaly, positive = normal
        score = float(model.decision_function(X)[0])
        prediction = int(model.predict(X)[0]) # -1 is anomaly, 1 is normal
        
        is_anomaly = prediction == -1
        
        results.append({
            "zone_id": zone.zone_id,
            "anomaly_score": score,
            "is_anomaly": is_anomaly
        })
    return {"results": results}

class TrainRequest(BaseModel):
    historical_counts: list[int]

@app.post("/train")
def train_model(request: TrainRequest):
    global model
    if len(request.historical_counts) < 10:
        raise HTTPException(status_code=400, detail="Need at least 10 data points to train")
    
    X_train = np.array(request.historical_counts).reshape(-1, 1)
    
    new_model = IsolationForest(contamination=0.1, random_state=42)
    new_model.fit(X_train)
    
    model = new_model
    return {"status": "success", "message": "Model retrained successfully", "samples_trained": len(request.historical_counts)}
