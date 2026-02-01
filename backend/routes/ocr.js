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

    const prompt = `You are a medical report analyzer. First, determine if this image is:
1. A valid medical report/test result (blood test, X-ray, prescription, lab report, etc.)
2. Clear enough to read

Return a JSON object with these fields:
{
  "isValidReport": true/false (is this a medical report or test?),
  "isImageClear": true/false (is the image clear enough to read?),
  "errorMessage": "Only if isValidReport=false or isImageClear=false, explain what's wrong in simple Hindi-English mix",
  "reportType": "Blood Test / X-Ray / Prescription / Lab Report / Other",
  "summary": "A simple, easy-to-understand summary in Hindi-English mix (Hinglish) explaining what the report says. Use simple language that a common person can understand. Example: 'Aapka blood sugar level 120 mg/dL hai jo normal range mein hai. Cholesterol thoda high hai (220 mg/dL), diet mein oil kam karein.'",
  "healthMetrics": [
    {
      "type": "heartRate" | "bloodPressure" | "sugar" | "temperature" | "weight" | "cholesterol" | "hemoglobin" | "other",
      "value": "the measured value",
      "unit": "the unit (bpm, mmHg, mg/dL, etc.)",
      "status": "normal" | "high" | "low",
      "explanation": "Simple explanation in Hinglish what this means"
    }
  ],
  "concerns": ["List health concerns in simple Hinglish that common person can understand"],
  "recommendations": ["Simple recommendations in Hinglish for the patient"],
  "overallStatus": "good" | "attention_needed" | "critical",
  "confidence": 0.95 (a number between 0 and 1)
}

IMPORTANT RULES:
1. If the image is NOT a medical report (like selfie, random photo, food, etc.), set isValidReport=false and provide errorMessage
2. If the image is blurry or text is not readable, set isImageClear=false and provide errorMessage
3. Write summary and explanations in simple Hinglish (Hindi-English mix) so common people can understand
4. Only include healthMetrics that are actually visible in the report
5. Be accurate with status (normal/high/low) based on standard medical ranges
6. If you can't read something clearly, don't include it in healthMetrics`;

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
      max_tokens: 2000,
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

        // Step 3: Check if image is valid and clear
        if (aiAnalysis) {
          // Check if not a valid report
          if (aiAnalysis.isValidReport === false) {
            console.log('[OCR Background] Invalid report image detected');
            await OCRScan.findByIdAndUpdate(scan._id, {
              extractedText,
              extractedFields: { text: extractedText },
              aiAnalysis: aiAnalysis,
              status: 'invalid',
              error: aiAnalysis.errorMessage || 'Ye medical report nahi hai. Please sirf medical reports ya test results ki photo dalein.',
            });
            return;
          }

          // Check if image is unclear
          if (aiAnalysis.isImageClear === false) {
            console.log('[OCR Background] Unclear image detected');
            await OCRScan.findByIdAndUpdate(scan._id, {
              extractedText,
              extractedFields: { text: extractedText },
              aiAnalysis: aiAnalysis,
              status: 'unclear',
              error: aiAnalysis.errorMessage || 'Image clear nahi hai. Please dobara ek clear photo lein jisme text properly dikh raha ho.',
            });
            return;
          }
        }

        // Step 4: Auto-create health logs from metrics (only for valid reports)
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

        // Step 5: Update scan with results
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
      error: scan.error || null,
      extractedText: scan.extractedText || '',
      extractedFields: scan.extractedFields || {},
      aiAnalysis: scan.aiAnalysis || null,
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
