// ✅ Medical History Model
import mongoose from 'mongoose';

const medicalHistorySchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, index: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', default: null },
    memberName: { type: String, default: 'Self' },

    // Personal Medical Information
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    height: { type: Number, default: null }, // in cm
    weight: { type: Number, default: null }, // in kg

    // Chronic Conditions
    chronicConditions: [
      {
        condition: { type: String, required: true },
        diagnosedDate: { type: Date, default: null },
        status: {
          type: String,
          enum: ['Active', 'Controlled', 'Resolved'],
          default: 'Active',
        },
        notes: { type: String, default: '' },
      },
    ],

    // Past Surgeries
    surgeries: [
      {
        surgeryName: { type: String, required: true },
        date: { type: Date, required: true },
        hospital: { type: String, default: '' },
        notes: { type: String, default: '' },
      },
    ],

    // Current Medications
    currentMedications: [
      {
        medicineName: { type: String, required: true },
        dosage: { type: String, default: '' },
        frequency: { type: String, default: '' },
        startedDate: { type: Date, default: Date.now },
        prescribedBy: { type: String, default: '' },
        notes: { type: String, default: '' },
      },
    ],

    // Allergies
    allergies: [
      {
        allergyType: {
          type: String,
          enum: ['Medicine', 'Food', 'Environmental', 'Other'],
          required: true,
        },
        allergen: { type: String, required: true },
        reaction: { type: String, default: '' },
        severity: {
          type: String,
          enum: ['Mild', 'Moderate', 'Severe'],
          default: 'Moderate',
        },
      },
    ],

    // Family Medical History
    familyHistory: [
      {
        relation: { type: String, required: true },
        condition: { type: String, required: true },
        ageAtDiagnosis: { type: Number, default: null },
        notes: { type: String, default: '' },
      },
    ],

    // Lifestyle Information
    lifestyle: {
      smoking: {
        type: String,
        enum: ['Never', 'Former', 'Current'],
        default: 'Never',
      },
      alcohol: {
        type: String,
        enum: ['Never', 'Occasional', 'Regular'],
        default: 'Never',
      },
      exerciseFrequency: {
        type: String,
        enum: ['None', 'Rarely', '1-2 times/week', '3-4 times/week', 'Daily'],
        default: 'None',
      },
      dietType: {
        type: String,
        enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Other'],
        default: 'Other',
      },
      sleepHours: { type: Number, default: 7 },
    },

    // Additional Information
    notes: { type: String, default: '' },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

medicalHistorySchema.index({ userEmail: 1, memberId: 1 });

export default mongoose.model('MedicalHistory', medicalHistorySchema);
