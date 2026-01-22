// ✅ Health Log Model
import mongoose from 'mongoose';

const healthLogSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, index: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' },
    // Extended enum to cover all vitals used in the frontend
    type: {
      type: String,
      enum: [
        'weight',
        'height',
        'bmi',
        'bloodPressure',
        'sugar',
        'water',
        'symptoms',
        'heartRate',
        'temperature',
      ],
      required: true,
    },
    value: mongoose.Schema.Types.Mixed,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('HealthLog', healthLogSchema);

