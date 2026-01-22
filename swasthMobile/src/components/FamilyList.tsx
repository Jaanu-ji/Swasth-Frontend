import { ArrowLeft, Plus, ChevronRight, User } from 'lucide-react';
import type { Screen } from '../App';

interface FamilyListProps {
  onNavigate: (screen: Screen) => void;
  onMemberSelect: (memberId: string) => void;
  onBack: () => void;
}

export function FamilyList({ onNavigate, onMemberSelect, onBack }: FamilyListProps) {
  const familyMembers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      relationship: 'You',
      age: 32,
      lastCheckup: 'Dec 1, 2024',
      status: 'healthy',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    },
    {
      id: '2',
      name: 'John Johnson',
      relationship: 'Spouse',
      age: 35,
      lastCheckup: 'Nov 28, 2024',
      status: 'healthy',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    },
    {
      id: '3',
      name: 'Emma Johnson',
      relationship: 'Daughter',
      age: 8,
      lastCheckup: 'Dec 5, 2024',
      status: 'vaccination-due',
      avatar: 'https://images.unsplash.com/photo-1518295644163-4e9f60057d4e?w=200&h=200&fit=crop',
    },
    {
      id: '4',
      name: 'David Johnson',
      relationship: 'Son',
      age: 5,
      lastCheckup: 'Nov 30, 2024',
      status: 'healthy',
      avatar: 'https://images.unsplash.com/photo-1519690889869-9b29e83f3e3e?w=200&h=200&fit=crop',
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
            <h1 className="text-gray-900">Family Profiles</h1>
          </div>
          <button className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
            <p className="text-blue-100 mb-1">Total</p>
            <p className="text-2xl">4</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white">
            <p className="text-green-100 mb-1">Healthy</p>
            <p className="text-2xl">3</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
            <p className="text-orange-100 mb-1">Alerts</p>
            <p className="text-2xl">1</p>
          </div>
        </div>

        {/* Family Members */}
        <h2 className="mb-4 text-gray-900">Members</h2>
        <div className="space-y-3">
          {familyMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => onMemberSelect(member.id)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-gray-900">{member.name}</h3>
                  {member.status === 'vaccination-due' && (
                    <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                      Vaccination Due
                    </span>
                  )}
                </div>
                <p className="text-gray-500 mb-1">
                  {member.relationship} • {member.age} years
                </p>
                <p className="text-gray-400">
                  Last checkup: {member.lastCheckup}
                </p>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
