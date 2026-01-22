import express from 'express';
import { addMeal, getMealsByDate } from '../controllers/mealController.js';

const router = express.Router();

// POST /api/meals
router.post('/', addMeal);

// GET /api/meals/:email/:date
router.get('/:email/:date', getMealsByDate);

export default router;
