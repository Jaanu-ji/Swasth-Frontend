// ✅ User Model
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  height: { type: Number },
  weight: { type: Number },
  goal: { type: String, enum: ['Lose', 'Maintain', 'Gain'], default: 'Maintain' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);

