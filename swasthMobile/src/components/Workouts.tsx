import { ArrowLeft, Dumbbell, Activity, Play, ChevronRight } from 'lucide-react';
import type { Screen } from '../App';

interface WorkoutsProps {
  onNavigate: (screen: Screen) => void;
  onBack: () => void;
}

export function Workouts({ onNavigate, onBack }: WorkoutsProps) {
  const stats = [
    { label: 'Steps Today', value: '8,234', icon: Activity, color: 'bg-blue-500' },
    { label: 'Active Minutes', value: '45', icon: Dumbbell, color: 'bg-orange-500' },
    { label: 'Calories Burned', value: '320', icon: Activity, color: 'bg-rose-500' },
  ];

  const workoutCategories = [
    {
      name: 'Step Counter',
      description: 'Track daily steps',
      icon: Activity,
      color: 'bg-blue-500',
      screen: 'step-counter' as Screen,
    },
    {
      name: 'Exercise Videos',
      description: 'Guided workouts',
      icon: Play,
      color: 'bg-purple-500',
      screen: 'exercise-videos' as Screen,
    },
  ];

  const recentWorkouts = [
    {
      name: 'Morning Run',
      duration: '30 min',
      calories: 280,
      time: 'Today, 7:00 AM',
      image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=300&fit=crop',
    },
    {
      name: 'Yoga Session',
      duration: '45 min',
      calories: 150,
      time: 'Yesterday, 6:30 PM',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
    },
    {
      name: 'Weight Training',
      duration: '60 min',
      calories: 400,
      time: 'Dec 10, 5:00 PM',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-gray-900">Fitness</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`${stat.color} rounded-2xl p-4 text-white`}>
                <Icon className="w-6 h-6 mb-2" />
                <p className="text-2xl mb-1">{stat.value}</p>
                <p className="text-white/80 text-sm">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Workout Categories */}
        <div className="mb-6">
          <h2 className="mb-4 text-gray-900">Quick Access</h2>
          <div className="space-y-3">
            {workoutCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <button
                  key={index}
                  onClick={() => onNavigate(category.screen)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`${category.color} rounded-xl p-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-gray-900">{category.name}</h3>
                      <p className="text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Workouts */}
        <div>
          <h2 className="mb-4 text-gray-900">Recent Workouts</h2>
          <div className="space-y-3">
            {recentWorkouts.map((workout, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="flex">
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={workout.image}
                      alt={workout.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="text-gray-900 mb-1">{workout.name}</h3>
                    <p className="text-gray-500 mb-2">{workout.time}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="text-blue-600">{workout.duration}</span>
                      <span className="text-rose-600">{workout.calories} cal</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
