import { useState } from 'react';
import { ArrowLeft, Plus, Minus, Droplet } from 'lucide-react';

interface WaterTrackerProps {
  onBack: () => void;
}

export function WaterTracker({ onBack }: WaterTrackerProps) {
  const [cups, setCups] = useState(6);
  const goal = 8;
  const progress = (cups / goal) * 100;

  const cupSizes = [
    { label: '1 Cup', value: 1, ml: 250 },
    { label: '2 Cups', value: 2, ml: 500 },
    { label: '3 Cups', value: 3, ml: 750 },
  ];

  const history = [
    { time: '2:30 PM', amount: '2 cups', ml: 500 },
    { time: '12:00 PM', amount: '1 cup', ml: 250 },
    { time: '10:30 AM', amount: '2 cups', ml: 500 },
    { time: '8:00 AM', amount: '1 cup', ml: 250 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-gray-900">Water Tracker</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Water Visual */}
        <div className="bg-gradient-to-b from-cyan-50 to-blue-50 rounded-3xl p-8 mb-6">
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-48 mb-6">
              {/* Water Glass Visual */}
              <div className="absolute inset-0 border-4 border-cyan-500 rounded-b-3xl rounded-t-lg">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-400 to-cyan-300 rounded-b-3xl transition-all duration-500"
                  style={{ height: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                </div>
              </div>
              <Droplet className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-cyan-500/30" />
            </div>

            <h2 className="text-gray-900 mb-2">{cups} / {goal} Cups</h2>
            <p className="text-gray-600 mb-6">{cups * 250}ml of {goal * 250}ml</p>

            <div className="flex gap-4">
              <button
                onClick={() => setCups(Math.max(0, cups - 1))}
                className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <Minus className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={() => setCups(Math.min(goal + 2, cups + 1))}
                className="bg-cyan-500 p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Add */}
        <div className="mb-6">
          <h2 className="mb-4 text-gray-900">Quick Add</h2>
          <div className="grid grid-cols-3 gap-3">
            {cupSizes.map((size, index) => (
              <button
                key={index}
                onClick={() => setCups(Math.min(goal + 2, cups + size.value))}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-center"
              >
                <div className="bg-cyan-100 rounded-full p-3 inline-flex mb-2">
                  <Droplet className="w-5 h-5 text-cyan-600" />
                </div>
                <p className="text-gray-900 mb-1">{size.label}</p>
                <p className="text-gray-500">{size.ml}ml</p>
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        <div>
          <h2 className="mb-4 text-gray-900">Today's History</h2>
          <div className="space-y-3">
            {history.map((entry, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-cyan-100 rounded-xl p-2">
                    <Droplet className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-gray-900">{entry.amount}</p>
                    <p className="text-gray-500">{entry.time}</p>
                  </div>
                </div>
                <span className="text-cyan-600">{entry.ml}ml</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
