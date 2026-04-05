import mongoose, { Schema, Document } from 'mongoose';

export interface TagDoc extends Document {
  name: string;
  aliases: string[]; // Alternative Namen (z.B. "Gym" → ["Fitness", "Training", "Fitnessstudio"])
  color: string;
  defaultMinutes: number;
  category: 'sport' | 'arbeit' | 'persönlich' | 'gesundheit' | 'sonstiges';
  usageCount: number; // Wie oft benutzt → für Ranking
}

const TagSchema = new Schema<TagDoc>(
  {
    name: { type: String, required: true, unique: true },
    aliases: [{ type: String }],
    color: { type: String, required: true },
    defaultMinutes: { type: Number, default: 60 },
    category: {
      type: String,
      enum: ['sport', 'arbeit', 'persönlich', 'gesundheit', 'sonstiges'],
      default: 'sonstiges',
    },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Tag = mongoose.model<TagDoc>('Tag', TagSchema);
