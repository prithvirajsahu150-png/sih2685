import type { FeatureCollection, Feature, LineString } from 'geojson';

// Simple priority queue for Dijkstra's
class PriorityQueue<T> {
  private items: { element: T; priority: number }[] = [];

  enqueue(element: T, priority: number) {
    const queueElement = { element, priority };
    let added = false;
    for (let i = 0; i < this.items.length; i++) {
      if (queueElement.priority < this.items[i].priority) {
        this.items.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }
    if (!added) {
      this.items.push(queueElement);
    }
  }

  dequeue(): { element: T; priority: number } | undefined {
    return this.items.shift();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// Distance formula
function haversineDistance(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateEvacuationRoute(
  start: [number, number],
  end: [number, number],
  network: FeatureCollection,
  predictions: FeatureCollection
): Feature | null {
  
  if (!network || !predictions) return null;

  // 1. Build Adjacency List
  const graph: Map<string, { to: string, cost: number, coords: [number, number] }[]> = new Map();
  const nodeCoords: Map<string, [number, number]> = new Map();
  
  // Create a map of high risk coordinates to quickly look up penalties
  const riskMap: Map<string, number> = new Map();
  predictions.features.forEach((f: any) => {
    const risk = f.properties.risk_level?.toUpperCase();
    const [lon, lat] = f.geometry.coordinates;
    const key = `${lon.toFixed(5)},${lat.toFixed(5)}`;
    if (risk === 'CRITICAL') riskMap.set(key, 100000);
    else if (risk === 'HIGH') riskMap.set(key, 50000);
    else if (risk === 'MEDIUM') riskMap.set(key, 1000);
  });

  const getKey = (coord: [number, number]) => `${coord[0].toFixed(5)},${coord[1].toFixed(5)}`;

  // Populate graph with edges from LineStrings
  network.features.forEach((feature: any) => {
    if (feature.geometry.type === 'LineString') {
      const coords = feature.geometry.coordinates as [number, number][];
      for (let i = 0; i < coords.length - 1; i++) {
        const u = coords[i];
        const v = coords[i+1];
        const uKey = getKey(u);
        const vKey = getKey(v);
        
        nodeCoords.set(uKey, u);
        nodeCoords.set(vKey, v);

        if (!graph.has(uKey)) graph.set(uKey, []);
        if (!graph.has(vKey)) graph.set(vKey, []);

        const dist = haversineDistance(u[0], u[1], v[0], v[1]);
        
        // Add flood penalty
        const uPenalty = riskMap.get(uKey) || 0;
        const vPenalty = riskMap.get(vKey) || 0;
        const edgeCost = dist + uPenalty + vPenalty;

        // Undirected graph
        graph.get(uKey)!.push({ to: vKey, cost: edgeCost, coords: v });
        graph.get(vKey)!.push({ to: uKey, cost: edgeCost, coords: u });
      }
    }
  });

  // Find nearest nodes in graph to the selected start and end
  let closestStartKey = "";
  let closestEndKey = "";
  let minDistStart = Infinity;
  let minDistEnd = Infinity;

  for (const [key, coords] of nodeCoords.entries()) {
    const dStart = haversineDistance(start[0], start[1], coords[0], coords[1]);
    const dEnd = haversineDistance(end[0], end[1], coords[0], coords[1]);
    if (dStart < minDistStart) { minDistStart = dStart; closestStartKey = key; }
    if (dEnd < minDistEnd) { minDistEnd = dEnd; closestEndKey = key; }
  }

  if (!closestStartKey || !closestEndKey) return null;

  // 2. Dijkstra's Algorithm
  const distances = new Map<string, number>();
  const previous = new Map<string, string>();
  const pq = new PriorityQueue<string>();

  for (const key of graph.keys()) {
    distances.set(key, Infinity);
  }
  distances.set(closestStartKey, 0);
  pq.enqueue(closestStartKey, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;
    const currentKey = current.element;

    if (currentKey === closestEndKey) break; // Reached target

    const neighbors = graph.get(currentKey) || [];
    for (const neighbor of neighbors) {
      const alt = (distances.get(currentKey) || Infinity) + neighbor.cost;
      if (alt < (distances.get(neighbor.to) || Infinity)) {
        distances.set(neighbor.to, alt);
        previous.set(neighbor.to, currentKey);
        pq.enqueue(neighbor.to, alt);
      }
    }
  }

  // 3. Reconstruct Path
  const path: [number, number][] = [];
  let curr = closestEndKey;
  if (previous.has(curr) || curr === closestStartKey) {
    while (curr) {
      path.unshift(nodeCoords.get(curr)!);
      curr = previous.get(curr)!;
    }
  }

  if (path.length === 0) return null;

  // Add the exact start and end points to make it look smooth
  path.unshift(start);
  path.push(end);

  return {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: path
    },
    properties: {
      type: 'evacuation_route'
    }
  };
}
