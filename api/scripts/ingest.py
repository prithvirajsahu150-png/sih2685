import os
import json
import random
from pymongo import MongoClient

# MongoDB Connection
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/street-flooding")
client = MongoClient(MONGO_URI)
db = client.get_database()
collection = db["drainageedges"]

def generate_mock_network():
    # Mumbai roughly: 72.8 to 73.0 Longitude, 18.9 to 19.2 Latitude
    edges = []
    
    # Generate 50 mock edges
    for i in range(50):
        start_lon = random.uniform(72.8, 72.9)
        start_lat = random.uniform(18.9, 19.1)
        
        # Short distance for the line segment
        end_lon = start_lon + random.uniform(-0.01, 0.01)
        end_lat = start_lat + random.uniform(-0.01, 0.01)
        
        edge = {
            "drain_id": f"mock_drain_{i}",
            "capacity": random.uniform(500, 5000),  # mm/hr capacity mock
            "type": random.choice(["primary", "secondary", "tertiary"]),
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [start_lon, start_lat],
                    [end_lon, end_lat]
                ]
            }
        }
        edges.append(edge)
    
    return edges

if __name__ == "__main__":
    print("Connecting to MongoDB at:", MONGO_URI)
    print(f"Clearing existing mock data...")
    # Optional: We could clear existing mock data if needed, but let's just clear all for a clean demo
    collection.delete_many({})
    
    print("Generating mock drainage network for Mumbai...")
    mock_data = generate_mock_network()
    
    print(f"Inserting {len(mock_data)} records...")
    result = collection.insert_many(mock_data)
    
    print(f"Successfully inserted {len(result.inserted_ids)} records.")
    
    # Ensure 2dsphere index exists
    collection.create_index([("geometry", "2dsphere")])
    print("Ensured 2dsphere index on geometry.")
