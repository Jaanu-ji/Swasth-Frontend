import { ArrowLeft, Plus, Heart, Activity, Thermometer, Weight, TrendingUp, Calendar } from 'lucide-react';
import type { Screen } from '../App';

interface HealthTrackerProps {
  onNavigate: (screen: Screen) => void;
  onBack: () => void;
}

export function HealthTracker({ onNavigate, onBack }: HealthTrackerProps) {
  const vitals = [
    { label: 'Heart Rate', value: '72', unit: 'bpm', icon: Heart, color: 'bg-rose-500', change: '+2' },
    { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', icon: Activity, color: 'bg-red-500', change: '-3' },
    { label: 'Temperature', value: '98.6', unit: '°F', icon: Thermometer, color: 'bg-orange-500', change: '0' },
    { label: 'Weight', value: '68', unit: 'kg', icon: Weight, color: 'bg-blue-500', change: '-1' },
  ];

  const recentReadings = [
    { date: 'Today, 8:30 AM', type: 'Blood Pressure', value: '120/80 mmHg' },
    { date: 'Today, 7:00 AM', type: 'Weight', value: '68 kg' },
    { date: 'Yesterday, 8:30 AM', type: 'Blood Pressure', value: '118/78 mmHg' },
    { date: 'Dec 10, 9:00 AM', type: 'Heart Rate', value: '70 bpm' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-gray-900">Health Tracker</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Current Vitals */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-gray-900">Current Vitals</h2>
            <button
              onClick={() => onNavigate('add-vitals')}
              className="bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {vitals.map((vital, index) => {
              const Icon = vital.icon;
              const changePositive = vital.change.startsWith('+');
              const changeNegative = vital.change.startsWith('-');
              
              return (
                <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className={`${vital.color} rounded-xl p-2 inline-flex mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-gray-600 mb-1">{vital.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl text-gray-900">{vital.value}</span>
                    <span className="text-gray-500">{vital.unit}</span>
                  </div>
                  {vital.change !== '0' && (
                    <div className={`flex items-center gap-1 mt-2 ${
                      changePositive ? 'text-green-600' : changeNegative ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      <TrendingUp className={`w-3 h-3 ${changeNegative ? 'rotate-180' : ''}`} />
                      <span className="text-sm">{vital.change}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* History Button */}
        <button
          onClick={() => onNavigate('vitals-history')}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl flex items-center justify-center gap-2 mb-6 hover:from-blue-600 hover:to-purple-600 shadow-lg"
        >
          <Calendar className="w-5 h-5" />
          View History & Graphs
        </button>

        {/* Recent Readings */}
        <div>
          <h2 className="mb-4 text-gray-900">Recent Readings</h2>
          <div className="space-y-3">
            {recentReadings.map((reading, index) => (
              <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-900 mb-1">{reading.type}</p>
                    <p className="text-gray-500">{reading.date}</p>
                  </div>
                  <span className="text-blue-500">{reading.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
