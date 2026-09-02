import mongoose, { Document, Schema } from 'mongoose';

export interface IDrainageEdge extends Document {
  drain_id: string;
  capacity: number;
  geometry: {
    type: 'LineString';
    coordinates: number[][];
  };
}

const DrainageEdgeSchema = new Schema<IDrainageEdge>({
  drain_id: { type: String, required: true },
  capacity: { type: Number, required: true },
  geometry: {
    type: {
      type: String,
      enum: ['LineString'],
      required: true,
    },
    coordinates: {
      type: [[Number]], // Array of [longitude, latitude] arrays
      required: true,
    },
  },
});

DrainageEdgeSchema.index({ geometry: '2dsphere' });

export default mongoose.models.DrainageEdge || mongoose.model<IDrainageEdge>('DrainageEdge', DrainageEdgeSchema);
