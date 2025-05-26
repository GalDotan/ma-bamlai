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
    let pollCount = 0;
    const maxPolls = 20; // Try for up to 2 seconds (20 x 100ms)

    function tryInitQuagga() {
      if (!container) return;
      if (!container.isConnected) {
        setError('Camera container not attached.');
        setInitializing(false);
        return;
      }
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        if (pollCount < maxPolls) {
          pollCount++;
          setTimeout(tryInitQuagga, 100);
        } else {
          setError('Camera container not visible.');
          setInitializing(false);
        }
        return;
      }
      const onDetected = (result: QuaggaJSResultObject) => {
        const code = result.codeResult?.code;
        if (code && active) {
          Quagga.offDetected(onDetected);
          Quagga.stop();
          onClose();
          setTimeout(() => {
            // Redirect to the part with this partNumber, not id
            router.push(`/parts?partNumber=${encodeURIComponent(code)}`);
          }, 100);
        }
      };
      Quagga.init(
        {
          inputStream: {
            type: 'LiveStream',
            target: container as Element,
            constraints: {
              facingMode: 'environment',
            },
          },
          locator: {
            patchSize: 'medium',
            halfSample: false,
          },
          decoder: {
            readers: ['code_128_reader'],
            debug: {
              drawBoundingBox: true,
              showFrequency: true,
              drawScanline: true,
              showPattern: true,
            },
          },
          locate: true,
          numOfWorkers: navigator.hardwareConcurrency || 4,
        },
        (err) => {
          if (err) {
            // Log the full error object for debugging
            console.error('Quagga init error:', err);
            setError(
              'Failed to initialize camera. ' +
              (err.name ? `${err.name}: ` : '') +
              (err.message || err.toString() || '') +
              '\nTry closing other apps/tabs using the camera, check browser permissions, or try a different device.'
            );
            setInitializing(false);
            return;
          }
          if (!active) return;
          Quagga.onDetected(onDetected);
          Quagga.start();
          setInitializing(false);
        }
      );
    }

    // Start polling for a visible container
    setTimeout(tryInitQuagga, 100);

    return () => {
      active = false;
      setInitializing(false);
      try { Quagga.stop(); } catch {}
      Quagga.offDetected();
    };
  }, [isOpen, onClose, router]);

  if (!isOpen) return null;

  return (
    <div className="mt-100 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
          style={{ imageRendering: 'crisp-edges' }}
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
