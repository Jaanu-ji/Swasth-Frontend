// ✅ Workout Routes
import express from 'express';
import Workout from '../models/Workout.js';

const router = express.Router();

// Get all workouts for a user
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

    const workouts = await Workout.find(query)
      .sort({ date: -1 })
      .limit(100);
    res.json(workouts);
  } catch (error) {
    console.error('[Workouts] Error fetching:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get workouts by date
router.get('/:email/:date', async (req, res) => {
  try {
    const { email, date } = req.params;
    const { memberId } = req.query;
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      userEmail: email,
      date: { $gte: startOfDay, $lte: endOfDay },
    };

    // Filter by memberId if provided, otherwise get self (null)
    if (memberId) {
      query.memberId = memberId;
    } else {
      query.memberId = null;
    }

    const workouts = await Workout.find(query).sort({ date: -1 });

    res.json(workouts);
  } catch (error) {
    console.error('[Workouts] Error fetching by date:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new workout
router.post('/', async (req, res) => {
  try {
    const workout = new Workout(req.body);
    await workout.save();
    res.status(201).json(workout);
  } catch (error) {
    console.error('[Workouts] Error creating:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update workout
router.put('/:id', async (req, res) => {
  try {
    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json(workout);
  } catch (error) {
    console.error('[Workouts] Error updating:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete workout
router.delete('/:id', async (req, res) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('[Workouts] Error deleting:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get workout stats
router.get('/stats/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { memberId } = req.query;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const query = {
      userEmail: email,
      date: { $gte: thirtyDaysAgo },
    };

    // Filter by memberId if provided, otherwise get self (null)
    if (memberId) {
      query.memberId = memberId;
    } else {
      query.memberId = null;
    }

    const workouts = await Workout.find(query);

    const totalWorkouts = workouts.length;
    const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);

    const typeBreakdown = {};
    workouts.forEach(w => {
      typeBreakdown[w.workoutType] = (typeBreakdown[w.workoutType] || 0) + 1;
    });

    res.json({
      totalWorkouts,
      totalMinutes,
      totalCalories,
      avgMinutesPerWorkout: totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0,
      typeBreakdown,
    });
  } catch (error) {
    console.error('[Workouts] Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
