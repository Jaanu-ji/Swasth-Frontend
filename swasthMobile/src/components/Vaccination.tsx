import { ArrowLeft, Syringe, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface VaccinationProps {
  memberId: string | null;
  onBack: () => void;
}

export function Vaccination({ memberId, onBack }: VaccinationProps) {
  const vaccinations = [
    {
      name: 'HPV Vaccine',
      doses: [
        { doseNumber: 1, date: 'Jun 15, 2024', status: 'completed' },
        { doseNumber: 2, date: 'Dec 20, 2024', status: 'upcoming' },
        { doseNumber: 3, date: 'Jun 15, 2025', status: 'scheduled' },
      ],
    },
    {
      name: 'COVID-19 Vaccine',
      doses: [
        { doseNumber: 1, date: 'Mar 10, 2023', status: 'completed' },
        { doseNumber: 2, date: 'Apr 5, 2023', status: 'completed' },
      ],
    },
    {
      name: 'Influenza Vaccine',
      doses: [
        { doseNumber: 1, date: 'Oct 12, 2024', status: 'completed' },
      ],
    },
    {
      name: 'MMR Vaccine',
      doses: [
        { doseNumber: 1, date: 'Feb 20, 2017', status: 'completed' },
        { doseNumber: 2, date: 'Feb 20, 2021', status: 'completed' },
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'upcoming':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'scheduled':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'upcoming':
        return 'bg-orange-50 border-orange-200';
      case 'scheduled':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-gray-900">Vaccination Records</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Summary */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 rounded-full p-3">
              <Syringe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white">Emma Johnson</h2>
              <p className="text-purple-100">8 years old</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-purple-100 mb-1">Completed</p>
              <p className="text-2xl">6</p>
            </div>
            <div>
              <p className="text-purple-100 mb-1">Upcoming</p>
              <p className="text-2xl">1</p>
            </div>
            <div>
              <p className="text-purple-100 mb-1">Scheduled</p>
              <p className="text-2xl">1</p>
            </div>
          </div>
        </div>

        {/* Vaccination List */}
        <h2 className="mb-4 text-gray-900">Vaccination History</h2>
        <div className="space-y-4">
          {vaccinations.map((vaccine, index) => (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 rounded-xl p-2">
                  <Syringe className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-gray-900">{vaccine.name}</h3>
              </div>

              <div className="space-y-3">
                {vaccine.doses.map((dose, doseIndex) => (
                  <div
                    key={doseIndex}
                    className={`border-2 rounded-xl p-3 flex items-center justify-between ${getStatusColor(dose.status)}`}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(dose.status)}
                      <div>
                        <p className="text-gray-900">Dose {dose.doseNumber}</p>
                        <p className="text-gray-600">{dose.date}</p>
                      </div>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      dose.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : dose.status === 'upcoming'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {dose.status.charAt(0).toUpperCase() + dose.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add Vaccination Button */}
        <button className="w-full mt-6 bg-purple-500 text-white py-4 rounded-2xl hover:bg-purple-600 transition-colors shadow-lg flex items-center justify-center gap-2">
          <Syringe className="w-5 h-5" />
          Add Vaccination Record
        </button>
      </div>
    </div>
  );
}
