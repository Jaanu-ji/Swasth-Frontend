import { ArrowLeft, Heart, Activity, Weight, Droplet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface VitalsHistoryProps {
  onBack: () => void;
}

export function VitalsHistory({ onBack }: VitalsHistoryProps) {
  const heartRateData = [
    { date: 'Dec 6', value: 70 },
    { date: 'Dec 7', value: 68 },
    { date: 'Dec 8', value: 72 },
    { date: 'Dec 9', value: 71 },
    { date: 'Dec 10', value: 70 },
    { date: 'Dec 11', value: 74 },
    { date: 'Dec 12', value: 72 },
  ];

  const bloodPressureData = [
    { date: 'Dec 6', systolic: 118, diastolic: 76 },
    { date: 'Dec 7', systolic: 120, diastolic: 78 },
    { date: 'Dec 8', systolic: 122, diastolic: 80 },
    { date: 'Dec 9', systolic: 119, diastolic: 77 },
    { date: 'Dec 10', systolic: 121, diastolic: 79 },
    { date: 'Dec 11', systolic: 118, diastolic: 78 },
    { date: 'Dec 12', systolic: 120, diastolic: 80 },
  ];

  const weightData = [
    { date: 'Dec 6', value: 69.2 },
    { date: 'Dec 7', value: 69.0 },
    { date: 'Dec 8', value: 68.8 },
    { date: 'Dec 9', value: 68.6 },
    { date: 'Dec 10', value: 68.4 },
    { date: 'Dec 11', value: 68.2 },
    { date: 'Dec 12', value: 68.0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-gray-900">Vitals History</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Heart Rate Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-rose-500 rounded-xl p-2">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900">Heart Rate</h3>
              <p className="text-gray-500">Last 7 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={heartRateData}>
              <defs>
                <linearGradient id="heartRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[60, 80]} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#f43f5e" fillOpacity={1} fill="url(#heartRate)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-500">Average: </span>
              <span className="text-gray-900">71 bpm</span>
            </div>
            <div>
              <span className="text-gray-500">Range: </span>
              <span className="text-gray-900">68-74 bpm</span>
            </div>
          </div>
        </div>

        {/* Blood Pressure Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-500 rounded-xl p-2">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900">Blood Pressure</h3>
              <p className="text-gray-500">Last 7 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={bloodPressureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[70, 130]} />
              <Tooltip />
              <Line type="monotone" dataKey="systolic" stroke="#dc2626" strokeWidth={2} dot={{ fill: '#dc2626' }} />
              <Line type="monotone" dataKey="diastolic" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span className="text-gray-500">Systolic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-500">Diastolic</span>
            </div>
          </div>
        </div>

        {/* Weight Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 rounded-xl p-2">
              <Weight className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900">Weight</h3>
              <p className="text-gray-500">Last 7 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[67, 70]} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-500">Change: </span>
              <span className="text-green-600">-1.2 kg</span>
            </div>
            <div>
              <span className="text-gray-500">Goal: </span>
              <span className="text-gray-900">65 kg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
