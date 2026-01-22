import { ArrowLeft, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface HealthAnalyticsProps {
  onBack: () => void;
}

export function HealthAnalytics({ onBack }: HealthAnalyticsProps) {
  const overallHealthData = [
    { month: 'Jul', score: 75 },
    { month: 'Aug', score: 78 },
    { month: 'Sep', score: 82 },
    { month: 'Oct', score: 85 },
    { month: 'Nov', score: 88 },
    { month: 'Dec', score: 90 },
  ];

  const activityData = [
    { date: 'Dec 6', steps: 7234, calories: 280, water: 6 },
    { date: 'Dec 7', steps: 9123, calories: 350, water: 7 },
    { date: 'Dec 8', steps: 8456, calories: 320, water: 8 },
    { date: 'Dec 9', steps: 10234, calories: 410, water: 7 },
    { date: 'Dec 10', steps: 8934, calories: 340, water: 8 },
    { date: 'Dec 11', steps: 6789, calories: 260, water: 6 },
    { date: 'Dec 12', steps: 8234, calories: 310, water: 6 },
  ];

  const healthRadarData = [
    { category: 'Fitness', value: 85 },
    { category: 'Nutrition', value: 78 },
    { category: 'Sleep', value: 72 },
    { category: 'Mental Health', value: 88 },
    { category: 'Hydration', value: 75 },
    { category: 'Vitals', value: 92 },
  ];

  const insights = [
    {
      title: 'Heart Rate Improving',
      description: 'Your average heart rate has decreased by 5 bpm this month',
      trend: 'positive',
      change: '-5 bpm',
    },
    {
      title: 'Weight Goal Progress',
      description: 'You\'re 40% towards your weight goal',
      trend: 'positive',
      change: '-1.2 kg',
    },
    {
      title: 'Activity Streak',
      description: 'Keep it up! 7-day streak of meeting step goals',
      trend: 'positive',
      change: '7 days',
    },
  ];

  const handleDownload = () => {
    alert('Health report will be downloaded');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-gray-900">Health Analytics</h1>
          </div>
          <button
            onClick={handleDownload}
            className="bg-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-purple-600"
          >
            <Download className="w-4 h-4" />
            Report
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overall Health Score */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <h2 className="text-white mb-2">Overall Health Score</h2>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-5xl">90</span>
            <span className="text-purple-100 mb-2">/ 100</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <span>+5 points from last month</span>
          </div>
        </div>

        {/* Health Score Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-gray-900 mb-4">Health Score Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={overallHealthData}>
              <defs>
                <linearGradient id="healthScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[60, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#8b5cf6" fillOpacity={1} fill="url(#healthScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-gray-900 mb-4">Activity Trends</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Line type="monotone" dataKey="steps" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Health Radar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-gray-900 mb-4">Health Balance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={healthRadarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="category" stroke="#6b7280" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
              <Radar name="Health" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Key Insights */}
        <div>
          <h2 className="mb-4 text-gray-900">Key Insights</h2>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-gray-900">{insight.title}</h3>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">{insight.change}</span>
                  </div>
                </div>
                <p className="text-gray-600">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Download Report */}
        <button
          onClick={handleDownload}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download Full Health Report
        </button>
      </div>
    </div>
  );
}
