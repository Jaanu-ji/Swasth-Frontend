// ✅ Vaccination Routes
import express from 'express';
import Vaccination from '../models/Vaccination.js';

const router = express.Router();

// Get all vaccinations for a user
router.get('/:email', async (req, res) => {
  try {
    const vaccinations = await Vaccination.find({ userEmail: req.params.email })
      .sort({ date: -1 });
    res.json(vaccinations);
  } catch (error) {
    console.error('[Vaccinations] Error fetching:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get vaccinations by member
router.get('/:email/member/:memberId', async (req, res) => {
  try {
    const { email, memberId } = req.params;
    const vaccinations = await Vaccination.find({
      userEmail: email,
      memberId: memberId === 'self' ? null : memberId,
    }).sort({ date: -1 });
    res.json(vaccinations);
  } catch (error) {
    console.error('[Vaccinations] Error fetching by member:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new vaccination
router.post('/', async (req, res) => {
  try {
    // Auto-update status based on dates
    const vaccination = new Vaccination(req.body);

    if (vaccination.nextDueDate) {
      const now = new Date();
      if (vaccination.nextDueDate < now) {
        vaccination.status = 'Overdue';
      } else if (vaccination.nextDueDate > now && vaccination.date < now) {
        vaccination.status = 'Completed';
      } else {
        vaccination.status = 'Scheduled';
      }
    }

    await vaccination.save();
    res.status(201).json(vaccination);
  } catch (error) {
    console.error('[Vaccinations] Error creating:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update vaccination
router.put('/:id', async (req, res) => {
  try {
    const vaccination = await Vaccination.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!vaccination) {
      return res.status(404).json({ error: 'Vaccination not found' });
    }
    res.json(vaccination);
  } catch (error) {
    console.error('[Vaccinations] Error updating:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete vaccination
router.delete('/:id', async (req, res) => {
  try {
    const vaccination = await Vaccination.findByIdAndDelete(req.params.id);
    if (!vaccination) {
      return res.status(404).json({ error: 'Vaccination not found' });
    }
    res.json({ message: 'Vaccination deleted successfully' });
  } catch (error) {
    console.error('[Vaccinations] Error deleting:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming vaccinations
router.get('/:email/upcoming', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const upcoming = await Vaccination.find({
      userEmail: req.params.email,
      nextDueDate: { $gte: now, $lte: thirtyDaysLater },
      status: { $in: ['Scheduled', 'Overdue'] },
    }).sort({ nextDueDate: 1 });

    res.json(upcoming);
  } catch (error) {
    console.error('[Vaccinations] Error fetching upcoming:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
