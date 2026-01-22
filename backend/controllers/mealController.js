import Meal from '../models/Meal.js';

// Add a meal
export const addMeal = async (req, res) => {
  try {
    const { userEmail, type, name, calories, time, memberId, memberName } = req.body;

    if (!userEmail || !type || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['breakfast', 'lunch', 'snack', 'dinner'].includes(type)) {
      return res.status(400).json({ message: 'Invalid meal type' });
    }

    // Normalize calories to Number or null
    const cals = calories !== undefined && calories !== null ? Number(calories) : null;

    // Compute UTC date string for the meal based on server time
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(now.getUTCDate()).padStart(2, '0');
    const dateUTC = `${yyyy}-${mm}-${dd}`;

    const meal = new Meal({
      userEmail,
      memberId: memberId || null,
      memberName: memberName || 'Self',
      date: dateUTC,
      type,
      name,
      calories: cals ?? null,
      time: time || ''
    });
    const saved = await meal.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('addMeal error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get meals by date for a user
export const getMealsByDate = async (req, res) => {
  try {
    const { email, date } = req.params;
    const { memberId } = req.query; // Optional memberId filter
    if (!email || !date) return res.status(400).json({ message: 'Missing params' });

    // Treat date as UTC and query createdAt between start and end of that UTC day
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    // Build query - filter by memberId if provided
    const query = { userEmail: email, createdAt: { $gte: start, $lte: end } };
    if (memberId) {
      query.memberId = memberId;
    } else {
      // If no memberId, get self (null memberId)
      query.memberId = null;
    }

    const meals = await Meal.find(query).sort({ time: 1, createdAt: 1 });
    return res.json(meals);
  } catch (err) {
    console.error('getMealsByDate error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
