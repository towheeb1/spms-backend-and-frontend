// src/hooks/useBarcodeScanner.ts
import { useState } from 'react';

interface UseBarccodeScannerOptions {
  onScan: (barcode: string) => void;
  onError?: (error: string) => void;
  hashBarcode?: boolean; // تشفير الباركود بـ SHA-256
}

export function useBarcodeScanner({ onScan, onError, hashBarcode = false }: UseBarccodeScannerOptions) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  async function hashBarcodeValue(data: string): Promise<string> {
    const enc = new TextEncoder().encode(data);
    const digest = await crypto.subtle.digest('SHA-256', enc);
    const bytes = Array.from(new Uint8Array(digest));
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function startScan(videoElementId: string) {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setScanning(true);
      setStream(mediaStream);

      const videoElement = document.getElementById(videoElementId) as HTMLVideoElement | null;
      if (!videoElement) {
        throw new Error('Video element not found');
      }

      videoElement.srcObject = mediaStream;
      await videoElement.play();

      // التحقق من دعم Barcode Detector API
      const hasDetector = 'BarcodeDetector' in window;
      if (!hasDetector) {
        throw new Error('Barcode Detector API غير مدعوم في هذا المتصفح');
      }

      // @ts-ignore
      const detector = new window.BarcodeDetector({
        formats: ['qr_code', 'code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e']
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let shouldStop = false;

      async function detectBarcode() {
        if (!videoElement || shouldStop) return;
        
        if (videoElement.readyState >= 2 && detector) {
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          ctx?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

          try {
            const bitmap = await createImageBitmap(canvas);
            const codes = await detector.detect(bitmap);
            
            if (codes && codes.length > 0) {
              const rawValue = codes[0].rawValue || codes[0].value || '';
              if (rawValue) {
                const finalValue = hashBarcode 
                  ? await hashBarcodeValue(rawValue) 
                  : rawValue;
                
                onScan(finalValue);
                stopScan();
                return;
              }
            }
          } catch (err) {
            console.error('Barcode detection error:', err);
          }
        }

        requestAnimationFrame(detectBarcode);
      }

      function stopScan() {
        shouldStop = true;
        if (videoElement) {
          videoElement.pause();
          videoElement.srcObject = null;
        }
        mediaStream.getTracks().forEach(track => track.stop());
        setScanning(false);
        setStream(null);
      }

      // حفظ دالة الإيقاف للاستخدام الخارجي
      (window as any).__barcodeStopScan = stopScan;

      detectBarcode();

    } catch (err: any) {
      const errorMessage = err?.message || 'تعذر الوصول للكاميرا';
      setError(errorMessage);
      onError?.(errorMessage);
      setScanning(false);
    }
  }

  function stopScan() {
    const stopFn = (window as any).__barcodeStopScan;
    if (stopFn) stopFn();
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setScanning(false);
  }

  return {
    scanning,
    error,
    startScan,
    stopScan
  };
}
