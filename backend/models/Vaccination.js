// ✅ Vaccination Model
import mongoose from 'mongoose';

const vaccinationSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', default: null },
  memberName: { type: String, default: 'Self' },
  vaccineName: { type: String, required: true },
  date: { type: Date, required: true },
  nextDueDate: { type: Date, default: null },
  provider: { type: String, default: '' },
  batchNumber: { type: String, default: '' },
  sideEffects: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['Completed', 'Scheduled', 'Overdue'], default: 'Completed' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

vaccinationSchema.index({ userEmail: 1, date: -1 });

export default mongoose.model('Vaccination', vaccinationSchema);
