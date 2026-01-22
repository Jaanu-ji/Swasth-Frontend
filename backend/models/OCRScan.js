// ✅ OCR Scan Model
import mongoose from 'mongoose';

const ocrScanSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember' },
  memberName: { type: String, default: 'Self' },
  fileName: String,
  filePath: String,
  reportType: { type: String, default: 'General' },
  extractedText: String,
  extractedFields: mongoose.Schema.Types.Mixed,
  aiAnalysis: {
    summary: String,
    healthMetrics: [{
      type: String,
      value: String,
      unit: String,
      status: String,
    }],
    concerns: [String],
    recommendations: [String],
    confidence: Number,
  },
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
  error: String,
}, { timestamps: true });

export default mongoose.model('OCRScan', ocrScanSchema);

