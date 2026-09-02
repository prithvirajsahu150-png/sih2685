import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import os
import math

def generate_synthetic_data(num_samples=10000):
    np.random.seed(42)
    # Mumbai approx bounds
    lats = np.random.uniform(18.9, 19.2, num_samples)
    lons = np.random.uniform(72.8, 72.9, num_samples)
    
    # Feature 1: Rainfall intensity (0-100 mm/hr)
    rainfall = np.random.uniform(0, 100, num_samples)
    
    # Feature 2: Drainage stress (0-100% capacity)
    drainage_stress = np.random.uniform(0, 100, num_samples)
    
    # Feature 3: Elevation (0-60m). We invert it to (1 - elev/60)*100 so higher elev = lower risk
    elevation = np.random.uniform(0.5, 60.0, num_samples)
    inv_elevation = (1.0 - (elevation / 60.0)) * 100.0
    
    # Feature 4: Historical flooding index (0-100)
    historical_flooding = np.random.uniform(0, 100, num_samples)
    
    # Feature 5: Land/surface characteristics (0-100 runoff coefficient)
    surface_characteristics = np.random.uniform(0, 100, num_samples)
    
    # Target: Flood Depth (meters) based on weighted formula
    risk_score = (
        (0.35 * rainfall) +
        (0.20 * drainage_stress) +
        (0.20 * inv_elevation) +
        (0.15 * historical_flooding) +
        (0.10 * surface_characteristics)
    )
    
    # Map 0-100 risk score to depth using an exponential curve.
    # This ensures that baseline risks (elevation, history) don't cause high floods without heavy rain.
    depth = ((risk_score / 100.0) ** 3) * 5.0
    
    # Add minor noise
    depth += np.random.normal(0, 0.05, num_samples)
    depth = np.clip(depth, 0, 4.0)
    
    X = np.column_stack((rainfall, drainage_stress, elevation, historical_flooding, surface_characteristics))
    y = depth
    return X, y

if __name__ == "__main__":
    print("Generating synthetic Mumbai topological dataset...")
    X, y = generate_synthetic_data()
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForestRegressor model...")
    model = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    score = model.score(X_test, y_test)
    print(f"Model R^2 Score: {score:.4f}")
    
    model_path = os.path.join(os.path.dirname(__file__), '..', 'ml_engine', 'flood_model.pkl')
    joblib.dump(model, model_path)
    print(f"Model successfully saved to {model_path}")
