// ✅ Diet Routes
import express from 'express';
import axios from 'axios';
import Diet from '../models/Diet.js';
import User from '../models/User.js';

const router = express.Router();

// Generate diet plan
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const prompt = `Create a daily diet plan for a ${user.age || 30}-year-old ${user.gender || 'person'} weighing ${user.weight || 70}kg, height ${user.height || 170}cm, goal: ${user.goal || 'Maintain'}. Include breakfast, lunch, dinner, and snacks with calorie counts.`;
    
    let plan = '';
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 500,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
        plan = response.data.choices[0]?.message?.content || '';
      } catch (error) {
        console.error('OpenAI error:', error);
      }
    }
    
    if (!plan) {
      plan = `Daily Diet Plan for ${user.name}:\n\nBreakfast: Oatmeal with berries (320 cal)\nLunch: Grilled chicken salad (450 cal)\nSnack: Greek yogurt & almonds (180 cal)\nDinner: Salmon with vegetables (520 cal)\n\nTotal: 1470 calories`;
    }
    
    const calories = 1470;
    
    const diet = new Diet({ userEmail: email, plan, calories, goal: user.goal });
    await diet.save();
    
    res.json({ plan, calories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get diet history
router.get('/history/:email', async (req, res) => {
  try {
    const diets = await Diet.find({ userEmail: req.params.email })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(diets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

