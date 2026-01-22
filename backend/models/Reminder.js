// ✅ Reminder Model
import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', default: null },
  memberName: { type: String, default: 'Self' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: {
    type: String,
    enum: ['Medication', 'Appointment', 'Exercise', 'Water', 'Custom'],
    default: 'Custom'
  },
  time: { type: String, required: true }, // Format: "HH:MM"
  frequency: {
    type: String,
    enum: ['Once', 'Daily', 'Weekly', 'Monthly'],
    default: 'Daily'
  },
  daysOfWeek: [{ type: Number, min: 0, max: 6 }], // 0=Sunday, 6=Saturday (for Weekly)
  enabled: { type: Boolean, default: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null },
  lastTriggered: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

reminderSchema.index({ userEmail: 1, enabled: 1, time: 1 });

export default mongoose.model('Reminder', reminderSchema);
