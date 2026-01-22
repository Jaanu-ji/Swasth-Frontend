// ✅ Reminder Routes
import express from 'express';
import Reminder from '../models/Reminder.js';

const router = express.Router();

// Get all reminders for a user
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

    const reminders = await Reminder.find(query).sort({ time: 1 });
    res.json(reminders);
  } catch (error) {
    console.error('[Reminders] Error fetching:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get active reminders
router.get('/:email/active', async (req, res) => {
  try {
    const { memberId } = req.query;
    const query = {
      userEmail: req.params.email,
      enabled: true,
    };

    // Filter by memberId if provided, otherwise get self (null)
    if (memberId) {
      query.memberId = memberId;
    } else {
      query.memberId = null;
    }

    const reminders = await Reminder.find(query).sort({ time: 1 });
    res.json(reminders);
  } catch (error) {
    console.error('[Reminders] Error fetching active:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new reminder
router.post('/', async (req, res) => {
  try {
    const reminder = new Reminder(req.body);
    await reminder.save();
    res.status(201).json(reminder);
  } catch (error) {
    console.error('[Reminders] Error creating:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update reminder
router.put('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json(reminder);
  } catch (error) {
    console.error('[Reminders] Error updating:', error);
    res.status(500).json({ error: error.message });
  }
});

// Toggle reminder enabled status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    reminder.enabled = !reminder.enabled;
    reminder.updatedAt = Date.now();
    await reminder.save();
    res.json(reminder);
  } catch (error) {
    console.error('[Reminders] Error toggling:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete reminder
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('[Reminders] Error deleting:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark reminder as triggered
router.post('/:id/trigger', async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { lastTriggered: Date.now(), updatedAt: Date.now() },
      { new: true }
    );
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json(reminder);
  } catch (error) {
    console.error('[Reminders] Error marking trigger:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
