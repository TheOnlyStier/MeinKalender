import mongoose, { Schema, Document } from 'mongoose';

export interface TodoDoc extends Document {
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  deadline?: Date;
  status: 'inbox' | 'scheduled' | 'done';
  scheduledStart?: Date;
  scheduledEnd?: Date;
  completedAt?: Date;
}

const TodoSchema = new Schema<TodoDoc>(
  {
    title: { type: String, required: true },
    description: String,
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    estimatedMinutes: { type: Number, required: true, min: 5 },
    deadline: Date,
    status: { type: String, enum: ['inbox', 'scheduled', 'done'], default: 'inbox' },
    scheduledStart: Date,
    scheduledEnd: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

TodoSchema.index({ status: 1, priority: 1 });

export const Todo = mongoose.model<TodoDoc>('Todo', TodoSchema);
