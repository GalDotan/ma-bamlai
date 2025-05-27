// src/components/BarcodeScanner.tsx
'use client';

import { useEffect, useState } from "react";
import ScanbotSDK from 'scanbot-web-sdk/ui';
import { Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';


export function BarcodeScanner() {
  const [scanResult, setScanResult] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      await ScanbotSDK.initialize({
        licenseKey: "",
        enginePath: "/wasm/"
      });
    };

    init();
  }, []);

  const startScanner = async () => {
    const config = new ScanbotSDK.UI.Config.BarcodeScannerScreenConfiguration();

    config.palette.sbColorPrimary = "#111317";
    config.palette.sbColorSecondary = "#e74c3c";
    config.topBar.mode = 'GRADIENT';
    config.actionBar.flashButton.visible = true;
    config.actionBar.zoomButton.visible = true;

    const useCase = new ScanbotSDK.UI.Config.SingleScanningMode();
    useCase.arOverlay.automaticSelectionEnabled = true;
    useCase.arOverlay.visible = true;


  config.vibration.enabled = true;

  config.useCase = useCase;

    const result = await ScanbotSDK.UI.createBarcodeScanner(config);

    if (result && result.items.length > 0) {
      const scannedPartNumber = result.items[0].barcode.text;
      setScanResult(scannedPartNumber);

      try {
        // Fetch the part details using the scanned part number
        const response = await fetch(`/api/parts/by-partnumber/${scannedPartNumber}`);
        if (!response.ok) {
          throw new Error('Failed to fetch part details');
        }

        const part = await response.json();

        // Navigate to the part's page using its ID
        router.push(`/parts/${part.id}`);
      } catch (error) {
        console.error('Error fetching part details:', error);
        alert('Failed to find the part with the scanned number.');
      }
    }

    return result;
  };

  return (<div>
    <button
      className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-gray-800 border-2 border-[#e74c3c]/60 hover:bg-[#e74c3c] hover:border-[#e74c3c] transition-all duration-150 shadow-md group"
      aria-label="Scan barcode"
      onClick={startScanner}
    >
      <Camera className="w-4 h-4 md:w-6 md:h-6 text-[#e74c3c] group-hover:text-white" />
    </button>
    {scanResult && <div>Scanned Part Number: {scanResult}</div>}
  </div>);
}
