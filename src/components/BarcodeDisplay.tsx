'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Download } from 'lucide-react';

interface BarcodeDisplayProps {
  value: string;
  name: string;
}

export function BarcodeDisplay({ value, name }: BarcodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        JsBarcode(canvasRef.current, value, {
          format: "CODE128",
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 14,
          textMargin: 8,
          background: "#181A1B",
          lineColor: "#e74c3c",
          margin: 10
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    }
  }, [value]);

  const downloadBarcode = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_barcode.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  };
  return (
    <div className="flex flex-col items-center space-y-3 p-4 bg-[#181A1B] rounded-lg border border-[#e74c3c]/30">
      <div className="text-sm text-gray-300 font-medium text-center">{name}</div>
      <canvas 
        ref={canvasRef} 
        className="max-w-full"
      />
      <button
        onClick={downloadBarcode}
        className="flex items-center gap-2 px-3 py-2 bg-[#e74c3c] text-white rounded-md hover:bg-[#c0392b] transition-colors text-sm"
      >
        <Download size={16} />
        Download Barcode
      </button>
    </div>
  );
}
