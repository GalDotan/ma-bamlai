// src/components/BarcodeScanner.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Quagga from '@ericblade/quagga2';

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
    if (!videoContainer.current) return;

    let active = true;
    setInitializing(true);

    // Initialize Quagga
    Quagga.init({
      inputStream: {
        type: 'LiveStream',
        target: videoContainer.current as Element,
        constraints: {
          facingMode: 'environment',
        },
      },
      decoder: {
        readers: ['code_128_reader', 'ean_reader', 'upc_reader'],
      },
      locate: true,
    }, (err) => {
      if (err) {
        console.error('Quagga init error:', err);
        setError('Failed to initialize camera.');
        setInitializing(false);
        return;
      }
      if (!active) return;

      Quagga.start();
      setInitializing(false);

      // On detection
      Quagga.onDetected((result) => {
        const code = result.codeResult?.code;
        if (code) {
          Quagga.stop();
          onClose();
          router.push(`/parts?barcode=${encodeURIComponent(code)}`);
        }
      });
    });

    // Cleanup
    return () => {
      active = false;
      try { Quagga.stop(); } catch {}
      Quagga.offDetected(() => {});
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
