// ✅ Workout Model
import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', default: null },
  memberName: { type: String, default: 'Self' },
  workoutType: { type: String, required: true }, // 'Cardio', 'Strength', 'Flexibility', 'Sports'
  title: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  calories: { type: Number, default: 0 },
  intensity: { type: String, enum: ['Low', 'Moderate', 'High'], default: 'Moderate' },
  notes: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

workoutSchema.index({ userEmail: 1, date: -1 });

export default mongoose.model('Workout', workoutSchema);
