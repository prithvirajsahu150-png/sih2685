import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DrainageEdge from '@/models/DrainageEdge';

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch all drainage edges
    const edges = await DrainageEdge.find({}).lean();
    
    // Convert to GeoJSON FeatureCollection
    const features = edges.map((edge) => ({
      type: 'Feature',
      geometry: edge.geometry,
      properties: {
        drain_id: edge.drain_id,
        capacity: edge.capacity
      }
    }));

    return NextResponse.json({
      type: 'FeatureCollection',
      features
    });
  } catch (error) {
    console.error('Error fetching drainage network from MongoDB, falling back to mock data:', error);
    
    // Fallback mock network for the demo if MongoDB is unavailable
    const mockFeatures = [];
    for (let i = 0; i < 50; i++) {
      // Deep inland Mumbai (e.g., Kurla, Ghatkopar) to strictly avoid the sea
      const startLon = 72.86 + Math.random() * 0.04; // 72.86 to 72.90
      const startLat = 19.05 + Math.random() * 0.10; // 19.05 to 19.15
      mockFeatures.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [startLon, startLat],
            [startLon + (Math.random() - 0.5) * 0.02, startLat + (Math.random() - 0.5) * 0.02]
          ]
        },
        properties: {
          drain_id: `mock_fb_${i}`,
          capacity: Math.random() * 5000 + 500,
          pipe_material: ['Concrete', 'HDPE', 'PVC', 'Cast Iron'][Math.floor(Math.random() * 4)],
          diameter_mm: [300, 450, 600, 900, 1200][Math.floor(Math.random() * 5)],
          manhole_id: `MH-${i}-${Math.floor(Math.random() * 100)}`,
          manhole_status: ['Clear', 'Silt Build-up', 'Blocked'][Math.floor(Math.random() * 3)]
        }
      });
    }

    return NextResponse.json({
      type: 'FeatureCollection',
      features: mockFeatures,
      _note: "MongoDB unavailable. Serving mock data."
    }, { status: 200 }); // Status 200 to keep the demo working
  }
}
