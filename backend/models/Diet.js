// ✅ Diet Model
import mongoose from 'mongoose';

const dietSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  plan: { type: String, required: true },
  calories: { type: Number },
  goal: { type: String },
}, { timestamps: true });

export default mongoose.model('Diet', dietSchema);

