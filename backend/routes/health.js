// ✅ Health Log Routes
import express from 'express';
import HealthLog from '../models/HealthLog.js';

const router = express.Router();

// Get health logs
router.get('/:email', async (req, res) => {
  try {
    const { memberId } = req.query;
    const query = { userEmail: req.params.email };

    // Filter by memberId if provided, otherwise get self (null)
    if (memberId) {
      query.memberId = memberId;
    } else {
      query.memberId = null;
    }

    const logs = await HealthLog.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add health log
router.post('/', async (req, res) => {
  console.log("🔥 HEALTH POST HIT");
  console.log("BODY 👉", req.body);
  try {
    const { userEmail, memberId, type, value, notes } = req.body;
    
    if (!userEmail || !type || value === undefined || value === null) {
      return res.status(400).json({ error: 'userEmail, type, and value are required' });
    }
    
    const log = new HealthLog({
      userEmail,
      memberId,
      type,
      value,
      notes,
    });
    
    await log.save();
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete last water log for a user
router.delete('/water/last/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { memberId } = req.query;
    if (!email) return res.status(400).json({ error: 'email required' });

    // UTC-safe: only delete the most recent water log created today
    const startOfTodayUTC = new Date();
    startOfTodayUTC.setUTCHours(0, 0, 0, 0);
    const endOfTodayUTC = new Date();
    endOfTodayUTC.setUTCHours(23, 59, 59, 999);

    const query = {
      userEmail: email,
      type: 'water',
      createdAt: { $gte: startOfTodayUTC, $lte: endOfTodayUTC },
    };

    // Filter by memberId if provided, otherwise get self (null)
    if (memberId) {
      query.memberId = memberId;
    } else {
      query.memberId = null;
    }

    const last = await HealthLog.findOne(query).sort({ createdAt: -1 });

    if (!last) return res.status(404).json({ error: 'No water logs found for today' });

    await HealthLog.deleteOne({ _id: last._id });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

