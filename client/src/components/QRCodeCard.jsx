import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Download, Printer, QrCode } from 'lucide-react';

const QRCodeCard = ({ item }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/qr/generate/${item._id}`);
        if (response.data.success) {
          setQrData(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error('Failed to retrieve QR code:', err.message);
        setError('Failed to load QR code image');
      } finally {
        setLoading(false);
      }
    };

    if (item && item._id) {
      fetchQR();
    }
  }, [item]);

  const handleDownload = () => {
    if (!qrData || !qrData.qrCodeDataURL) return;
    const link = document.createElement('a');
    link.href = qrData.qrCodeDataURL;
    link.download = `${item.itemName.replace(/\s+/g, '_')}_QR_label.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Label</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
            img { width: 250px; height: 250px; }
            h2 { margin-bottom: 5px; }
            p { color: #666; margin: 0; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <h2>${item.itemName}</h2>
          <p>Serial: ${item.serialNumber || 'N/A'}</p>
          <img src="${qrData.qrCodeDataURL}" alt="QR code" />
          <p style="font-size: 11px; margin-top: 10px;">Token: ${item.qrCodeToken}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
          <QrCode size={32} className="gradient-text" style={{ animation: 'pulse 1.5s infinite' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.5rem' }}>Generating QR Label...</p>
        </div>
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', color: '#ef4444' }}>
        <p>{error || 'Failed to render QR Code'}</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      maxWidth: '320px',
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '0.25rem' }}>{item.itemName}</h3>
        <span className="status-badge status-stolen" style={{ fontSize: '0.65rem' }}>STOLEN LABEL</span>
      </div>

      {/* QR Code Container */}
      <div style={{
        background: '#ffffff',
        padding: '1rem',
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img 
          src={qrData.qrCodeDataURL} 
          alt="Item QR Code" 
          style={{ width: '180px', height: '180px', display: 'block' }}
        />
      </div>

      <div style={{ width: '100%', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
        <p style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>Token: {item.qrCodeToken}</p>
        {item.serialNumber && <p style={{ marginTop: '0.25rem' }}>S/N: {item.serialNumber}</p>}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
        <button 
          onClick={handleDownload} 
          className="btn btn-secondary" 
          style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
        >
          <Download size={14} />
          <span>Save</span>
        </button>
        <button 
          onClick={handlePrint} 
          className="btn btn-secondary" 
          style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
        >
          <Printer size={14} />
          <span>Print</span>
        </button>
      </div>
    </div>
  );
};

export default QRCodeCard;
