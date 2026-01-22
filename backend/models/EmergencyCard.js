// ✅ Emergency Card Model
import mongoose from 'mongoose';

const emergencyCardSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true, index: true },
  personalInfo: {
    name: String,
    age: Number,
    bloodType: String,
    height: String,
    weight: String,
    photo: String,
  },
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
  }],
  medicalInfo: {
    allergies: [String],
    conditions: [String],
    medications: [String],
  },
}, { timestamps: true });

export default mongoose.model('EmergencyCard', emergencyCardSchema);

