import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import HealthDocument from '../models/HealthDocument.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadsDir = path.join(__dirname, '../uploads/health-documents');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Upload health document with multiple images
router.post('/upload', upload.array('images', 10), async (req, res) => {
  try {
    const { email, memberId, memberName, title, description, documentDate, category } = req.body;
    const files = req.files;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const images = files.map(file => ({
      fileName: file.originalname,
      filePath: file.path,
      uploadedAt: new Date()
    }));

    const document = await HealthDocument.create({
      userEmail: email,
      memberId: memberId || null,
      memberName: memberName || 'Self',
      title,
      description: description || '',
      documentDate: documentDate ? new Date(documentDate) : new Date(),
      images,
      category: category || 'Other'
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('[HealthDocuments] Upload error:', error);
    res.status(500).json({ message: 'Failed to upload document: ' + error.message });
  }
});

// Get all documents for user/member
router.get('/:email', async (req, res) => {
  try {
    const { memberId } = req.query;
    const query = { userEmail: req.params.email };

    if (memberId) {
      query.memberId = memberId;
    } else {
      query.memberId = null;
    }

    const documents = await HealthDocument.find(query)
      .sort({ documentDate: -1 })
      .limit(100);

    res.json(documents);
  } catch (error) {
    console.error('[HealthDocuments] Fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

// Get single document
router.get('/document/:id', async (req, res) => {
  try {
    const document = await HealthDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('[HealthDocuments] Fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch document' });
  }
});

// Update document
router.put('/:id', async (req, res) => {
  try {
    const { title, description, documentDate, category } = req.body;

    const document = await HealthDocument.findByIdAndUpdate(
      req.params.id,
      { title, description, documentDate, category },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Document updated', document });
  } catch (error) {
    console.error('[HealthDocuments] Update error:', error);
    res.status(500).json({ message: 'Failed to update document' });
  }
});

// Add more images to existing document
router.post('/:id/images', upload.array('images', 10), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const newImages = files.map(file => ({
      fileName: file.originalname,
      filePath: file.path,
      uploadedAt: new Date()
    }));

    const document = await HealthDocument.findByIdAndUpdate(
      req.params.id,
      { $push: { images: { $each: newImages } } },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({ message: 'Images added', document });
  } catch (error) {
    console.error('[HealthDocuments] Add images error:', error);
    res.status(500).json({ message: 'Failed to add images' });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const document = await HealthDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete image files
    for (const image of document.images) {
      if (fs.existsSync(image.filePath)) {
        fs.unlinkSync(image.filePath);
      }
    }

    await HealthDocument.findByIdAndDelete(req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('[HealthDocuments] Delete error:', error);
    res.status(500).json({ message: 'Failed to delete document' });
  }
});

// Delete single image from document
router.delete('/:id/images/:imageIndex', async (req, res) => {
  try {
    const document = await HealthDocument.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const imageIndex = parseInt(req.params.imageIndex);

    if (imageIndex < 0 || imageIndex >= document.images.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }

    const image = document.images[imageIndex];

    // Delete file
    if (fs.existsSync(image.filePath)) {
      fs.unlinkSync(image.filePath);
    }

    // Remove from array
    document.images.splice(imageIndex, 1);

    // If no images left, delete the document
    if (document.images.length === 0) {
      await HealthDocument.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Document deleted (no images remaining)' });
    }

    await document.save();

    res.json({ message: 'Image deleted', document });
  } catch (error) {
    console.error('[HealthDocuments] Delete image error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

export default router;
