'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Download } from 'lucide-react';

interface BarcodeDisplayProps {
  barcode: string;
  name: string;
}

export function BarcodeDisplay({ barcode, name }: BarcodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && barcode) {      JsBarcode(canvasRef.current, barcode, {
        format: "CODE128",
        width: 1.5,
        height: 50,
        displayValue: true,
        fontSize: 12,
        margin: 5,
        background: "#ffffff"
      });
    }
  }, [barcode]);

  const downloadBarcode = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_barcode.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg">
      <canvas ref={canvasRef} />
      <button
        onClick={downloadBarcode}
        className="flex items-center gap-2 px-4 py-2 bg-[#e74c3c] text-white rounded-md hover:bg-[#c0392b] transition-colors"
      >
        <Download size={20} />
        Download Barcode
      </button>
    </div>
  );
}
