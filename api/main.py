from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import asyncio
import random
from pydantic import BaseModel
from typing import List, Optional
from api.ml_engine.model import STGNNModel
import json
import httpx

app = FastAPI(title="Urban Flood Nowcasting API")

connected_clients = []

async def broadcast_anomalies():
    while True:
        await asyncio.sleep(random.randint(10, 20)) # Emit every 10-20 seconds
        if connected_clients:
            # Deep inland Mumbai to strictly avoid the sea
            lon = 72.86 + random.uniform(0.0, 0.04)
            lat = 19.05 + random.uniform(0.0, 0.10)
            msg = json.dumps({
                "type": "anomaly", 
                "coordinates": [lon, lat], 
                "message": "Sudden water level spike detected by ultrasonic sensor!"
            })
            for client in connected_clients:
                try:
                    await client.send_text(msg)
                except:
                    pass

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(broadcast_anomalies())

@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        connected_clients.remove(websocket)

# Initialize the mock ML model
stgnn = STGNNModel()

class Location(BaseModel):
    lon: float
    lat: float

class PredictRequest(BaseModel):
    locations: List[List[float]]
    rainfall: List[float]
    timestamp: int

@app.post("/api/predict/flood")
async def predict_flood(req: PredictRequest):
    # Run predictions with async DEM fetch
    predictions = await stgnn.predict(req.locations, req.rainfall, req.timestamp)
    
    # Format as GeoJSON FeatureCollection
    features = []
    for pred in predictions:
        depth = pred["depth_meters"]
        if depth < 0.3:
            risk_level = "Low"
        elif depth < 1.0:
            risk_level = "Medium"
        else:
            risk_level = "High"
            
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": pred["coordinates"]
            },
            "properties": {
                "predicted_depth_meters": depth,
                "probability": pred["probability"],
                "risk_level": risk_level
            }
        }
        features.append(feature)
        
    return {
        "type": "FeatureCollection",
        "features": features
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/api/weather/current")
async def get_current_weather():
    url = "https://api.open-meteo.com/v1/forecast?latitude=19.0760&longitude=72.8777&current=precipitation&timezone=Asia%2FKolkata"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            precip = data.get("current", {}).get("precipitation", 0)
            return {"rainfall_mm_hr": precip}
        except Exception as e:
            return {"rainfall_mm_hr": 15.0, "error": str(e)}
