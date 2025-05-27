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
    setError('');    async function initializeScanner() {
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
        }        // Test camera access and request main camera with autofocus
        try {
          const testStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { exact: 'environment' },
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 }
            }
          });
          // Stop test stream immediately
          testStream.getTracks().forEach(track => track.stop());
        } catch (exactErr) {
          console.warn('Exact environment camera failed, trying ideal:', exactErr);
          // Fallback to ideal if exact fails
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: { ideal: 'environment' },
                width: { min: 640, ideal: 1280 },
                height: { min: 480, ideal: 720 }
              }
            });
            fallbackStream.getTracks().forEach(track => track.stop());
          } catch (fallbackErr) {
            console.error('Camera access failed:', fallbackErr);
            setError('Camera access failed. Please check permissions and ensure you have a rear camera available.');
            setInitializing(false);
            return;
          }
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
              facingMode: { exact: 'environment' },
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 }
            },
            area: {
              top: "20%",
              right: "20%", 
              left: "20%",
              bottom: "20%"
            }
          },
          locator: {
            patchSize: 'medium' as const,
            halfSample: true
          },
          decoder: {
            readers: [
              'code_128_reader' as const,
              'ean_reader' as const,
              'code_39_reader' as const,
              'upc_reader' as const
            ],
          },
          locate: true,
          frequency: 15
        };await new Promise<void>((resolve, reject) => {
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
            }            try {
              Quagga.onDetected(onDetected);
              Quagga.start();
              
              // Enable better camera settings after scanner starts
              setTimeout(() => {
                try {
                  const video = container.querySelector('video');
                  if (video && video.srcObject) {
                    const stream = video.srcObject as MediaStream;
                    const videoTrack = stream.getVideoTracks()[0];
                    if (videoTrack && 'applyConstraints' in videoTrack) {
                      videoTrack.applyConstraints({
                        width: { min: 640, ideal: 1280 },
                        height: { min: 480, ideal: 720 }
                      }).catch(err => {
                        console.log('Camera constraints not supported:', err);
                      });
                    }
                  }
                } catch (focusErr) {
                  console.log('Camera setup failed:', focusErr);
                }
              }, 1000);
              
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
          className="relative w-full bg-black rounded"
          style={{ 
            imageRendering: 'crisp-edges',
            minHeight: '300px',
            aspectRatio: '4/3'
          }}
        >
          {/* Scanning guide overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="relative w-full h-full">
              {/* Top and bottom dark overlays */}
              <div className="absolute top-0 left-0 right-0 h-1/4 bg-black bg-opacity-40"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-black bg-opacity-40"></div>
              
              {/* Left and right dark overlays */}
              <div className="absolute top-1/4 bottom-1/4 left-0 w-1/5 bg-black bg-opacity-40"></div>
              <div className="absolute top-1/4 bottom-1/4 right-0 w-1/5 bg-black bg-opacity-40"></div>
              
              {/* Scanning frame */}
              <div className="absolute top-1/4 bottom-1/4 left-1/5 right-1/5 border-2 border-red-500 rounded-lg">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                
                {/* Scanning line animation */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {initializing && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            Initializing camera...
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-500 p-4 text-center">
            {error}
          </div>
        )}        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
          Position the barcode within the red scanning area. Hold steady and ensure good lighting for best results.
        </p>
      </div>
    </div>
  );
}
