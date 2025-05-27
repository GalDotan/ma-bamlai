'use client';

import React, { useState, useRef } from 'react';
import { Printer, Download } from 'lucide-react';
import JsBarcode from 'jsbarcode';

interface Part {
  id: string;
  partNumber: number;
  name: string;
  partType: string;
  typt: string;
  location: string;
  quantity: number;
}

interface LabelPrinterProps {
  parts: Part[];
}

export function LabelPrinter({ parts }: LabelPrinterProps) {
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);  const generateBarcode = (partNumber: number): string => {
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, partNumber.toString(), {
        format: "CODE128",
        width: 3,
        height: 60,
        displayValue: false,
        margin: 0,
      });
      return canvas.toDataURL();
    } catch (error) {
      console.error('Barcode generation failed:', error);
      return '';
    }
  };
  const generateLabelsForPart = (part: Part) => {
    if (part.partType === 'component') {
      // Component: single 3x3cm label with name and barcode
      return [
        <div key={`${part.id}-component`} className="component-label">
          <div className="component-name">{part.name}</div>
          <div className="component-barcode">
            <img 
              src={generateBarcode(part.partNumber)} 
              alt={`Barcode ${part.partNumber}`}
              className="barcode-img"
            />
          </div>
        </div>
      ];
    } else {
      // Consumable: two labels - name label (1.5x4.5cm) and barcode label (3x3cm)
      return [
        <div key={`${part.id}-name`} className="consumable-name-label">
          <div className="consumable-name-text">{part.name}</div>
        </div>,
        <div key={`${part.id}-barcode`} className="consumable-barcode-label">
          <div className="consumable-part-number">#{part.partNumber}</div>
          <div className="consumable-barcode">
            <img 
              src={generateBarcode(part.partNumber)} 
              alt={`Barcode ${part.partNumber}`}
              className="barcode-img"
            />
          </div>
        </div>
      ];
    }
  };

  const handleSelectAll = () => {
    if (selectedParts.length === parts.length) {
      setSelectedParts([]);
    } else {
      setSelectedParts(parts.map(p => p.id));
    }
  };

  const handlePartSelect = (partId: string) => {
    setSelectedParts(prev => 
      prev.includes(partId) 
        ? prev.filter(id => id !== partId)
        : [...prev, partId]
    );
  };

  const selectedPartsData = parts.filter(p => selectedParts.includes(p.id));
  const renderLabelsPreview = () => {
    const allLabels: React.ReactElement[] = [];
    
    selectedPartsData.forEach(part => {
      const partLabels = generateLabelsForPart(part);
      allLabels.push(...partLabels);
    });
    
    return allLabels;
  };
  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Parts Labels</title>
            <style>
              @page {
                size: A4;
                margin: 5mm;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }              body {
                font-family: 'Open Sans', Arial, sans-serif;
                background: white;
                color: black;
              }
              @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');
              
              .labels-container {
                display: flex;
                flex-wrap: wrap;
                gap: 6mm;
                width: 100%;
                align-items: flex-start;
              }
                /* Component Labels - 3x3cm with cutting outline */
              .component-label {
                width: 24mm;
                height: 24mm;
                border: 1px solid #000;
                padding: 2mm;
                page-break-inside: avoid;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                background: white;
                position: relative;
                margin: 3mm;
              }
              .component-name {
                font-family: 'Open Sans', Arial, sans-serif;
                font-size: clamp(20px, 4.6vw, 48px); /* Increased the range for larger text */
                font-weight: 700;
                color: #000;
                text-align: center;
                line-height: 1.0;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                margin-bottom: 0mm; 
                margin-top: 0mm
              }
              .component-barcode {
                text-align: center;
                flex-grow: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 0mm; 
                margin-top: 0mm
              }
                /* Consumable Name Labels - 1.5x4.5cm with cutting outline */
              .consumable-name-label {
                width: 40mm;
                height: 13mm;
                border: 1px solid #000;
                padding: 0mm;
                page-break-inside: avoid;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
                position: relative;
                margin: 3mm;
              }
              .consumable-name-text {
                font-family: 'Open Sans', Arial, sans-serif;
                font-size: clamp(22px, 3.3vw, 52px); /* Increased the range for larger text */
                font-weight: 700;
                color: #000;
                text-align: center;
                line-height: 1.0;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 1;
                -webkit-box-orient: vertical;
              }
                /* Consumable Barcode Labels - 3x3cm with cutting outline */
              .consumable-barcode-label {
                width: 30mm;
                height: 20mm;
                border: 1px solid #000;
                padding: 3mm;
                page-break-inside: avoid;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                background: white;
                position: relative;
                margin: 3mm;
              }
              .consumable-part-number {
                font-family: 'Open Sans', Arial, sans-serif;
                font-size: clamp(18px, 2vw, 40px); /* Increased the range for larger text */
                font-weight: 600;
                color: #000;
                text-align: center;
                margin-bottom: 1mm;
              }.consumable-barcode {
                text-align: center;
                flex-grow: 1;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              /* Barcode styling */
              .barcode-img {
                max-width: 110%;
                max-height: 110%;
                object-fit: contain;
                margin: 0 ;
              }
              
              @media print {
                body { -webkit-print-color-adjust: exact; }
                .labels-container { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            ${printRef.current.innerHTML}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownloadPDF = () => {
    // For now, just trigger print - user can save as PDF from print dialog
    handlePrint();
  };

  return (
    <div className="bg-[#181A1B] rounded-xl p-6 border-2 border-[#e74c3c] shadow-lg">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Printer className="w-6 h-6" />
        Label Printer
      </h2>
      
      <div className="mb-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {selectedParts.length === parts.length ? 'Deselect All' : 'Select All'}
          </button>
          <button
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            disabled={selectedParts.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview ({selectedParts.length})
          </button>
          <button
            onClick={handlePrint}
            disabled={selectedParts.length === 0}
            className="px-4 py-2 bg-[#e74c3c] text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Printer className="w-4 h-4" />
            Print Labels
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={selectedParts.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto bg-gray-800 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {parts.map(part => (
              <label key={part.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedParts.includes(part.id)}
                  onChange={() => handlePartSelect(part.id)}
                  className="rounded"
                />                <div className="text-sm">
                  <div className="text-white font-medium">#{part.partNumber}</div>
                  <div className="text-gray-400 text-xs">{part.name}</div>
                  <div className="text-blue-400 text-xs">{part.partType}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>      {isPreviewOpen && selectedParts.length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-lg">
          <h3 className="text-lg font-bold text-black mb-4">Label Preview (A4 Format)</h3>
          <div ref={printRef} className="labels-container">
            {renderLabelsPreview()}
          </div>
          
          <style jsx>{`
            @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');
            
            .labels-container {
              display: flex;
              flex-wrap: wrap;
              gap: 6mm;
              width: 100%;
              align-items: flex-start;
            }
            
            .component-label {
              width: 24mm;
              height: 24mm;
              border: 1px solid #000;
              padding: 1mm 3mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: white;
              position: relative;
              margin: 3mm;
            }
              .component-name {
              font-family: 'Open Sans', Arial, sans-serif;
              font-size: clamp(20px, 3vw, 48px); /* Increased the range for larger text */
              font-weight: 700;
              color: #000;
              text-align: center;
              line-height: 1.0;
              overflow: hidden;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              margin-bottom: 0.5mm; /* Made the space between text and barcode really small */
            }
            
            .component-barcode {
              text-align: center;
              flex-grow: 1;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .consumable-name-label {
              width: 45mm;
              height: 15mm;
              border: 1px solid #000;
              padding: 3mm;
              display: flex;
              align-items: center;
              justify-content: center;
              background: white;
              position: relative;
              margin: 3mm;
            }
              .consumable-name-text {
              font-family: 'Open Sans', Arial, sans-serif;
              font-size: clamp(22px, 3.5vw, 52px); /* Increased the range for larger text */
              font-weight: 700;
              color: #000;
              text-align: center;
              line-height: 1.0;
              overflow: hidden;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }
            
            .consumable-barcode-label {
              width: 30mm;
              height: 30mm;
              border: 1px solid #000;
              padding: 3mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background: white;
              position: relative;
              margin: 3mm;
            }
              .consumable-part-number {
              font-family: 'Open Sans', Arial, sans-serif;
              font-size: clamp(18px, 2vw, 40px); /* Increased the range for larger text */
              font-weight: 600;
              color: #000;
              text-align: center;
              margin-bottom: 1mm;
            }
            
            .consumable-barcode {
              text-align: center;
              flex-grow: 1;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .barcode-img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
          `}</style>
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Label Specifications:</strong></p>
            <ul className="list-disc list-inside mt-2">
              <li><strong>Components:</strong> Single 3x3cm label with name and barcode</li>
              <li><strong>Consumables:</strong> Two labels per part:
                <ul className="list-disc list-inside ml-4">
                  <li>Name label: 1.5x4.5cm</li>
                  <li>Barcode label: 3x3cm with part number and barcode</li>
                </ul>
              </li>
              <li>Black outline with 3mm cutting margin around each label</li>
              <li>Open Sans font, maximized text size for readability</li>
              <li>Optimized for A4 paper (210mm × 297mm)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
