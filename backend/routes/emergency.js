// ✅ Emergency Card Routes
import express from 'express';
import EmergencyCard from '../models/EmergencyCard.js';

const router = express.Router();

// Get emergency card
router.get('/:email', async (req, res) => {
  try {
    const card = await EmergencyCard.findOne({ userEmail: req.params.email });
    res.json(card || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update emergency card
router.post('/', async (req, res) => {
  try {
    const { email, personalInfo, emergencyContacts, medicalInfo } = req.body;
    
    const card = await EmergencyCard.findOneAndUpdate(
      { userEmail: email },
      { userEmail: email, personalInfo, emergencyContacts, medicalInfo },
      { new: true, upsert: true }
    );
    
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

