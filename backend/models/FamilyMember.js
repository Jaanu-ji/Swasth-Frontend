// ✅ Family Member Model
import mongoose from 'mongoose';

const familyMemberSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  age: Number,
  gender: String,
  height: Number,
  weight: Number,
  allergies: [String],
  diseases: [String],
  medications: [String],
  vaccinations: [{
    name: String,
    date: Date,
    nextDue: Date,
  }],
}, { timestamps: true });

export default mongoose.model('FamilyMember', familyMemberSchema);

