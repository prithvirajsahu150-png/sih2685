import os
import joblib
import numpy as np
import httpx
import asyncio

async def fetch_elevations(locations):
    chunk_size = 50
    elevations = []
    async with httpx.AsyncClient() as client:
        for i in range(0, len(locations), chunk_size):
            chunk = locations[i:i + chunk_size]
            lats = ",".join(str(loc[1]) for loc in chunk)
            lons = ",".join(str(loc[0]) for loc in chunk)
            url = f"https://api.open-meteo.com/v1/elevation?latitude={lats}&longitude={lons}"
            try:
                resp = await client.get(url)
                resp.raise_for_status()
                data = resp.json()
                if "elevation" in data:
                    elevations.extend(data["elevation"])
                else:
                    elevations.extend([0.5] * len(chunk))
            except Exception as e:
                print(f"Elevation API error: {e}")
                elevations.extend([0.5] * len(chunk))
    
    if len(elevations) != len(locations):
        elevations = [0.5] * len(locations)
    return elevations

class STGNNModel:
    def __init__(self):
        model_path = os.path.join(os.path.dirname(__file__), 'flood_model.pkl')
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            self.is_mock = False
        else:
            self.model = None
            self.is_mock = True

    async def predict(self, locations: list[list[float]], rainfall: list[float], timestamp: int):
        """
        Mock prediction method for spatial-temporal graph neural network.
        
        :param locations: List of [longitude, latitude] coordinate pairs.
        :param rainfall: List of simulated rainfall intensity values (mm/hr) at 15-min intervals.
        :param timestamp: Current simulation timestamp (minutes).
        :return: List of dictionaries with predicted depth and risk probability.
        """
        predictions = []
        if self.is_mock:
            # Fallback mock logic if model isn't trained yet
            for lon, lat in locations:
                base_risk = (abs(np.sin(lon * 100)) + abs(np.cos(lat * 100))) / 2
                idx = min(timestamp // 15, len(rainfall) - 1)
                current_rain = rainfall[idx] if rainfall else 0
                time_factor = 1.0 + (timestamp / 180.0)
                depth = base_risk * (current_rain / 50.0) * 2.0 * time_factor
                depth = min(max(depth + np.random.uniform(-0.1, 0.1), 0), 2.5)
                probability = min(depth / 1.5, 1.0)
                predictions.append({
                    "coordinates": [lon, lat],
                    "depth_meters": round(float(depth), 2),
                    "probability": round(float(probability), 2)
                })
            return predictions

        # Prepare features for ML model
        # Features: [rainfall, drainage_stress, elevation, historical_flooding, surface_characteristics]
        features = []
        idx = min(timestamp // 15, len(rainfall) - 1)
        current_rain = rainfall[idx] if rainfall else 0
        
        # Calculate dynamic drainage stress based on rain and duration
        drainage_stress = min(100.0, (current_rain / 50.0) * (timestamp / 60.0) * 100.0)
        
        # Fetch real DEM elevations
        real_elevations = await fetch_elevations(locations)
        
        for i, (lon, lat) in enumerate(locations):
            elevation = max(real_elevations[i], 0.5)
            
            # Deterministically generate static historical/surface data per node using math hash
            historical_flooding = (abs(np.sin(lon * 1000)) * 100.0)
            surface_characteristics = (abs(np.cos(lat * 1000)) * 100.0)
            
            features.append([
                current_rain, 
                drainage_stress, 
                elevation, 
                historical_flooding, 
                surface_characteristics
            ])
        
        X = np.array(features)
        depths = self.model.predict(X)
        
        for i, (lon, lat) in enumerate(locations):
            depth = max(depths[i], 0)
            probability = min(depth / 1.5, 1.0)
            predictions.append({
                "coordinates": [lon, lat],
                "depth_meters": round(float(depth), 2),
                "probability": round(float(probability), 2)
            })
            
        return predictions
