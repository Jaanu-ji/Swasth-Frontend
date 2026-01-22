// ✅ Medical History Routes
import express from 'express';
import MedicalHistory from '../models/MedicalHistory.js';

const router = express.Router();

// Get medical history for a user (or specific family member)
router.get('/:email', async (req, res) => {
  try {
    const { memberId } = req.query;
    const query = { userEmail: req.params.email };

    if (memberId) {
      query.memberId = memberId;
    }

    const history = await MedicalHistory.findOne(query);

    if (!history) {
      // Return empty template if not found
      return res.json({
        userEmail: req.params.email,
        bloodGroup: 'Unknown',
        chronicConditions: [],
        surgeries: [],
        currentMedications: [],
        allergies: [],
        familyHistory: [],
        lifestyle: {
          smoking: 'Never',
          alcohol: 'Never',
          exerciseFrequency: 'None',
          dietType: 'Other',
          sleepHours: 7,
        },
        notes: '',
      });
    }

    res.json(history);
  } catch (error) {
    console.error('[MedicalHistory] Error fetching:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update medical history
router.post('/', async (req, res) => {
  try {
    const { userEmail, memberId } = req.body;
    const query = { userEmail };

    if (memberId) {
      query.memberId = memberId;
    }

    // Update or create
    const history = await MedicalHistory.findOneAndUpdate(
      query,
      { ...req.body, lastUpdated: Date.now() },
      { new: true, upsert: true }
    );

    res.json(history);
  } catch (error) {
    console.error('[MedicalHistory] Error saving:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add chronic condition
router.post('/:email/chronic-condition', async (req, res) => {
  try {
    const { memberId, condition, diagnosedDate, status, notes } = req.body;
    const query = { userEmail: req.params.email };

    if (memberId) {
      query.memberId = memberId;
    }

    const history = await MedicalHistory.findOneAndUpdate(
      query,
      {
        $push: {
          chronicConditions: {
            condition,
            diagnosedDate,
            status,
            notes,
          },
        },
        $set: { lastUpdated: Date.now() },
      },
      { new: true, upsert: true }
    );

    res.json(history);
  } catch (error) {
    console.error('[MedicalHistory] Error adding chronic condition:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add surgery
router.post('/:email/surgery', async (req, res) => {
  try {
    const { memberId, surgeryName, date, hospital, notes } = req.body;
    const query = { userEmail: req.params.email };

    if (memberId) {
      query.memberId = memberId;
    }

    const history = await MedicalHistory.findOneAndUpdate(
      query,
      {
        $push: {
          surgeries: {
            surgeryName,
            date,
            hospital,
            notes,
          },
        },
        $set: { lastUpdated: Date.now() },
      },
      { new: true, upsert: true }
    );

    res.json(history);
  } catch (error) {
    console.error('[MedicalHistory] Error adding surgery:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add medication
router.post('/:email/medication', async (req, res) => {
  try {
    const { memberId, medicineName, dosage, frequency, startedDate, prescribedBy, notes } = req.body;
    const query = { userEmail: req.params.email };

    if (memberId) {
      query.memberId = memberId;
    }

    const history = await MedicalHistory.findOneAndUpdate(
      query,
      {
        $push: {
          currentMedications: {
            medicineName,
            dosage,
            frequency,
            startedDate,
            prescribedBy,
            notes,
          },
        },
        $set: { lastUpdated: Date.now() },
      },
      { new: true, upsert: true }
    );

    res.json(history);
  } catch (error) {
    console.error('[MedicalHistory] Error adding medication:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add allergy
router.post('/:email/allergy', async (req, res) => {
  try {
    const { memberId, allergyType, allergen, reaction, severity } = req.body;
    const query = { userEmail: req.params.email };

    if (memberId) {
      query.memberId = memberId;
    }

    const history = await MedicalHistory.findOneAndUpdate(
      query,
      {
        $push: {
          allergies: {
            allergyType,
            allergen,
            reaction,
            severity,
          },
        },
        $set: { lastUpdated: Date.now() },
      },
      { new: true, upsert: true }
    );

    res.json(history);
  } catch (error) {
    console.error('[MedicalHistory] Error adding allergy:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add family history
router.post('/:email/family-history', async (req, res) => {
  try {
    const { memberId, relation, condition, ageAtDiagnosis, notes } = req.body;
    const query = { userEmail: req.params.email };

    if (memberId) {
      query.memberId = memberId;
    }

    const history = await MedicalHistory.findOneAndUpdate(
      query,
      {
        $push: {
          familyHistory: {
            relation,
            condition,
            ageAtDiagnosis,
            notes,
          },
        },
        $set: { lastUpdated: Date.now() },
      },
      { new: true, upsert: true }
    );

    res.json(history);
  } catch (error) {
    console.error('[MedicalHistory] Error adding family history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update lifestyle
router.put('/:email/lifestyle', async (req, res) => {
  try {
    const { memberId, lifestyle } = req.body;
    const query = { userEmail: req.params.email };

    if (memberId) {
      query.memberId = memberId;
    }

    const history = await MedicalHistory.findOneAndUpdate(
      query,
      {
        $set: {
          lifestyle,
          lastUpdated: Date.now(),
        },
      },
      { new: true, upsert: true }
    );

    res.json(history);
  } catch (error) {
    console.error('[MedicalHistory] Error updating lifestyle:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete item from array (chronic condition, surgery, medication, allergy, family history)
router.delete('/:email/:category/:itemId', async (req, res) => {
  try {
    const { email, category, itemId } = req.params;
    const { memberId } = req.query;
    const query = { userEmail: email };

    if (memberId) {
      query.memberId = memberId;
    }

    const updateField = `${category}._id`;
    const history = await MedicalHistory.findOneAndUpdate(
      query,
      {
        $pull: { [category]: { _id: itemId } },
        $set: { lastUpdated: Date.now() },
      },
      { new: true }
    );

    res.json(history);
  } catch (error) {
    console.error('[MedicalHistory] Error deleting item:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
