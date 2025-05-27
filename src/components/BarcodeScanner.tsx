// src/components/BarcodeScanner.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Quagga, { QuaggaJSResultObject } from '@ericblade/quagga2';
import { getPartByPartNumber } from '@/app/actions/partActions';

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
    setError('');

    async function initializeScanner() {
      try {
        // Check for camera permissions first
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Camera not supported by this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
          setInitializing(false);
          return;
        }

        // Ensure container is still available
        if (!container) {
          setError('Camera container not available.');
          setInitializing(false);
          return;
        }

        // Wait for container to be visible
        let attempts = 0;
        while (attempts < 30 && (container.offsetWidth === 0 || container.offsetHeight === 0)) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
          setError('Camera container not visible.');
          setInitializing(false);
          return;
        }

        const onDetected = (result: QuaggaJSResultObject) => {
          const code = result.codeResult?.code;
          if (code && active) {
            console.log('Barcode detected:', code);
            Quagga.offDetected(onDetected);
            Quagga.stop();
            onClose();
            
            setTimeout(async () => {
              try {
                const partNumber = parseInt(code);
                if (isNaN(partNumber)) {
                  // If not a valid number, search by name
                  router.push(`/parts?search=${encodeURIComponent(code)}`);
                  return;
                }
                
                // Find the part by partNumber and redirect to its view page
                const part = await getPartByPartNumber(partNumber);
                if (part) {
                  router.push(`/parts/${part.id}`);
                } else {
                  // If part not found, redirect to parts list with search
                  router.push(`/parts?search=${encodeURIComponent(code)}`);
                }
              } catch (error) {
                console.error('Error finding part:', error);
                // Fallback to search
                router.push(`/parts?search=${encodeURIComponent(code)}`);
              }
            }, 100);
          }
        };        const config = {
          inputStream: {
            type: 'LiveStream' as const,
            target: container as HTMLElement,
            constraints: {
              facingMode: 'environment'
            },
          },
          decoder: {
            readers: [
              'code_128_reader' as const,
              'ean_reader' as const,
              'code_39_reader' as const
            ],
          },
          locate: true,
          frequency: 10,
        };        await new Promise<void>((resolve, reject) => {
          Quagga.init(config, (err) => {
            if (err) {
              console.error('Quagga init error details:', {
                name: err.name,
                message: err.message,
                stack: err.stack
              });
              reject(err);
              return;
            }
            
            if (!active) {
              resolve();
              return;
            }
            
            try {
              Quagga.onDetected(onDetected);
              Quagga.start();
              setInitializing(false);
              console.log('Quagga scanner started successfully');
              resolve();
            } catch (startErr) {
              console.error('Quagga start error:', startErr);
              reject(startErr);
            }
          });
        });} catch (err: unknown) {
        console.error('Scanner initialization error:', err);
        if (active) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          setError(
            'Failed to initialize camera: ' +
            errorMessage +
            '\nPlease check camera permissions and try again.'
          );
          setInitializing(false);
        }
      }
    }

    // Start initialization with a small delay
    setTimeout(initializeScanner, 200);

    return () => {
      active = false;
      setInitializing(false);
      try {
        Quagga.stop();
        Quagga.offDetected();
      } catch (err) {
        console.warn('Error stopping Quagga:', err);
      }
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
        </button>        <div
          ref={videoContainer}
          className="w-full bg-black rounded"
          style={{ 
            imageRendering: 'crisp-edges',
            minHeight: '300px',
            aspectRatio: '4/3'
          }}
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
