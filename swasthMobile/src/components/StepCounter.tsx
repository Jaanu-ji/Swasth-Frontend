import { ArrowLeft, TrendingUp, Award, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StepCounterProps {
  onBack: () => void;
}

export function StepCounter({ onBack }: StepCounterProps) {
  const todaySteps = 8234;
  const goal = 10000;
  const progress = (todaySteps / goal) * 100;

  const weeklyData = [
    { day: 'Mon', steps: 7234 },
    { day: 'Tue', steps: 9123 },
    { day: 'Wed', steps: 8456 },
    { day: 'Thu', steps: 10234 },
    { day: 'Fri', steps: 8934 },
    { day: 'Sat', steps: 6789 },
    { day: 'Sun', steps: 8234 },
  ];

  const achievements = [
    { title: '5K Steps', icon: '🏃', completed: true },
    { title: '10K Steps', icon: '🎯', completed: false },
    { title: '15K Steps', icon: '🏆', completed: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-gray-900">Step Counter</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Today's Steps */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl p-8 mb-6 text-white">
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.2"
                  strokeWidth="12"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="white"
                  strokeWidth="12"
                  strokeDasharray={`${progress * 5.65} 565`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl mb-2">{todaySteps.toLocaleString()}</p>
                <p className="text-blue-100">steps</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-100 mb-1">Goal</p>
              <p className="text-2xl">{goal.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 mb-1">Remaining</p>
              <p className="text-2xl">{(goal - todaySteps).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="bg-green-100 rounded-full p-2 inline-flex mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-gray-900">2.8 km</p>
            <p className="text-gray-500">Distance</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="bg-orange-100 rounded-full p-2 inline-flex mb-2">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-gray-900">220</p>
            <p className="text-gray-500">Calories</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="bg-blue-100 rounded-full p-2 inline-flex mb-2">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-gray-900">5</p>
            <p className="text-gray-500">Streak</p>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="mb-4 text-gray-900">This Week</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="steps" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="mb-4 text-gray-900">Daily Goals</h2>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`rounded-2xl p-4 text-center ${
                  achievement.completed
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                    : 'bg-white text-gray-600'
                } shadow-sm`}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <p className={achievement.completed ? 'text-white' : 'text-gray-900'}>
                  {achievement.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
