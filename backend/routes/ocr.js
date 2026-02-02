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

    const prompt = `You are a STRICT medical report validator and analyzer.

STEP 1 - VALIDATION (VERY STRICT):
Look at this image and determine:
1. Is this ACTUALLY a medical document? Valid examples ONLY:
   - Lab test reports (blood test, urine test, etc.)
   - X-ray/MRI/CT scan reports
   - Doctor prescriptions with medicines
   - Hospital discharge summaries
   - Medical bills with test details

2. INVALID examples (MUST reject these):
   - Selfies or photos of people
   - Food photos
   - Random objects or scenes
   - Screenshots of apps/websites
   - Documents without medical data (ID cards, bills, etc.)
   - Blurry images where text cannot be read
   - Photos of medicine boxes (without prescription)

STEP 2 - Return JSON:
{
  "isValidReport": false,
  "isImageClear": true,
  "errorMessage": "Ye medical report nahi hai. Aapne [describe what image shows] ki photo di hai. Please sirf medical test reports, prescriptions, ya lab results ki photo dalein."
}

OR if valid medical report:
{
  "isValidReport": true,
  "isImageClear": true,
  "reportType": "Blood Test / X-Ray / Prescription / Lab Report / Other",
  "summary": "Write a detailed 3-5 sentence summary in Hinglish explaining: 1) What type of report this is, 2) Key findings, 3) What patient should know. Example: 'Ye aapka Complete Blood Count (CBC) report hai. Hemoglobin 12.5 g/dL hai jo normal hai. White blood cells bhi normal range mein hain. Overall report theek hai, koi chinta ki baat nahi.'",
  "healthMetrics": [
    {
      "type": "hemoglobin" | "sugar" | "cholesterol" | "bloodPressure" | "other",
      "value": "actual value from report",
      "unit": "mg/dL, g/dL, etc.",
      "status": "normal" | "high" | "low",
      "explanation": "Hinglish explanation"
    }
  ],
  "concerns": ["List any health concerns in Hinglish - only if values are abnormal"],
  "recommendations": ["Practical recommendations in Hinglish based on report findings"],
  "overallStatus": "good" | "attention_needed" | "critical"
}

CRITICAL RULES:
1. BE VERY STRICT - When in doubt, set isValidReport=false
2. Random photos, selfies, food = ALWAYS isValidReport=false
3. If image is blurry and you cannot read ANY text = isImageClear=false
4. Only set isValidReport=true if you can clearly see medical test data or prescription
5. Summary should be detailed and helpful, not just "report analyzed"
6. Always respond in Hinglish (Hindi-English mix) for Indian users`;

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
