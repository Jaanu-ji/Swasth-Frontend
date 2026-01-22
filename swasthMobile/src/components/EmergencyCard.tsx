import { ArrowLeft, Phone, AlertCircle, User, Heart, Droplet, Pill, Edit } from 'lucide-react';

interface EmergencyCardProps {
  onBack: () => void;
}

export function EmergencyCard({ onBack }: EmergencyCardProps) {
  const personalInfo = {
    name: 'Sarah Johnson',
    age: 32,
    bloodType: 'A+',
    height: '165 cm',
    weight: '68 kg',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  };

  const emergencyContacts = [
    { name: 'John Johnson', relationship: 'Spouse', phone: '+1 (555) 123-4567' },
    { name: 'Mary Johnson', relationship: 'Mother', phone: '+1 (555) 234-5678' },
    { name: 'Dr. Michael Chen', relationship: 'Primary Doctor', phone: '+1 (555) 345-6789' },
  ];

  const medicalInfo = {
    allergies: ['Penicillin', 'Peanuts', 'Latex'],
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    medications: ['Lisinopril 10mg', 'Metformin 500mg', 'Aspirin 81mg'],
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-gray-900">Emergency Card</h1>
          </div>
          <button className="text-blue-500 hover:text-blue-600">
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Alert Banner */}
        <div className="bg-red-500 rounded-2xl p-4 mb-6 text-white flex items-center gap-3">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="mb-1">This card contains critical medical information</p>
            <p className="text-red-100 text-sm">Show to emergency responders if needed</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
              <img
                src={personalInfo.photo}
                alt={personalInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-gray-900 mb-1">{personalInfo.name}</h2>
              <p className="text-gray-500">{personalInfo.age} years old</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <Droplet className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-gray-500 mb-1">Blood Type</p>
              <p className="text-gray-900">{personalInfo.bloodType}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <User className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500 mb-1">Height / Weight</p>
              <p className="text-gray-900">{personalInfo.height}</p>
              <p className="text-gray-900">{personalInfo.weight}</p>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="text-gray-900 mb-4">Emergency Contacts</h3>
          <div className="space-y-3">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-gray-900 mb-1">{contact.name}</p>
                  <p className="text-gray-500">{contact.relationship}</p>
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="text-gray-900 mb-4">Medical Information</h3>
          
          {/* Allergies */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h4 className="text-gray-900">Allergies</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {medicalInfo.allergies.map((allergy, index) => (
                <span key={index} className="bg-red-100 text-red-700 px-3 py-1 rounded-full">
                  {allergy}
                </span>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-orange-600" />
              <h4 className="text-gray-900">Medical Conditions</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {medicalInfo.conditions.map((condition, index) => (
                <span key={index} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                  {condition}
                </span>
              ))}
            </div>
          </div>

          {/* Medications */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Pill className="w-5 h-5 text-blue-600" />
              <h4 className="text-gray-900">Current Medications</h4>
            </div>
            <div className="space-y-2">
              {medicalInfo.medications.map((medication, index) => (
                <div key={index} className="bg-blue-50 px-3 py-2 rounded-lg text-blue-900">
                  {medication}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Button */}
        <a
          href="tel:911"
          className="w-full bg-red-500 text-white py-4 rounded-2xl hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          <Phone className="w-5 h-5" />
          Call Emergency Services
        </a>
      </div>
    </div>
  );
}
