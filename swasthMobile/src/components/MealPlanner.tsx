import { ArrowLeft, Plus, ChevronRight, Utensils, Apple, Coffee, Moon } from 'lucide-react';
import type { Screen } from '../App';

interface MealPlannerProps {
  onNavigate: (screen: Screen) => void;
  onBack: () => void;
}

export function MealPlanner({ onNavigate, onBack }: MealPlannerProps) {
  const todaysMeals = [
    {
      type: 'Breakfast',
      icon: Coffee,
      time: '8:00 AM',
      meal: 'Oatmeal with berries',
      calories: 320,
      color: 'bg-amber-500',
    },
    {
      type: 'Lunch',
      icon: Utensils,
      time: '1:00 PM',
      meal: 'Grilled chicken salad',
      calories: 450,
      color: 'bg-green-500',
    },
    {
      type: 'Snack',
      icon: Apple,
      time: '4:00 PM',
      meal: 'Greek yogurt & almonds',
      calories: 180,
      color: 'bg-orange-500',
    },
    {
      type: 'Dinner',
      icon: Moon,
      time: '7:00 PM',
      meal: 'Salmon with vegetables',
      calories: 520,
      color: 'bg-blue-500',
    },
  ];

  const quickActions = [
    { title: 'Calorie Tracker', description: 'Track daily calories', screen: 'calorie-tracker' as Screen, icon: '🔥' },
    { title: 'Water Tracker', description: 'Monitor hydration', screen: 'water-tracker' as Screen, icon: '💧' },
    { title: 'Recipes', description: 'Healthy meal ideas', screen: 'recipes' as Screen, icon: '📖' },
  ];

  const totalCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const calorieGoal = 2000;
  const progress = (totalCalories / calorieGoal) * 100;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-gray-900">Meal Planner</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Calorie Summary */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 mb-6 text-white">
          <h2 className="text-white mb-4">Today's Progress</h2>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-3xl mb-1">{totalCalories}</p>
              <p className="text-green-100">of {calorieGoal} calories</p>
            </div>
            <div className="text-right">
              <p className="text-2xl">{calorieGoal - totalCalories}</p>
              <p className="text-green-100">remaining</p>
            </div>
          </div>
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => onNavigate(action.screen)}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-center"
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <p className="text-gray-900 mb-1">{action.title}</p>
            </button>
          ))}
        </div>

        {/* Today's Meals */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-gray-900">Today's Meals</h2>
            <button className="bg-green-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-600">
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="space-y-3">
            {todaysMeals.map((meal, index) => {
              const Icon = meal.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
                >
                  <div className={`${meal.color} rounded-xl p-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-900">{meal.type}</h3>
                      <span className="text-gray-500">• {meal.time}</span>
                    </div>
                    <p className="text-gray-600">{meal.meal}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900">{meal.calories}</p>
                    <p className="text-gray-500">cal</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
