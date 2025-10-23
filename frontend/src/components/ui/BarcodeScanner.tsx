// src/components/ui/BarcodeScanner.tsx
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  hashBarcode?: boolean;
  title?: string;
}

export function BarcodeScanner({ 
  onScan, 
  onClose, 
  hashBarcode = false,
  title = 'مسح باركود'
}: BarcodeScannerProps) {
  const videoId = 'barcode-scanner-video';
  
  const { scanning, error, startScan, stopScan } = useBarcodeScanner({
    onScan: (barcode) => {
      onScan(barcode);
      handleClose();
    },
    onError: (err) => {
      console.error('Barcode scan error:', err);
    },
    hashBarcode
  });

  const handleClose = () => {
    stopScan();
    onClose();
  };

  const handleStart = () => {
    startScan(videoId);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="card rounded-2xl p-6 w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📷</span>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
            aria-label="إغلاق"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Video Preview */}
        <div className="relative aspect-video bg-black/30 rounded-xl overflow-hidden border border-white/10 mb-4">
          <video
            id={videoId}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          
          {/* Scanning Overlay */}
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Scanning Frame */}
                <div className="w-64 h-64 border-4 border-blue-500 rounded-lg animate-pulse">
                  {/* Corner Indicators */}
                  <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
                  
                  {/* Scanning Line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan" />
                </div>
              </div>
            </div>
          )}

          {/* Instructions when not scanning */}
          {!scanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <p className="text-sm">اضغط على "بدء المسح" لتشغيل الكاميرا</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium mb-1">تعليمات المسح:</p>
              <ul className="list-disc list-inside space-y-1 opacity-90 text-xs">
                <li>وجه الكاميرا نحو الباركود</li>
                <li>تأكد من وضوح الإضاءة</li>
                <li>احتفظ بمسافة مناسبة (15-20 سم)</li>
                <li>سيتم المسح تلقائياً عند الاكتشاف</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {!scanning ? (
            <button
              onClick={handleStart}
              className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              بدء المسح
            </button>
          ) : (
            <button
              onClick={stopScan}
              className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              إيقاف
            </button>
          )}
          <button
            onClick={handleClose}
            className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>

      {/* Custom Animation */}
      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(256px); }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
