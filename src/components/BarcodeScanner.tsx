// src/components/BarcodeScanner.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Quagga, { QuaggaJSResultObject } from '@ericblade/quagga2';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BarcodeScanner({ isOpen, onClose }: BarcodeScannerProps) {
  const videoContainer = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const container = videoContainer.current;
    if (!container) {
      setError('Camera container not ready.');
      return;
    }

    let active = true;
    setInitializing(true);

    // Create a hidden video element to ensure the stream is ready
    const videoEl = document.createElement('video');
    videoEl.setAttribute('playsinline', 'true');
    videoEl.style.display = 'none';
    container.appendChild(videoEl);

    // Request camera stream
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        videoEl.srcObject = stream;
        videoEl.onloadedmetadata = () => {
          videoEl.play();
          // Now safe to init Quagga
          const onDetected = (result: QuaggaJSResultObject) => {
            const code = result.codeResult?.code;
            if (code && active) {
              Quagga.stop();
              onClose();
              router.push(`/parts?barcode=${encodeURIComponent(code)}`);
            }
          };

          Quagga.init(
            {
              inputStream: {
                type: 'LiveStream',
                target: container,
                constraints: { facingMode: 'environment' },
              },
              decoder: { readers: ['code_128_reader', 'ean_reader', 'upc_reader'] },
              locate: true,
            },
            (err) => {
              if (err) {
                console.error('Quagga init error:', err);
                setError('Failed to initialize camera.');
                setInitializing(false);
                return;
              }
              if (!active) return;

              Quagga.onDetected(onDetected);
              Quagga.start();
              setInitializing(false);
            }
          );
        };
      })
      .catch(() => {
        setError('Failed to access camera.');
        setInitializing(false);
      });

    return () => {
      active = false;
      // Clean up video element and stream
      if (videoEl.srcObject) {
        (videoEl.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      videoEl.remove();
      try { Quagga.stop(); } catch {}
      Quagga.offDetected();
      setInitializing(false);
    };
  }, [isOpen, onClose, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative w-full max-w-lg p-4 bg-white dark:bg-gray-800 rounded-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
        >
          ×
        </button>

        <div
          ref={videoContainer}
          className="w-full aspect-video bg-black rounded"
        />

        {initializing && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            Initializing camera...
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-500 p-4 text-center">
            {error}
          </div>
        )}

        <p className="mt-2 text-sm text-gray-600 text-center">
          Position the barcode within the frame to scan automatically.
        </p>
      </div>
    </div>
  );
}
