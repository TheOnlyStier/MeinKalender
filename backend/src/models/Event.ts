import mongoose, { Schema, Document } from 'mongoose';

export interface EventDoc extends Document {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  color?: string;
  isAllDay: boolean;
  source: 'manual' | 'google';
}

const EventSchema = new Schema<EventDoc>(
  {
    title: { type: String, required: true },
    description: String,
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    color: String,
    isAllDay: { type: Boolean, default: false },
    source: { type: String, enum: ['manual', 'google'], default: 'manual' },
  },
  { timestamps: true }
);

EventSchema.index({ start: 1, end: 1 });

export const Event = mongoose.model<EventDoc>('Event', EventSchema);
