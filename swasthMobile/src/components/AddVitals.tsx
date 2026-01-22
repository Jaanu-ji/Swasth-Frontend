import { useState } from 'react';
import { ArrowLeft, Heart, Activity, Thermometer, Weight, Droplet, Wind } from 'lucide-react';

interface AddVitalsProps {
  onBack: () => void;
  onSave: () => void;
}

export function AddVitals({ onBack, onSave }: AddVitalsProps) {
  const [selectedVital, setSelectedVital] = useState<string>('');
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');
  const [notes, setNotes] = useState('');

  const vitals = [
    { id: 'heart-rate', label: 'Heart Rate', icon: Heart, unit: 'bpm', color: 'bg-rose-500' },
    { id: 'blood-pressure', label: 'Blood Pressure', icon: Activity, unit: 'mmHg', color: 'bg-red-500', dual: true },
    { id: 'temperature', label: 'Temperature', icon: Thermometer, unit: '°F', color: 'bg-orange-500' },
    { id: 'weight', label: 'Weight', icon: Weight, unit: 'kg', color: 'bg-blue-500' },
    { id: 'glucose', label: 'Blood Glucose', icon: Droplet, unit: 'mg/dL', color: 'bg-purple-500' },
    { id: 'oxygen', label: 'Oxygen Saturation', icon: Wind, unit: '%', color: 'bg-cyan-500' },
  ];

  const handleSave = () => {
    if (!selectedVital || !value1) {
      alert('Please select a vital and enter a value');
      return;
    }
    onSave();
  };

  const selectedVitalData = vitals.find(v => v.id === selectedVital);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-gray-900">Add Vitals</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Select Vital */}
        <div className="mb-6">
          <h2 className="mb-4 text-gray-900">Select Vital</h2>
          <div className="grid grid-cols-2 gap-3">
            {vitals.map((vital) => {
              const Icon = vital.icon;
              const isSelected = selectedVital === vital.id;
              
              return (
                <button
                  key={vital.id}
                  onClick={() => setSelectedVital(vital.id)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`${vital.color} rounded-xl p-2 inline-flex mb-2`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className={`${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                    {vital.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Values */}
        {selectedVital && (
          <div className="mb-6">
            <h2 className="mb-4 text-gray-900">Enter Value</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              {selectedVitalData?.dual ? (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-2">Systolic</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={value1}
                        onChange={(e) => setValue1(e.target.value)}
                        placeholder="120"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        {selectedVitalData.unit}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-2">Diastolic</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={value2}
                        onChange={(e) => setValue2(e.target.value)}
                        placeholder="80"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        {selectedVitalData.unit}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-gray-700 mb-2">Value</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={value1}
                      onChange={(e) => setValue1(e.target.value)}
                      placeholder="Enter value"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      {selectedVitalData?.unit}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-blue-500 text-white py-4 rounded-2xl hover:bg-blue-600 transition-colors shadow-lg"
        >
          Save Vital
        </button>
      </div>
    </div>
  );
}
