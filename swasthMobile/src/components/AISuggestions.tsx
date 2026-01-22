import { ArrowLeft, Sparkles, TrendingUp, Heart, Apple, Dumbbell, Moon, Droplet } from 'lucide-react';

interface AISuggestionsProps {
  onBack: () => void;
}

export function AISuggestions({ onBack }: AISuggestionsProps) {
  const insights = [
    {
      category: 'Fitness',
      icon: Dumbbell,
      color: 'bg-orange-500',
      priority: 'high',
      title: 'Increase Daily Activity',
      description: 'You\'ve been 2,000 steps below your goal this week. Try a 15-minute walk after lunch.',
      action: 'Set Reminder',
    },
    {
      category: 'Nutrition',
      icon: Apple,
      color: 'bg-green-500',
      priority: 'medium',
      title: 'Boost Protein Intake',
      description: 'Your protein consumption is 20% below recommended. Add eggs or Greek yogurt to breakfast.',
      action: 'View Recipes',
    },
    {
      category: 'Hydration',
      icon: Droplet,
      color: 'bg-cyan-500',
      priority: 'high',
      title: 'Drink More Water',
      description: 'You\'re averaging 5 cups daily. Aim for 8 cups to improve energy and digestion.',
      action: 'Track Water',
    },
    {
      category: 'Sleep',
      icon: Moon,
      color: 'bg-indigo-500',
      priority: 'medium',
      title: 'Improve Sleep Schedule',
      description: 'Your bedtime varies by 2+ hours. A consistent schedule improves sleep quality.',
      action: 'Set Bedtime',
    },
  ];

  const healthGoals = [
    {
      goal: 'Lose 3kg by January',
      progress: 40,
      tip: 'You\'re on track! Continue your current calorie deficit and add 2 more workout sessions per week.',
      icon: TrendingUp,
    },
    {
      goal: 'Lower Blood Pressure',
      progress: 65,
      tip: 'Great progress! Reduce sodium intake to under 2,000mg daily and maintain regular exercise.',
      icon: Heart,
    },
  ];

  const personalizedTips = [
    'Based on your activity, the best time for your workout is 7-9 AM',
    'You tend to skip breakfast on Mondays - try meal prepping on Sundays',
    'Your water intake drops significantly on busy days - set hourly reminders',
    'You sleep better when you exercise before 6 PM',
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-gray-900">AI Suggestions</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 rounded-full p-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white mb-1">Personalized Insights</h2>
              <p className="text-purple-100">Based on your health data</p>
            </div>
          </div>
          <p className="text-white/90">
            Our AI has analyzed your health patterns and created personalized recommendations to help you achieve your goals.
          </p>
        </div>

        {/* Priority Suggestions */}
        <div className="mb-6">
          <h2 className="mb-4 text-gray-900">Priority Recommendations</h2>
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-4 mb-3">
                    <div className={`${insight.color} rounded-xl p-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-gray-900">{insight.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(insight.priority)}`}>
                          {insight.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{insight.description}</p>
                      <button className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors">
                        {insight.action}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goal Progress */}
        <div className="mb-6">
          <h2 className="mb-4 text-gray-900">Goal Insights</h2>
          <div className="space-y-3">
            {healthGoals.map((goal, index) => {
              const Icon = goal.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-1">{goal.goal}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{goal.progress}%</span>
                      </div>
                      <p className="text-gray-600">{goal.tip}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Personalized Tips */}
        <div>
          <h2 className="mb-4 text-gray-900">Personalized Tips</h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="space-y-3">
              {personalizedTips.map((tip, index) => (
                <div key={index} className="flex gap-3">
                  <div className="bg-purple-100 rounded-full p-1 h-fit mt-1">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                  </div>
                  <p className="text-gray-700 flex-1">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
