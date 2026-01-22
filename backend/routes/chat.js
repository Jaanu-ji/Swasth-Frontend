// ✅ Chat Routes
import express from 'express';
import axios from 'axios';
import Chat from '../models/Chat.js';

const router = express.Router();

// Chat with AI
router.post('/', async (req, res) => {
  try {
    const { email, message } = req.body;
    
    if (!process.env.OPENAI_API_KEY) {
      return res.json({ reply: 'I am an AI health assistant. How can I help you today? (OpenAI API key not configured)' });
    }
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const reply = response.data.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
    
    // Save to database
    const chat = new Chat({ userEmail: email, message, reply });
    await chat.save();
    
    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.json({ reply: 'I apologize, there was an error. Please try again.' });
  }
});

// Get chat history
router.get('/history/:email', async (req, res) => {
  try {
    const chats = await Chat.find({ userEmail: req.params.email })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

