import { create } from 'zustand';
import type { FeatureCollection } from 'geojson';

interface MapState {
  currentTimestamp: number;
  isPlaying: boolean;
  playbackSpeed: number;
  isLoading: boolean;
  apiError: string | null;
  showDrainage: boolean;
  showFloodRisk: boolean;
  showRainfall: boolean;
  networkGeoJSON: FeatureCollection | null;
  predictionGeoJSON: FeatureCollection | null;
  isRoutingMode: boolean;
  routeStart: [number, number] | null; // [lon, lat]
  routeEnd: [number, number] | null; // [lon, lat]
  safeRouteGeoJSON: any | null;
  isLiveWeather: boolean;
  liveRainfall: number;
  showAnalytics: boolean;
  
  setCurrentTimestamp: (time: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setIsLoading: (loading: boolean) => void;
  setApiError: (error: string | null) => void;
  setShowDrainage: (show: boolean) => void;
  setShowFloodRisk: (show: boolean) => void;
  setShowRainfall: (show: boolean) => void;
  setNetworkGeoJSON: (data: FeatureCollection | null) => void;
  setPredictionGeoJSON: (data: FeatureCollection | null) => void;
  setIsRoutingMode: (mode: boolean) => void;
  setRouteStart: (point: [number, number] | null) => void;
  setRouteEnd: (point: [number, number] | null) => void;
  setSafeRouteGeoJSON: (data: any | null) => void;
  setIsLiveWeather: (isLive: boolean) => void;
  setLiveRainfall: (rainfall: number) => void;
  setShowAnalytics: (show: boolean) => void;
}

export const useMapStore = create<MapState>((set) => ({
  currentTimestamp: 0,
  isPlaying: false,
  playbackSpeed: 1,
  isLoading: false,
  apiError: null,
  showDrainage: true,
  showFloodRisk: true,
  showRainfall: true,
  networkGeoJSON: null,
  predictionGeoJSON: null,
  isRoutingMode: true,
  routeStart: [72.865, 19.06], // Deep inland Mumbai SW corner
  routeEnd: [72.895, 19.14],   // Deep inland Mumbai NE corner
  safeRouteGeoJSON: null,
  isLiveWeather: false,
  liveRainfall: 0,
  showAnalytics: false,
  
  setCurrentTimestamp: (time: number) => set({ currentTimestamp: time }),
  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed: number) => set({ playbackSpeed: speed }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setApiError: (error: string | null) => set({ apiError: error }),
  setShowDrainage: (show: boolean) => set({ showDrainage: show }),
  setShowFloodRisk: (show: boolean) => set({ showFloodRisk: show }),
  setShowRainfall: (show: boolean) => set({ showRainfall: show }),
  setNetworkGeoJSON: (data: FeatureCollection | null) => set({ networkGeoJSON: data }),
  setPredictionGeoJSON: (data: FeatureCollection | null) => set({ predictionGeoJSON: data }),
  setIsRoutingMode: (mode: boolean) => set({ isRoutingMode: mode, routeStart: null, routeEnd: null, safeRouteGeoJSON: null }),
  setRouteStart: (point: [number, number] | null) => set({ routeStart: point }),
  setRouteEnd: (point: [number, number] | null) => set({ routeEnd: point }),
  setSafeRouteGeoJSON: (data: any | null) => set({ safeRouteGeoJSON: data }),
  setIsLiveWeather: (isLive: boolean) => set({ isLiveWeather: isLive }),
  setLiveRainfall: (rainfall: number) => set({ liveRainfall: rainfall }),
  setShowAnalytics: (show: boolean) => set({ showAnalytics: show }),
}));
