import { useState } from 'react';
import { ArrowLeft, Upload, Camera, FileText, Check, AlertCircle } from 'lucide-react';

interface ReportScannerProps {
  onBack: () => void;
}

export function ReportScanner({ onBack }: ReportScannerProps) {
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

  const previousScans = [
    {
      id: '1',
      type: 'Blood Test',
      date: 'Dec 1, 2024',
      status: 'completed',
      results: {
        hemoglobin: '14.5 g/dL',
        glucose: '95 mg/dL',
        cholesterol: '180 mg/dL',
      },
      notes: 'All values within normal range',
    },
    {
      id: '2',
      type: 'X-Ray Report',
      date: 'Nov 15, 2024',
      status: 'completed',
      results: {
        finding: 'No abnormalities detected',
      },
      notes: 'Chest X-ray clear',
    },
    {
      id: '3',
      type: 'ECG Report',
      date: 'Oct 28, 2024',
      status: 'completed',
      results: {
        heartRate: '72 bpm',
        rhythm: 'Normal sinus rhythm',
      },
      notes: 'Heart function normal',
    },
  ];

  const handleUpload = () => {
    setScanStatus('scanning');
    setTimeout(() => {
      setScanStatus('success');
      setTimeout(() => setScanStatus('idle'), 2000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-gray-900">Report Scanner</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 mb-1">AI-Powered Report Analysis</p>
            <p className="text-blue-700 text-sm">
              Upload medical reports to extract and organize key information automatically
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
          {scanStatus === 'idle' && (
            <>
              <div className="text-center mb-6">
                <div className="bg-purple-100 rounded-full p-6 inline-flex mb-4">
                  <FileText className="w-12 h-12 text-purple-600" />
                </div>
                <h2 className="text-gray-900 mb-2">Scan Medical Report</h2>
                <p className="text-gray-600">
                  Upload a photo or PDF of your medical report for automatic analysis
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleUpload}
                  className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <Camera className="w-8 h-8 text-gray-600" />
                  <span className="text-gray-900">Take Photo</span>
                </button>
                <button
                  onClick={handleUpload}
                  className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <Upload className="w-8 h-8 text-gray-600" />
                  <span className="text-gray-900">Upload File</span>
                </button>
              </div>
            </>
          )}

          {scanStatus === 'scanning' && (
            <div className="text-center py-8">
              <div className="bg-purple-100 rounded-full p-6 inline-flex mb-4 animate-pulse">
                <FileText className="w-12 h-12 text-purple-600" />
              </div>
              <h2 className="text-gray-900 mb-2">Analyzing Report...</h2>
              <p className="text-gray-600">Our AI is extracting information from your report</p>
            </div>
          )}

          {scanStatus === 'success' && (
            <div className="text-center py-8">
              <div className="bg-green-100 rounded-full p-6 inline-flex mb-4">
                <Check className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-gray-900 mb-2">Report Analyzed Successfully!</h2>
              <p className="text-gray-600">Data has been extracted and saved</p>
            </div>
          )}
        </div>

        {/* Previous Scans */}
        <div>
          <h2 className="mb-4 text-gray-900">Previous Scans</h2>
          <div className="space-y-3">
            {previousScans.map((scan) => (
              <button
                key={scan.id}
                className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 rounded-xl p-3">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-gray-900">{scan.type}</h3>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {scan.status}
                      </span>
                    </div>
                    <p className="text-gray-500 mb-3">{scan.date}</p>
                    <div className="bg-gray-50 rounded-lg p-3 mb-2">
                      {Object.entries(scan.results).map(([key, value], index) => (
                        <div key={index} className="flex justify-between mb-1 last:mb-0">
                          <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">{scan.notes}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
