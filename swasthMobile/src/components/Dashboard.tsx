import { Heart, Users, Apple, Dumbbell, TrendingUp, Bell, Shield, Sparkles, FileText, ChevronRight, Activity, Droplet } from 'lucide-react';
import type { Screen } from '../App';

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const quickStats = [
    { label: 'Heart Rate', value: '72', unit: 'bpm', icon: Heart, color: 'bg-rose-100 text-rose-600' },
    { label: 'Steps Today', value: '8,234', unit: 'steps', icon: Activity, color: 'bg-blue-100 text-blue-600' },
    { label: 'Water Intake', value: '6', unit: '/ 8 cups', icon: Droplet, color: 'bg-cyan-100 text-cyan-600' },
    { label: 'Calories', value: '1,450', unit: '/ 2000', icon: Apple, color: 'bg-green-100 text-green-600' },
  ];

  const mainFeatures = [
    { title: 'Health Tracker', icon: Heart, screen: 'health-tracker' as Screen, color: 'bg-rose-500' },
    { title: 'Family Profiles', icon: Users, screen: 'family-list' as Screen, color: 'bg-blue-500' },
    { title: 'Meal Planner', icon: Apple, screen: 'meal-planner' as Screen, color: 'bg-green-500' },
    { title: 'Fitness', icon: Dumbbell, screen: 'workouts' as Screen, color: 'bg-orange-500' },
    { title: 'Analytics', icon: TrendingUp, screen: 'analytics' as Screen, color: 'bg-purple-500' },
    { title: 'Reminders', icon: Bell, screen: 'reminders' as Screen, color: 'bg-yellow-500' },
  ];

  const extraFeatures = [
    { title: 'Emergency Card', icon: Shield, screen: 'emergency-card' as Screen },
    { title: 'AI Suggestions', icon: Sparkles, screen: 'ai-suggestions' as Screen },
    { title: 'Report Scanner', icon: FileText, screen: 'report-scanner' as Screen },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-3xl p-6 shadow-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-white mb-1">Good Morning</h1>
            <p className="text-blue-100">Sarah Johnson</p>
          </div>
          <button className="bg-white/20 p-3 rounded-full">
            <Bell className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`${stat.color} rounded-lg p-1.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-white/80">{stat.label}</span>
                </div>
                <div className="text-white">
                  <span className="text-2xl">{stat.value}</span>
                  <span className="text-sm ml-1 text-white/60">{stat.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Features */}
      <div className="p-6">
        <h2 className="mb-4 text-gray-900">Main Features</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {mainFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <button
                key={index}
                onClick={() => onNavigate(feature.screen)}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className={`${feature.color} rounded-xl p-3 mb-3 inline-flex`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-900">{feature.title}</p>
              </button>
            );
          })}
        </div>

        {/* Extra Features */}
        <h2 className="mb-4 text-gray-900">More Features</h2>
        <div className="space-y-3">
          {extraFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <button
                key={index}
                onClick={() => onNavigate(feature.screen)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 rounded-xl p-3">
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <span className="text-gray-900">{feature.title}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
