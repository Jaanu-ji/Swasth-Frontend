// ✅ AI Insights Routes
import express from 'express';
import axios from 'axios';
import User from '../models/User.js';
import Diet from '../models/Diet.js';
import HealthLog from '../models/HealthLog.js';

const router = express.Router();

// Get AI insights
router.get('/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const recentDiets = await Diet.find({ userEmail: req.params.email }).sort({ createdAt: -1 }).limit(5);
    const recentLogs = await HealthLog.find({ userEmail: req.params.email }).sort({ createdAt: -1 }).limit(10);

    // Generate insights based on actual user data
    const insights = [];
    const healthGoals = [];
    const personalizedTips = [];

    // Analyze health logs
    const heartRateLogs = recentLogs.filter(log => log.type === 'heartRate');
    const bpLogs = recentLogs.filter(log => log.type === 'bloodPressure');
    const weightLogs = recentLogs.filter(log => log.type === 'weight');
    const sugarLogs = recentLogs.filter(log => log.type === 'sugar');

    // Heart Rate Insights
    if (heartRateLogs.length > 0) {
      const avgHR = heartRateLogs.reduce((sum, log) => sum + parseFloat(log.value), 0) / heartRateLogs.length;
      if (avgHR > 100) {
        insights.push({
          category: 'Heart Health',
          priority: 'high',
          title: 'Elevated Resting Heart Rate',
          description: `Your average heart rate is ${avgHR.toFixed(0)} bpm. Consider stress management and regular cardio exercise.`,
          action: 'Track More',
        });
      }
    }

    // Blood Pressure Insights
    if (bpLogs.length > 0) {
      const latestBP = bpLogs[0].value;
      const [systolic] = latestBP.split('/').map(v => parseInt(v));
      if (systolic > 140) {
        insights.push({
          category: 'Blood Pressure',
          priority: 'high',
          title: 'High Blood Pressure Detected',
          description: `Latest reading: ${latestBP} mmHg. Reduce sodium intake and consult your doctor.`,
          action: 'View Tips',
        });
      }
    }

    // Weight Management
    if (weightLogs.length >= 2) {
      const currentWeight = parseFloat(weightLogs[0].value);
      const previousWeight = parseFloat(weightLogs[1].value);
      const diff = currentWeight - previousWeight;

      if (Math.abs(diff) > 0.5) {
        const direction = diff > 0 ? 'gained' : 'lost';
        healthGoals.push({
          goal: user.goal || 'Maintain Health',
          progress: weightLogs.length > 5 ? 60 : 30,
          tip: `You've ${direction} ${Math.abs(diff).toFixed(1)}kg recently. ${diff > 0 && user.goal === 'Lose' ? 'Review your calorie intake.' : 'Keep up the good work!'}`,
        });
      }
    }

    // Blood Sugar Insights
    if (sugarLogs.length > 0) {
      const avgSugar = sugarLogs.reduce((sum, log) => sum + parseFloat(log.value), 0) / sugarLogs.length;
      if (avgSugar > 140) {
        insights.push({
          category: 'Blood Sugar',
          priority: 'high',
          title: 'Elevated Blood Glucose',
          description: `Average: ${avgSugar.toFixed(0)} mg/dL. Monitor your carb intake and consult a doctor if persistent.`,
          action: 'Log More',
        });
      }
    }

    // General tips based on data availability
    if (recentLogs.length === 0) {
      personalizedTips.push('Start tracking your vitals regularly for personalized health insights');
    } else {
      personalizedTips.push(`You've logged ${recentLogs.length} health metrics recently. Great job staying consistent!`);
    }

    if (user.age && user.height && user.weight) {
      const bmi = user.weight / ((user.height / 100) ** 2);
      if (bmi < 18.5) {
        personalizedTips.push('Your BMI suggests you may be underweight. Consider increasing calorie intake with nutrient-dense foods.');
      } else if (bmi > 25) {
        personalizedTips.push('Your BMI suggests working on weight management. Focus on balanced meals and regular exercise.');
      }
    }

    // Fallback if no insights generated
    if (insights.length === 0) {
      insights.push({
        category: 'General',
        priority: 'medium',
        title: 'Keep Tracking Your Health',
        description: 'Log more vitals to get personalized health insights and recommendations.',
        action: 'Add Vitals',
      });
    }

    if (healthGoals.length === 0) {
      healthGoals.push({
        goal: user.goal || 'Stay Healthy',
        progress: 50,
        tip: 'Set specific health goals in your profile to track your progress effectively.',
      });
    }

    if (personalizedTips.length === 0) {
      personalizedTips.push('Drink 8 glasses of water daily for optimal health');
    }

    res.json({ insights, healthGoals, personalizedTips });
  } catch (error) {
    console.error('[Insights] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate insights
router.post('/generate/:email', async (req, res) => {
  try {
    // Same as GET, but can trigger AI generation
    const user = await User.findOne({ email: req.params.email });
    
    // Generate using AI if API key available
    if (process.env.OPENAI_API_KEY) {
      // AI generation logic here
    }
    
    res.json({ message: 'Insights generated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

