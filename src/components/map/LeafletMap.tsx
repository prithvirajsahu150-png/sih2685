"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, useMapEvents, Marker } from 'react-leaflet';
import { useMapStore } from '@/lib/store';
import { calculateEvacuationRoute } from '@/lib/routing';
import L from 'leaflet';

// Create custom icons for routing
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const pulsingAnomalyIcon = L.divIcon({
  className: 'bg-transparent',
  html: `<div class="relative flex h-6 w-6">
           <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
           <span class="relative inline-flex rounded-full h-6 w-6 bg-red-600 border-2 border-white shadow-[0_0_15px_rgba(239,68,68,0.8)]"></span>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function RoutingInteraction() {
  const { isRoutingMode, routeStart, setRouteStart, routeEnd, setRouteEnd } = useMapStore();
  
  useMapEvents({
    click(e) {
      if (!isRoutingMode) return;
      const { lat, lng } = e.latlng;
      if (!routeStart) {
        setRouteStart([lng, lat]);
      } else if (!routeEnd) {
        setRouteEnd([lng, lat]);
      } else {
        // Reset and start over
        setRouteStart([lng, lat]);
        setRouteEnd(null);
      }
    }
  });
  return null;
}

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function LeafletMap() {
  const { 
    currentTimestamp, 
    networkGeoJSON, 
    setNetworkGeoJSON, 
    predictionGeoJSON, 
    setPredictionGeoJSON,
    setIsLoading,
    setApiError,
    showDrainage,
    showFloodRisk,
    isRoutingMode,
    routeStart,
    routeEnd,
    safeRouteGeoJSON,
    setSafeRouteGeoJSON,
    isLiveWeather,
    liveRainfall
  } = useMapStore();
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
    // Connect to WebSocket for live sensor anomalies
    const ws = new WebSocket('ws://localhost:8000/ws/alerts');
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'anomaly') {
          setAnomalies(prev => [...prev, data]);
          setToastMessage(data.message);
          
          // Auto remove anomaly after 15 seconds
          setTimeout(() => {
            setAnomalies(prev => prev.filter(a => a !== data));
          }, 15000);
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    async function fetchNetwork() {
      try {
        const res = await fetch('/api/network');
        if (res.ok) {
          const data = await res.json();
          setNetworkGeoJSON(data);
        }
      } catch (error) {
        console.error('Failed to fetch drainage network:', error);
      }
    }
    fetchNetwork();
  }, [setNetworkGeoJSON]);

  useEffect(() => {
    async function fetchPredictions() {
      if (!networkGeoJSON) return;

      const mockRainfall = [10, 15, 20, 30, 45, 50, 60, 70, 80, 75, 60, 40, 20];
      const idx = Math.min(Math.floor(currentTimestamp / 15), mockRainfall.length - 1);
      const currentRain = isLiveWeather ? liveRainfall : (mockRainfall[idx] || 0);

      // Extract unique node coordinates from the drainage network
      const nodeSet = new Set<string>();
      const sampleLocations: [number, number][] = [];
      
      networkGeoJSON.features.forEach((feature: any) => {
        if (feature.geometry.type === 'LineString') {
          feature.geometry.coordinates.forEach((coord: [number, number]) => {
            const key = `${coord[0].toFixed(5)},${coord[1].toFixed(5)}`;
            if (!nodeSet.has(key)) {
              nodeSet.add(key);
              sampleLocations.push(coord);
            }
          });
        }
      });

      try {
        setIsLoading(true);
        setApiError(null);
        setToastMessage(null);
        
        const res = await fetch('/api/py/api/predict/flood', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            locations: sampleLocations,
            rainfall: isLiveWeather ? [currentRain] : [10, 15, 20, 30, 45, 50, 60, 70, 80, 75, 60, 40, 20],
            timestamp: currentTimestamp
          })
        });

        if (res.ok) {
          const data = await res.json();
          // Inject current rain into properties for the popup
          data.features.forEach((f: any) => {
            f.properties.current_rain = currentRain;
          });
          setPredictionGeoJSON(data);
        } else {
          setApiError("HTTP Error");
          setToastMessage("Unable to update flood prediction. Please check the backend.");
        }
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
        setApiError("Network Error");
        setToastMessage("Unable to update flood prediction. Please check the backend.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPredictions();
  }, [currentTimestamp, networkGeoJSON, setPredictionGeoJSON, setIsLoading, setApiError]);

  useEffect(() => {
    if (isRoutingMode && routeStart && routeEnd && networkGeoJSON && predictionGeoJSON) {
      const route = calculateEvacuationRoute(routeStart, routeEnd, networkGeoJSON, predictionGeoJSON);
      if (route) {
        setSafeRouteGeoJSON(route);
        setToastMessage(null);
      } else {
        setSafeRouteGeoJSON(null);
        setToastMessage("No valid safe route found between these points.");
      }
    } else {
      setSafeRouteGeoJSON(null);
    }
  }, [routeStart, routeEnd, networkGeoJSON, predictionGeoJSON, isRoutingMode, setSafeRouteGeoJSON]);

  const getRiskColor = (riskLevel: string) => {
    const level = riskLevel.toUpperCase();
    if (level === 'LOW') return '#22c55e'; // green
    if (level === 'MEDIUM') return '#eab308'; // yellow
    if (level === 'HIGH') return '#f97316'; // orange
    if (level === 'CRITICAL') return '#ef4444'; // red
    return '#ccc';
  };

  return (
    <div className="w-full h-full relative z-0" style={{ isolation: 'isolate' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[2000] bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-xl backdrop-blur-sm animate-pulse text-sm font-medium">
          {toastMessage}
        </div>
      )}

      <MapContainer 
        center={[19.0760, 72.8777]} 
        zoom={11} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />

        {showDrainage && networkGeoJSON && (
          <GeoJSON 
            data={networkGeoJSON as any} 
            style={{ color: '#3b82f6', weight: 4, opacity: 0.8 }}
            onEachFeature={(feature, layer) => {
              if (feature.properties) {
                const props = feature.properties;
                layer.bindPopup(() => {
                  const state = useMapStore.getState();
                  const mockRainfall = [10, 15, 20, 30, 45, 50, 60, 70, 80, 75, 60, 40, 20];
                  const idx = Math.min(Math.floor(state.currentTimestamp / 15), mockRainfall.length - 1);
                  const currentRain = state.isLiveWeather ? state.liveRainfall : (mockRainfall[idx] || 0);
                  
                  // Approximate flow based on rain intensity (arbitrary multiplier for demo)
                  const currentFlow = currentRain * (props.diameter_mm / 10);
                  const capacity = props.capacity || 1000;
                  const overflow = Math.max(0, currentFlow - capacity);
                  
                  const overflowHtml = overflow > 0 
                    ? `<div style="color: #ef4444; font-weight: bold; padding: 4px; background: #fee2e2; border-radius: 4px; margin-top: 2px;">⚠️ Overflowing by ${Math.round(overflow)} L/s!</div>` 
                    : `<div style="color: #10b981; font-weight: bold; padding: 4px; background: #d1fae5; border-radius: 4px; margin-top: 2px;">✅ Operating within capacity</div>`;

                  const div = document.createElement('div');
                  div.innerHTML = `<div style="font-family: sans-serif; color: #1e293b; min-width: 220px;">
                     <h3 style="margin:0 0 8px 0; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">🚰 Drainage Link Info</h3>
                     <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
                       <div><b>Link ID:</b> ${props.drain_id || 'Unknown'}</div>
                       <div><b>Net Capacity:</b> ${Math.round(capacity)} L/s</div>
                       <div><b>Current Flow:</b> ${Math.round(currentFlow)} L/s</div>
                       ${overflowHtml}
                       <hr style="border-top: 1px dashed #cbd5e1; margin: 4px 0;" />
                       <div><b>Pipe Material:</b> ${props.pipe_material || 'Unknown'}</div>
                       <div><b>Diameter:</b> ${props.diameter_mm || 'Unknown'} mm</div>
                       <div><b>Manhole ID:</b> ${props.manhole_id || 'Unknown'}</div>
                       <div><b>Status:</b> <span style="color: ${props.manhole_status === 'Blocked' ? 'red' : props.manhole_status === 'Clear' ? 'green' : 'orange'}; font-weight: bold;">${props.manhole_status || 'Unknown'}</span></div>
                     </div>
                   </div>`;
                  return div;
                });
              }
            }}
          />
        )}

        {showFloodRisk && predictionGeoJSON && predictionGeoJSON.features.map((feature: any, index: number) => {
          const coordinates = feature.geometry.coordinates; // [lon, lat]
          const props = feature.properties;
          return (
            <CircleMarker
              key={index}
              center={[coordinates[1], coordinates[0]]} // [lat, lon]
              radius={Math.max(props.predicted_depth_meters * 4 + 4, 8)}
              pathOptions={{
                color: '#000',
                weight: 1,
                fillColor: getRiskColor(props.risk_level),
                fillOpacity: 0.8
              }}
            >
              <Popup>
                <div style={{ fontFamily: 'sans-serif', color: '#1e293b', padding: '2px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', color: '#0f172a' }}>Flood Prediction</h3>
                  <div style={{ marginBottom: '4px' }}><b>Drain ID:</b> {props.drain_id || `DRAIN-00${index+1}`}</div>
                  <div style={{ marginBottom: '4px' }}>
                    <b>Risk:</b> <span style={{ color: getRiskColor(props.risk_level), fontWeight: 'bold' }}>{props.risk_level.toUpperCase()}</span>
                  </div>
                  <div style={{ marginBottom: '4px' }}><b>Depth:</b> {props.predicted_depth_meters.toFixed(2)} m</div>
                  <div style={{ marginBottom: '4px' }}><b>Rainfall:</b> {props.current_rain || 0} mm/hr</div>
                  <div style={{ marginBottom: '4px' }}><b>Time:</b> T = {currentTimestamp} min</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {anomalies.map((anomaly, idx) => (
          <Marker 
            key={`anomaly-${idx}`} 
            position={[anomaly.coordinates[1], anomaly.coordinates[0]]} 
            icon={pulsingAnomalyIcon}
          >
            <Popup>
              <div style={{ fontFamily: 'sans-serif', color: '#1e293b' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#ef4444', fontWeight: 'bold' }}>🚨 SENSOR ANOMALY</h3>
                <div>{anomaly.message}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        <RoutingInteraction />
        
        {routeStart && <Marker position={[routeStart[1], routeStart[0]]} icon={startIcon} />}
        {routeEnd && <Marker position={[routeEnd[1], routeEnd[0]]} icon={endIcon} />}
        
        {safeRouteGeoJSON && (
          <GeoJSON 
            data={safeRouteGeoJSON} 
            style={{ color: '#10b981', weight: 6, opacity: 0.9, dashArray: '10, 10' }}
          />
        )}
      </MapContainer>
    </div>
  );
}
