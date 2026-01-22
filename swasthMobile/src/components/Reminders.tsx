import { useState } from 'react';
import { ArrowLeft, Plus, Pill, Calendar, Clock, ChevronRight, Check } from 'lucide-react';

interface RemindersProps {
  onBack: () => void;
}

export function Reminders({ onBack }: RemindersProps) {
  const [activeTab, setActiveTab] = useState<'medicine' | 'appointments'>('medicine');

  const medicineReminders = [
    {
      id: '1',
      name: 'Vitamin D',
      dosage: '1 tablet',
      times: ['9:00 AM'],
      taken: [true],
      color: 'bg-yellow-500',
    },
    {
      id: '2',
      name: 'Blood Pressure Medication',
      dosage: '1 tablet',
      times: ['8:00 AM', '8:00 PM'],
      taken: [true, false],
      color: 'bg-red-500',
    },
    {
      id: '3',
      name: 'Omega-3',
      dosage: '2 capsules',
      times: ['12:00 PM'],
      taken: [false],
      color: 'bg-blue-500',
    },
  ];

  const appointments = [
    {
      id: '1',
      title: 'Dental Checkup',
      doctor: 'Dr. Sarah Wilson',
      date: 'Dec 20, 2024',
      time: '10:00 AM',
      location: 'City Dental Clinic',
      type: 'Dental',
      color: 'bg-cyan-500',
    },
    {
      id: '2',
      title: 'Annual Physical',
      doctor: 'Dr. Michael Chen',
      date: 'Jan 5, 2025',
      time: '2:30 PM',
      location: 'General Hospital',
      type: 'General',
      color: 'bg-green-500',
    },
    {
      id: '3',
      title: 'Eye Examination',
      doctor: 'Dr. Emily Park',
      date: 'Jan 15, 2025',
      time: '11:00 AM',
      location: 'Vision Care Center',
      type: 'Ophthalmology',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-gray-900">Reminders</h1>
          </div>
          <button className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-t">
          <button
            onClick={() => setActiveTab('medicine')}
            className={`flex-1 py-3 relative ${
              activeTab === 'medicine' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            Medicine
            {activeTab === 'medicine' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 py-3 relative ${
              activeTab === 'appointments' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            Appointments
            {activeTab === 'appointments' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'medicine' ? (
          <>
            {/* Today's Summary */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 mb-6 text-white">
              <h2 className="text-white mb-4">Today's Medications</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl mb-1">3 / 4</p>
                  <p className="text-blue-100">doses taken</p>
                </div>
                <div className="bg-white/20 rounded-full p-4">
                  <Pill className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Medicine List */}
            <h2 className="mb-4 text-gray-900">Medications</h2>
            <div className="space-y-3">
              {medicineReminders.map((medicine) => (
                <div key={medicine.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-4 mb-3">
                    <div className={`${medicine.color} rounded-xl p-3`}>
                      <Pill className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-1">{medicine.name}</h3>
                      <p className="text-gray-500">{medicine.dosage}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {medicine.times.map((time, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-xl ${
                          medicine.taken[index] ? 'bg-green-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-900">{time}</span>
                        </div>
                        {medicine.taken[index] ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <Check className="w-4 h-4" />
                            <span className="text-sm">Taken</span>
                          </div>
                        ) : (
                          <button className="bg-blue-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-blue-600">
                            Mark Taken
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Upcoming Appointments */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 mb-6 text-white">
              <h2 className="text-white mb-4">Upcoming Appointments</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl mb-1">{appointments.length}</p>
                  <p className="text-green-100">scheduled</p>
                </div>
                <div className="bg-white/20 rounded-full p-4">
                  <Calendar className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Appointment List */}
            <h2 className="mb-4 text-gray-900">Schedule</h2>
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <button
                  key={appointment.id}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left"
                >
                  <div className="flex gap-4">
                    <div className={`${appointment.color} rounded-xl p-3 h-fit`}>
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-1">{appointment.title}</h3>
                      <p className="text-gray-600 mb-2">{appointment.doctor}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {appointment.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {appointment.time}
                        </span>
                      </div>
                      <p className="text-gray-500 mt-2">{appointment.location}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
