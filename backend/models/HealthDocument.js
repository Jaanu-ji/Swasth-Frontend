import mongoose from 'mongoose';

const healthDocumentSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', default: null },
  memberName: { type: String, default: 'Self' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  documentDate: { type: Date, required: true },
  images: [{
    fileName: String,
    filePath: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  category: {
    type: String,
    enum: ['Prescription', 'Lab Report', 'X-Ray', 'MRI/CT Scan', 'Bill/Invoice', 'Discharge Summary', 'Other'],
    default: 'Other'
  },
}, { timestamps: true });

healthDocumentSchema.index({ userEmail: 1, documentDate: -1 });
healthDocumentSchema.index({ userEmail: 1, memberId: 1 });

export default mongoose.model('HealthDocument', healthDocumentSchema);
