'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Quagga from '@ericblade/quagga2';

interface QuaggaResult {
  codeResult: {
    code: string | null;
  };
}

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
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
  const [cameraFeatureWarning, setCameraFeatureWarning] = useState<string>('');

  const checkBrowserSupport = useCallback(() => {
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
  }, []);

  // Fetch available video input devices
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setVideoDevices(videoInputs);
        if (videoInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      } catch {
        // Ignore
      }
    })();
  }, [isOpen, selectedDeviceId]);

  const initializeScanner = useCallback(async () => {
    if (!videoRef.current) return;
    videoRef.current.innerHTML = '';
    setIsInitializing(true);
    setError('');
    setCameraFeatureWarning('');

    try {
      if (!checkBrowserSupport()) {
        setIsInitializing(false);
        return;
      }
      if (!navigator?.mediaDevices?.getUserMedia) {
        setError('Camera access is not supported in your browser.\n\nPlease try:\n1. Using Chrome or Safari\n2. Updating your browser\n3. Using HTTPS');
        setIsInitializing(false);
        return;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      // Request camera access with selected deviceId if available
      const baseVideoConstraints: MediaTrackConstraints = {
        facingMode: { ideal: 'environment' },
        width: { ideal: 640 },
        height: { ideal: 480 },
      };
      const videoConstraints: MediaTrackConstraints = { ...baseVideoConstraints };
      if (selectedDeviceId) {
        videoConstraints.deviceId = { exact: selectedDeviceId };
      }
      const constraints: MediaStreamConstraints = { video: videoConstraints };
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        // Try to set zoom/focusMode if supported
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack && typeof videoTrack.getCapabilities === 'function') {
          const caps = videoTrack.getCapabilities();
          // Try to set zoom to max if available
          if ('zoom' in caps && caps.zoom && typeof caps.zoom === 'object' && 'max' in caps.zoom) {
            try {
              const zoomConstraint: unknown = { advanced: [{ zoom: (caps.zoom as { max?: number }).max }] };
              await videoTrack.applyConstraints(zoomConstraint as MediaTrackConstraints);
            } catch {
              setCameraFeatureWarning('Could not set camera zoom.');
            }
          }
          // Try to set focusMode to continuous if available
          if ('focusMode' in caps) {
            const focusModes = (caps.focusMode as unknown) as string[];
            if (Array.isArray(focusModes) && focusModes.includes('continuous')) {
              try {
                const focusConstraint: unknown = { advanced: [{ focusMode: 'continuous' }] };
                await videoTrack.applyConstraints(focusConstraint as MediaTrackConstraints);
              } catch {
                setCameraFeatureWarning('Could not set autofocus.');
              }
            }
          } else {
            setCameraFeatureWarning('Autofocus not supported on this device/browser.');
          }
        } else {
          setCameraFeatureWarning('Advanced camera controls not supported in this browser.');
        }
        // Create a video element to ensure stream is ready
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.play();
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

      // Initialize Quagga with a longer delay to ensure video is ready
      await new Promise(resolve => setTimeout(resolve, 300));

      // Stop any existing Quagga instance
      try {
        await Quagga.stop();
      } catch {
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
            aspectRatio: { min: 1, max: 2 },
            // Prefer telephoto lens and enable autofocus if supported
            // advanced: [
            //   { zoom: 2 },
            // ]
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
            "code_128_reader"
          ]
        },
        locate: true
      });

      await Quagga.start();
      setHasInitializedCamera(true);
      console.log('Camera initialized successfully');
    } catch {
      setError('Failed to start the camera. Please try:\n\n1. Refreshing the page\n2. Checking camera permissions\n3. Using a different browser (Chrome/Safari)');
    } finally {
      setIsInitializing(false);
    }
  }, [checkBrowserSupport, videoRef, selectedDeviceId]);

  useEffect(() => {
    if (!isOpen) {
      // Clean up when modal is closed
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      try {
        Quagga.stop();
      } catch {
        // Ignore errors from stopping non-existent instance
      }
      setHasInitializedCamera(false);
      return;
    }
    
    void initializeScanner();

    const onDetected = (result: QuaggaResult) => {
      if (result.codeResult?.code) {
        console.log('Barcode detected:', result.codeResult.code);
        Quagga.stop();
        onClose();
        router.push(`/parts?barcode=${result.codeResult.code}`);
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
      } catch {
        // Ignore errors from stopping non-existent instance
      }
    };
  }, [isOpen, onClose, router, initializeScanner]);

  if (!isOpen) return null;

  return (
    <div className="mt-100 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
        {videoDevices.length > 1 && (
          <div className="mb-2">
            <label htmlFor="camera-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Camera</label>
            <select
              id="camera-select"
              className="w-full p-2 rounded border border-gray-300 dark:bg-gray-700 dark:text-white"
              value={selectedDeviceId}
              onChange={e => setSelectedDeviceId(e.target.value)}
              disabled={isInitializing}
            >
              {videoDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${device.deviceId}`}</option>
              ))}
            </select>
          </div>
        )}
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
          {cameraFeatureWarning && !error && (
            <div className="absolute bottom-0 left-0 right-0 bg-yellow-600 bg-opacity-80 text-white text-xs p-2 text-center rounded-b">
              {cameraFeatureWarning}
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
