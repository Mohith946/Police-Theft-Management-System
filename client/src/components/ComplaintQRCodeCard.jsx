import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Printer, QrCode } from 'lucide-react';

const ComplaintQRCodeCard = ({ complaint }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/qr/generate/complaint/${complaint._id}`);
        if (response.data.success) {
          setQrData(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error('Failed to retrieve complaint QR code:', err.message);
        setError('Failed to load QR code image');
      } finally {
        setLoading(false);
      }
    };

    if (complaint && complaint._id) {
      fetchQR();
    }
  }, [complaint]);

  const handleDownload = () => {
    if (!qrData || !qrData.qrCodeDataURL) return;
    const link = document.createElement('a');
    link.href = qrData.qrCodeDataURL;
    link.download = `${complaint.complaintNumber}_QR_label.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Complaint QR Label</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
            img { width: 250px; height: 250px; }
            h2 { margin-bottom: 5px; }
            p { color: #666; margin: 0; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <h2>Complaint: ${complaint.complaintNumber}</h2>
          <p>Title: ${complaint.title}</p>
          <img src="${qrData.qrCodeDataURL}" alt="QR code" />
          <p style="font-size: 11px; margin-top: 10px;">Token: ${complaint.qrCodeToken}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="glass-panel p-6 text-center min-h-[220px] flex items-center justify-center">
        <div>
          <QrCode size={32} className="text-primary animate-pulse mx-auto" />
          <p className="text-slate-400 text-xs mt-2">Generating QR Label...</p>
        </div>
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div className="glass-panel p-6 text-center text-danger text-xs">
        <p className="m-0">{error || 'Failed to render QR Code'}</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 flex flex-col items-center gap-4 max-w-xs mx-auto w-full">
      <div className="text-center">
        <h3 className="text-sm font-bold text-slate-900 m-0">
          {complaint.complaintNumber}
        </h3>
        <span className="status-badge status-stolen text-[9px] mt-1.5">Case QR Label</span>
      </div>

      {/* QR Code Container */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 flex items-center justify-center">
        <img 
          src={qrData.qrCodeDataURL} 
          alt="Complaint QR Code" 
          className="w-44 h-44 block"
        />
      </div>

      <div className="w-full text-[10px] text-slate-400 font-mono break-all text-center">
        <p className="m-0">Token: {complaint.qrCodeToken}</p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 w-full">
        <button 
          onClick={handleDownload} 
          className="btn btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
        >
          <Download size={14} />
          <span>Save</span>
        </button>
        <button 
          onClick={handlePrint} 
          className="btn btn-secondary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
        >
          <Printer size={14} />
          <span>Print</span>
        </button>
      </div>
    </div>
  );
};

export default ComplaintQRCodeCard;
