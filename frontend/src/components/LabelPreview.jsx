import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import BarcodeGenerator from './BarcodeGenerator';
import QRCodeGenerator from './QRCodeGenerator';
import { Copy, Download, Printer, Check } from 'lucide-react';

const LabelPreview = ({ data, labelSize, templateId, logoPreview, isSaved, onSave }) => {
  const labelRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  if (!data) return null;

  // Determine width/height in pixels for preview & canvas generation
  let dimensions = { width: '400px', height: '600px' }; // 4x6 ratio (1:1.5)
  if (labelSize === 'A6') {
    dimensions = { width: '400px', height: '565px' }; // A6 ratio (1:1.41)
  } else if (labelSize === 'A5') {
    dimensions = { width: '550px', height: '778px' }; // A5 ratio (1:1.41)
  }

  // Format date helper
  const formatDate = (dateString) => {
    const d = dateString ? new Date(dateString) : new Date();
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Copy details to clipboard
  const handleCopyDetails = () => {
    const text = `
LabelForge Shipping Details:
---------------------------
Tracking ID: ${data.trackingNumber}
Order ID   : ${data.orderId || 'N/A'}
Receiver   : ${data.receiverName}
Phone      : ${data.phoneNumber}
Address    : ${data.address}, ${data.city || ''}, ${data.state || ''} - ${data.pincode || ''}
Weight     : ${data.weight || '0'} kg
COD Amount : ${data.codAmount || '0.00'}
Date       : ${formatDate(data.generatedAt)}
Notes      : ${data.notes || 'None'}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export to PDF
  const handleDownloadPDF = async () => {
    // If not saved in database yet, save it first
    if (!isSaved && onSave) {
      const success = await onSave();
      if (!success) return;
    }

    const element = labelRef.current;
    if (!element) return;

    try {
      // Create high-res canvas
      const canvas = await html2canvas(element, {
        scale: 3, // High scale for clear text/barcodes
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');

      // PDF dimensions in mm
      let pdfWidth = 101.6; // 4 inches
      let pdfHeight = 152.4; // 6 inches

      if (labelSize === 'A6') {
        pdfWidth = 105;
        pdfHeight = 148;
      } else if (labelSize === 'A5') {
        pdfWidth = 148;
        pdfHeight = 210;
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`shipping-label-${data.trackingNumber}.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  // Print Action
  const handlePrint = async () => {
    // If not saved in database yet, save it first
    if (!isSaved && onSave) {
      const success = await onSave();
      if (!success) return;
    }
    window.print();
  };

  // QR Code Content (Receiver details & Tracking)
  const qrValue = `LBL:${data.trackingNumber}|REC:${data.receiverName}|TEL:${data.phoneNumber}|ZIP:${data.pincode || ''}`;

  return (
    <div className="flex flex-col items-center">
      {/* Action Bar */}
      <div className="mb-6 flex flex-wrap justify-center gap-3 no-print w-full max-w-md">
        <button
          onClick={handleCopyDetails}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy Details'}
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <Printer className="h-4 w-4" />
          Print Label
        </button>
      </div>

      {/* Label Box (Rendered exactly in black/white for logistics standards) */}
      <div className="w-full max-w-full overflow-auto bg-slate-100 p-4 dark:bg-slate-800/40 rounded-lg flex justify-center">
        <div
          ref={labelRef}
          id="printable-label"
          style={{ width: dimensions.width, height: dimensions.height }}
          className="relative bg-white text-black border-2 border-black p-4 flex flex-col justify-between select-none font-sans overflow-hidden box-border shadow-sm"
        >
          
          {/* ==================== TEMPLATE 1: SIMPLE COURIER LABEL ==================== */}
          {templateId === '1' && (
            <div className="flex flex-col h-full justify-between text-xs">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-black pb-2">
                <div className="h-10 max-w-[120px] flex items-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="font-mono font-bold text-sm tracking-wider uppercase border border-black px-1.5 py-0.5">MY LOGO</span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-sm">{data.trackingNumber}</p>
                </div>
              </div>

              {/* Sender/Receiver Details */}
              <div className="grid grid-cols-1 gap-2 py-2 flex-1">
                <div>
                  <span className="text-[9px] font-bold uppercase block text-slate-500">SHIP TO:</span>
                  <p className="font-bold text-sm leading-tight">{data.receiverName}</p>
                  <p className="text-xs leading-normal whitespace-pre-wrap">{data.address}</p>
                  <p className="font-semibold">{data.city}, {data.state} - {data.pincode}</p>
                  <p className="font-semibold mt-1">Tel: {data.phoneNumber}</p>
                </div>

                <div className="border-t border-dashed border-black pt-2 grid grid-cols-3 gap-1 text-[10px]">
                  <div>
                    <span className="text-[9px] font-bold uppercase block text-slate-500">Weight</span>
                    <p className="font-semibold">{data.weight || '0'} {data.weightUnit || 'kg'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase block text-slate-500">Order ID</span>
                    <p className="font-mono font-semibold truncate">{data.orderId || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase block text-slate-500">Date</span>
                    <p className="font-semibold">{formatDate(data.generatedAt)}</p>
                  </div>
                  {data.codAmount && parseFloat(data.codAmount) > 0 ? (
                    <div className="col-span-3 border border-black p-1 text-center bg-slate-50 font-bold text-xs mt-1">
                      COD AMOUNT: ₹{data.codAmount}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Barcode Area */}
              <div className="border-t border-black pt-3 flex flex-col items-center">
                <BarcodeGenerator value={data.orderId || data.trackingNumber} height={50} width={1.6} />
              </div>
            </div>
          )}

          {/* ==================== TEMPLATE 2: PROFESSIONAL SHIPPING LABEL ==================== */}
          {templateId === '2' && (
            <div className="flex flex-col h-full justify-between text-xs">
              {/* Top Row with Logo & QR Code */}
              <div className="flex justify-between items-start border-b-2 border-black pb-2">
                <div className="h-10 max-w-[120px] flex items-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="font-mono font-bold text-sm tracking-wider uppercase border border-black px-1.5 py-0.5">LOGO</span>
                  )}
                </div>
                <div className="flex flex-col items-end">
                  <QRCodeGenerator value={qrValue} size={64} />
                </div>
              </div>

              {/* SHIP TO Block */}
              <div className="border-b border-black py-2">
                <span className="text-[9px] font-extrabold uppercase bg-black text-white px-1 py-0.5 inline-block mb-1">SHIP TO</span>
                <p className="font-bold text-sm">{data.receiverName}</p>
                <p className="text-xs whitespace-pre-wrap">{data.address}</p>
                <p className="font-semibold">{data.city}, {data.state} - {data.pincode}</p>
                <p className="font-semibold mt-0.5">Phone: {data.phoneNumber}</p>
              </div>

              {/* Order and COD details */}
              <div className="grid grid-cols-2 gap-2 py-2 text-xs flex-1">
                <div className="border-r border-slate-300 pr-2">
                  <span className="text-[9px] font-bold block text-slate-500 uppercase">Tracking Number</span>
                  <p className="font-mono font-bold text-xs">{data.trackingNumber}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold block text-slate-500 uppercase">Order Details</span>
                  <p className="font-mono text-[10px]">ID: {data.orderId || 'N/A'}</p>
                  <p className="font-semibold text-[10px]">Weight: {data.weight || '0'} {data.weightUnit || 'kg'}</p>
                  <p className="font-semibold text-[10px]">Date: {formatDate(data.generatedAt)}</p>
                </div>
                {data.codAmount && parseFloat(data.codAmount) > 0 ? (
                  <div className="col-span-2 border-2 border-black p-1 text-center font-bold text-sm bg-slate-50">
                    CASH ON DELIVERY (COD): ₹{data.codAmount}
                  </div>
                ) : (
                  <div className="col-span-2 border border-black border-dashed p-1 text-center font-bold text-xs text-slate-600">
                    PREPAID (NO COD)
                  </div>
                )}
                {data.notes && (
                  <div className="col-span-2 text-[9px] leading-tight text-slate-600 border-t border-slate-200 pt-1">
                    <span className="font-bold">Instructions:</span> {data.notes}
                  </div>
                )}
              </div>

              {/* Barcode Footer */}
              <div className="border-t-2 border-black pt-2 flex flex-col items-center">
                <BarcodeGenerator value={data.orderId || data.trackingNumber} height={45} width={1.5} />
              </div>
            </div>
          )}

          {/* ==================== TEMPLATE 3: COMPACT LABEL ==================== */}
          {templateId === '3' && (
            <div className="flex flex-col h-full justify-between text-[11px] leading-snug">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-black pb-1.5">
                <div className="h-8 max-w-[100px] flex items-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="font-mono font-bold text-xs uppercase border border-black px-1">DELIVER</span>
                  )}
                </div>
                <span className="font-bold font-mono text-xs">{data.trackingNumber}</span>
              </div>

              {/* Body */}
              <div className="py-2 flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-bold text-xs"><span className="font-normal text-slate-500">To:</span> {data.receiverName}</p>
                  <p className="text-[10px] leading-normal">{data.address}, {data.city}, {data.state} - {data.pincode}</p>
                  <p className="text-[10px] font-semibold">Phone: {data.phoneNumber}</p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-dashed border-slate-300 flex justify-between items-center text-[10px]">
                  <span>Weight: <b>{data.weight || '0'} {data.weightUnit || 'kg'}</b></span>
                  <span>Date: <b>{formatDate(data.generatedAt)}</b></span>
                  <span>ID: <b>{data.orderId || 'N/A'}</b></span>
                </div>
                {data.codAmount && parseFloat(data.codAmount) > 0 && (
                  <div className="mt-1 border border-black px-1 py-0.5 text-center font-bold text-xs bg-slate-50">
                    COD: ₹{data.codAmount}
                  </div>
                )}
              </div>

              {/* Barcode Footer */}
              <div className="border-t border-black pt-1.5 flex flex-col items-center">
                <BarcodeGenerator value={data.trackingNumber} height={35} width={1.4} displayValue={false} />
                <span className="font-mono text-[9px] mt-0.5">{data.trackingNumber}</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LabelPreview;
