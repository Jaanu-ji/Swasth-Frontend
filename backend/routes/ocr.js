// ✅ OCR Routes (UPDATED WITH OPENAI VISION)
import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import OCRScan from '../models/OCRScan.js';
import HealthLog from '../models/HealthLog.js';
import Tesseract from 'tesseract.js';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                               MULTER SETUP                                 */
/* -------------------------------------------------------------------------- */

const uploadsDir = path.join(__dirname, '../uploads');

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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/* -------------------------------------------------------------------------- */
/*                         OPENAI VISION API HELPER                           */
/* -------------------------------------------------------------------------- */

// Lazy initialize OpenAI client to ensure env vars are loaded
let openai = null;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

async function analyzeReportWithAI(imagePath, reportType) {
  const openaiClient = getOpenAI();
  try {
    console.log('[OCR AI] Starting AI analysis for:', reportType);

    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const prompt = `Analyze this ${reportType} medical report. Extract all important health information and provide a structured analysis.

Return a JSON object with these fields:
{
  "summary": "A brief summary of the report (2-3 sentences)",
  "healthMetrics": [
    {
      "type": "heartRate" | "bloodPressure" | "sugar" | "temperature" | "weight" | "cholesterol" | "hemoglobin" | "other",
      "value": "the measured value",
      "unit": "the unit (bpm, mmHg, mg/dL, etc.)",
      "status": "normal" | "high" | "low"
    }
  ],
  "concerns": ["list of any health concerns or abnormalities found"],
  "recommendations": ["list of medical recommendations or next steps"],
  "confidence": 0.95 (a number between 0 and 1 indicating confidence in the analysis)
}

Important:
- For healthMetrics, use standard type names like "heartRate", "bloodPressure", "sugar", "temperature", "weight"
- Only include metrics that are actually present in the report
- Be accurate with the status (normal/high/low) based on standard medical ranges
- If you can't read something clearly, don't guess`;

    console.log('[OCR AI] Calling OpenAI API with model: gpt-4o');
    console.log('[OCR AI] Image size:', imageBuffer.length, 'bytes');

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      }],
      max_tokens: 1500,
      temperature: 0.3,
    });

    console.log('[OCR AI] OpenAI API call successful');
    const content = response.choices[0].message.content;
    console.log('[OCR AI] Raw response:', content);

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    console.log('[OCR AI] Parsed analysis:', JSON.stringify(analysis, null, 2));

    return analysis;
  } catch (error) {
    console.error('[OCR AI] Analysis failed:', error);
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                          UPLOAD + START OCR                                 */
/* -------------------------------------------------------------------------- */

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // DEBUG LOGS
    console.log('[OCR Upload] BODY:', req.body);
    console.log('[OCR Upload] FILE:', req.file);

    const { email, memberId, memberName, reportType } = req.body;
    const file = req.file;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    // 1️⃣ Save scan entry immediately
    const scan = await OCRScan.create({
      userEmail: email,
      memberId: memberId || null,
      memberName: memberName || 'Self',
      fileName: file.originalname,
      filePath: file.path,
      reportType: reportType || 'General',
      status: 'processing',
    });

    console.log('[OCR Upload] Scan created:', scan._id);

    // 2️⃣ Respond immediately (IMPORTANT)
    res.status(201).json({
      scanId: scan._id,
      status: 'processing',
    });

    // 3️⃣ Process OCR + AI in background
    (async () => {
      try {
        console.log('[OCR Background] Starting Tesseract OCR...');
        // Step 1: Tesseract OCR for text extraction
        const result = await Tesseract.recognize(file.path, 'eng');
        const extractedText = result.data.text;
        console.log('[OCR Background] Tesseract completed, text length:', extractedText.length);

        // Step 2: AI Analysis with OpenAI Vision
        console.log('[OCR Background] Starting AI analysis...');
        const aiAnalysis = await analyzeReportWithAI(file.path, reportType || 'General');

        // Step 3: Auto-create health logs from metrics
        if (aiAnalysis && aiAnalysis.healthMetrics && Array.isArray(aiAnalysis.healthMetrics)) {
          console.log('[OCR Background] Creating health logs from', aiAnalysis.healthMetrics.length, 'metrics');

          for (const metric of aiAnalysis.healthMetrics) {
            try {
              await HealthLog.create({
                userEmail: email,
                memberId: memberId || null,
                type: metric.type,
                value: metric.value,
                notes: `Auto-extracted from ${reportType || 'General'} report scan`,
              });
              console.log('[OCR Background] Created health log:', metric.type, metric.value);
            } catch (logError) {
              console.error('[OCR Background] Failed to create health log:', logError);
            }
          }
        }

        // Step 4: Update scan with results
        await OCRScan.findByIdAndUpdate(scan._id, {
          extractedText,
          extractedFields: {
            text: extractedText,
          },
          aiAnalysis: aiAnalysis || null,
          status: 'completed',
        });

        console.log('[OCR Background] Scan completed successfully:', scan._id);
      } catch (ocrError) {
        console.error('[OCR Background] Processing failed:', ocrError);

        await OCRScan.findByIdAndUpdate(scan._id, {
          status: 'failed',
          error: ocrError.message,
          extractedText: '',
          extractedFields: {},
        });
      }
    })();
  } catch (error) {
    console.error('[OCR Upload] Error:', error);
    res.status(500).json({ message: 'OCR upload failed: ' + error.message });
  }
});

/* -------------------------------------------------------------------------- */
/*                             GET OCR STATUS                                  */
/* -------------------------------------------------------------------------- */

router.get('/status/:scanId', async (req, res) => {
  try {
    const scan = await OCRScan.findById(req.params.scanId);

    if (!scan) {
      return res.status(404).json({ message: 'Scan not found' });
    }

    res.json({
      status: scan.status,
      extractedText: scan.extractedText || '',
      extractedFields: scan.extractedFields || {},
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch OCR status' });
  }
});

/* -------------------------------------------------------------------------- */
/*                            GET OCR HISTORY                                  */
/* -------------------------------------------------------------------------- */

router.get('/history/:email', async (req, res) => {
  try {
    const { memberId } = req.query;
    const query = { userEmail: req.params.email };

    // Filter by memberId if provided, otherwise get self (null)
    if (memberId) {
      query.memberId = memberId;
    } else {
      query.memberId = null;
    }

    const scans = await OCRScan.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(scans);
  } catch (error) {
    console.error('[OCR] Error fetching history:', error);
    res.status(500).json({ message: 'Failed to fetch OCR history' });
  }
});

export default router;
