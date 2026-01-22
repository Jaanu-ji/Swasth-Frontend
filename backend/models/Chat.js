// ✅ Chat Model
import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  message: { type: String, required: true },
  reply: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);

