"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the map to prevent SSR issues with Leaflet
const LeafletMap = dynamic(
  () => import('./LeafletMap'),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400">Loading Map...</div> }
);

export default function FloodMap() {
  return <LeafletMap />;
}
