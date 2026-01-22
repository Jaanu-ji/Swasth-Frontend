import { ArrowLeft, Heart, Activity, Calendar, Syringe, FileText, TrendingUp } from 'lucide-react';
import type { Screen } from '../App';

interface MemberDashboardProps {
  memberId: string | null;
  onNavigate: (screen: Screen) => void;
  onBack: () => void;
}

export function MemberDashboard({ memberId, onNavigate, onBack }: MemberDashboardProps) {
  // Mock data based on member ID
  const member = {
    name: 'Emma Johnson',
    age: 8,
    relationship: 'Daughter',
    avatar: 'https://images.unsplash.com/photo-1518295644163-4e9f60057d4e?w=200&h=200&fit=crop',
  };

  const healthStats = [
    { label: 'Height', value: '130', unit: 'cm', icon: TrendingUp, color: 'bg-blue-100 text-blue-600' },
    { label: 'Weight', value: '28', unit: 'kg', icon: Activity, color: 'bg-green-100 text-green-600' },
    { label: 'Blood Group', value: 'A+', unit: '', icon: Heart, color: 'bg-rose-100 text-rose-600' },
  ];

  const upcomingEvents = [
    { type: 'Vaccination', name: 'HPV Vaccine - Dose 2', date: 'Dec 20, 2024', icon: Syringe, color: 'bg-orange-500' },
    { type: 'Checkup', name: 'Dental Checkup', date: 'Jan 5, 2025', icon: Calendar, color: 'bg-blue-500' },
    { type: 'Report', name: 'Annual Health Report', date: 'Jan 15, 2025', icon: FileText, color: 'bg-purple-500' },
  ];

  const recentVitals = [
    { label: 'Heart Rate', value: '82 bpm', date: 'Today', status: 'normal' },
    { label: 'Temperature', value: '98.4°F', date: 'Today', status: 'normal' },
    { label: 'Weight', value: '28 kg', date: 'Dec 10', status: 'normal' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-b-3xl pb-20">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-white">Member Profile</h1>
        </div>
      </div>

      <div className="px-6 -mt-16">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-gray-900 mb-1">{member.name}</h2>
              <p className="text-gray-600">{member.relationship} • {member.age} years</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {healthStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`${stat.color} rounded-xl p-2 inline-flex mb-2`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-gray-900">{stat.value}{stat.unit}</p>
                  <p className="text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-6">
          <h2 className="mb-4 text-gray-900">Upcoming</h2>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => {
              const Icon = event.icon;
              return (
                <button
                  key={index}
                  onClick={() => event.type === 'Vaccination' && onNavigate('vaccination')}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
                >
                  <div className={`${event.color} rounded-xl p-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-gray-900 mb-1">{event.name}</p>
                    <p className="text-gray-500">{event.date}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Vitals */}
        <div>
          <h2 className="mb-4 text-gray-900">Recent Vitals</h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            {recentVitals.map((vital, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="text-gray-900">{vital.label}</p>
                  <p className="text-gray-500">{vital.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-900">{vital.value}</p>
                  <span className="text-green-600 text-sm">Normal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
