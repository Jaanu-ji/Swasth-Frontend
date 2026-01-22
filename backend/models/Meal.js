import mongoose from 'mongoose';

const MealSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, index: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', default: null },
    memberName: { type: String, default: 'Self' },
    date: { type: String, required: true }, // YYYY-MM-DD
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'snack', 'dinner'],
      required: true,
    },
    name: { type: String, required: true },
    calories: { type: Number, default: null },
    time: { type: String, default: '' },
  },
  { timestamps: true }
);

const Meal = mongoose.model('Meal', MealSchema);
export default Meal;
