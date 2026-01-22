import { useState } from 'react';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface CalorieTrackerProps {
  onBack: () => void;
}

export function CalorieTracker({ onBack }: CalorieTrackerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const macroData = [
    { name: 'Protein', value: 65, color: '#3b82f6' },
    { name: 'Carbs', value: 180, color: '#10b981' },
    { name: 'Fat', value: 45, color: '#f59e0b' },
  ];

  const recentFoods = [
    { name: 'Chicken Breast', serving: '100g', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: 'Brown Rice', serving: '1 cup', calories: 216, protein: 5, carbs: 45, fat: 1.8 },
    { name: 'Avocado', serving: '1/2 fruit', calories: 120, protein: 1.5, carbs: 6, fat: 11 },
    { name: 'Banana', serving: '1 medium', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  ];

  const totalCalories = 1470;
  const goal = 2000;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-gray-900">Calorie Tracker</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-500 mb-1">Consumed</p>
              <p className="text-3xl text-gray-900">{totalCalories}</p>
              <p className="text-gray-500">of {goal} cal</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 mb-1">Remaining</p>
              <p className="text-3xl text-green-600">{goal - totalCalories}</p>
              <p className="text-gray-500">cal</p>
            </div>
          </div>

          {/* Macro Distribution */}
          <div className="border-t pt-6">
            <h3 className="text-gray-900 mb-4">Macro Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-3 gap-4 mt-4">
              {macroData.map((macro, index) => (
                <div key={index} className="text-center">
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: macro.color }}
                  />
                  <p className="text-gray-900">{macro.value}g</p>
                  <p className="text-gray-500">{macro.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search foods..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Recent Foods */}
        <div>
          <h2 className="mb-4 text-gray-900">Quick Add</h2>
          <div className="space-y-3">
            {recentFoods.map((food, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-1">{food.name}</h3>
                  <p className="text-gray-500 mb-2">{food.serving}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-blue-600">{food.protein}g P</span>
                    <span className="text-green-600">{food.carbs}g C</span>
                    <span className="text-orange-600">{food.fat}g F</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 mb-2">{food.calories}</p>
                  <button className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
