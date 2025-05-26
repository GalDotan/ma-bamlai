'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';
import Quagga from '@ericblade/quagga2';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BarcodeScanner({ isOpen, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasInitializedCamera, setHasInitializedCamera] = useState(false);

  const checkBrowserSupport = () => {
    // Check HTTPS
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setError('Camera access requires HTTPS. Please use a secure connection.');
      return false;
    }

    // Check if running in a supported browser
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    
    if (!isChrome && !isSafari && !isFirefox) {
      setError('Please use a modern browser like Chrome, Firefox, or Safari (on iOS).');
      return false;
    }

    return true;
  };
  const initializeScanner = async () => {
    if (!videoRef.current) return;
    videoRef.current.innerHTML = ''; // Clear any previous content
    setIsInitializing(true);
    setError('');

    try {
      // First check browser support
      if (!checkBrowserSupport()) {
        setIsInitializing(false);
        return;
      }

      // Ensure mediaDevices is available
      if (!navigator?.mediaDevices?.getUserMedia) {
        setError('Camera access is not supported in your browser.\n\nPlease try:\n1. Using Chrome or Safari\n2. Updating your browser\n3. Using HTTPS');
        setIsInitializing(false);
        return;
      }

      // Stop any existing streams
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Request camera access
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });
        
        streamRef.current = stream;

        // Create a video element to ensure stream is ready
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.play();

        // Wait for video to be ready
        await new Promise<void>((resolve) => {
          videoElement.onloadedmetadata = () => {
            resolve();
          };
        });

      } catch (err) {
        console.error('Camera permission error:', err);
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setError('To enable camera access:\n\n1. Tap the lock icon (🔒) in the address bar\n2. Tap "Permissions"\n3. Enable "Camera"\n4. Tap "Try Again" below');
          } else {
            setError('Camera access failed. Make sure you\'re using a supported browser and have a working camera.');
          }
        }
        setIsInitializing(false);
        return;
      }

      // Initialize Quagga with a small delay to ensure video is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Stop any existing Quagga instance
      try {
        await Quagga.stop();
      } catch (e) {
        // Ignore errors from stopping non-existent instance
      }

      await Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            facingMode: { ideal: "environment" },
            width: { min: 240, ideal: 640, max: 1280 },
            height: { min: 240, ideal: 480, max: 720 },
            aspectRatio: { min: 1, max: 2 }
          },
          area: {
            top: "25%",
            right: "25%",
            left: "25%",
            bottom: "25%",
          }
        },
        frequency: 10,
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "upc_reader",
            "upc_e_reader"
          ]
        },
        locate: true
      });

      await Quagga.start();
      setHasInitializedCamera(true);
      console.log('Camera initialized successfully');
    } catch (err) {
      console.error('Scanner initialization failed:', err);
      setError('Failed to start the camera. Please try:\n\n1. Refreshing the page\n2. Checking camera permissions\n3. Using a different browser (Chrome/Safari)');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      // Clean up when modal is closed
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      try {
        Quagga.stop();
      } catch (e) {
        // Ignore errors from stopping non-existent instance
      }
      setHasInitializedCamera(false);
      return;
    }
    
    initializeScanner();

    const onDetected = (data: any) => {
      if (data.codeResult?.code) {
        console.log('Barcode detected:', data.codeResult.code);
        Quagga.stop();
        onClose();
        router.push(`/parts?barcode=${data.codeResult.code}`);
      }
    };

    Quagga.onDetected(onDetected);

    return () => {
      Quagga.offDetected(onDetected);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      try {
        Quagga.stop();
      } catch (e) {
        // Ignore errors from stopping non-existent instance
      }
    };
  }, [isOpen, onClose, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-lg mx-4 mt-16">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Scan Barcode</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>
        
        <div className="relative">
          <div 
            ref={videoRef}
            className="w-full aspect-video bg-black rounded-lg overflow-hidden"
          />
          {isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
              Initializing camera...
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
              <div className="text-center p-4 max-w-sm">
                <p className="text-red-400 mb-4 whitespace-pre-line">{error}</p>
                <div className="flex flex-col gap-2">
                  {!hasInitializedCamera && (
                    <button
                      onClick={initializeScanner}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Try Again
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Position the barcode within the scanner area. The scan will happen automatically.
        </p>
      </div>
    </div>
  );
}
