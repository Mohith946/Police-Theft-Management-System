import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { Scan, Camera, Upload, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [scannerActive, setScannerActive] = useState(true);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'upload'
  
  // Recovery parameters
  const [recoveryLocation, setRecoveryLocation] = useState('');
  const [recovering, setRecovering] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  // Initialize html5 webcam scanner
  useEffect(() => {
    let scanner = null;
    if (scanMode === 'camera' && scannerActive && !scanResult) {
      // Clear container just in case
      const container = document.getElementById('webcam-scanner-container');
      if (container) container.innerHTML = '';

      scanner = new Html5QrcodeScanner('webcam-scanner-container', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      }, false);

      scanner.render(
        (decodedText) => {
          handleTokenScanned(decodedText);
          scanner.clear();
        },
        (error) => {
          // Silent scan failure check
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.warn('Scanner clear failure', err));
      }
    };
  }, [scanMode, scannerActive, scanResult]);

  // Handle scanned token
  const handleTokenScanned = async (token) => {
    try {
      setScanError('');
      setRecoverySuccess(false);
      const response = await axios.post('/api/qr/scan', { token });
      if (response.data.success) {
        setScanResult(response.data.data);
        setScannerActive(false);
      } else {
        setScanError('Token scanned, but no registered item matches in database.');
      }
    } catch (err) {
      console.error('Scan API error:', err);
      setScanError(err.response?.data?.message || 'Invalid or unregistered QR code label scanned.');
    }
  };

  // Scan from photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setScanError('');
      const html5QrCode = new Html5Qrcode('file-scanner-dummy');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleTokenScanned(decodedText);
    } catch (err) {
      console.error('File scan error:', err);
      setScanError('Could not decode QR code from image file. Make sure the QR code is clearly visible.');
    }
  };

  // Perform item recovery
  const handleRecover = async (e) => {
    e.preventDefault();
    if (!recoveryLocation.trim() || !scanResult) return;

    try {
      setRecovering(true);
      const response = await axios.post('/api/qr/scan', {
        token: scanResult.qrCodeToken,
        action: 'recover',
        recoveryLocation
      });

      if (response.data.success) {
        setScanResult(response.data.data); // Update status in view
        setRecoverySuccess(true);
        setRecoveryLocation('');
      }
    } catch (err) {
      console.error('Recovery failed:', err);
      alert('Failed to register recovery details.');
    } finally {
      setRecovering(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setScanError('');
    setScannerActive(true);
    setRecoverySuccess(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Invisible dummy scanner div for file scanning uploads */}
      <div id="file-scanner-dummy" style={{ display: 'none' }}></div>

      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>QR Code Recovery Scanner</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Scan physical item labels using device camera or file upload to register property recovery
        </p>
      </div>

      {scanError && (
        <div style={{
          background: 'rgba(186, 26, 26, 0.08)',
          border: '1px solid rgba(186, 26, 26, 0.25)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem',
          color: 'var(--danger)',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'center'
        }}>
          <AlertCircle size={16} />
          <span>{scanError}</span>
        </div>
      )}

      {/* RENDER SCANNER SCREEN */}
      {!scanResult && (
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
          {/* Toggle camera/file */}
          <div className="glass-panel" style={{ padding: '0.25rem', display: 'flex', gap: '0.25rem', borderRadius: '10px', background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
            <button
              onClick={() => setScanMode('camera')}
              className="btn"
              style={{
                padding: '0.4rem 0.9rem',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: scanMode === 'camera' ? '#3b82f6' : 'transparent',
                color: scanMode === 'camera' ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: 'none'
              }}
            >
              <Camera size={12} style={{ marginRight: '0.25rem' }} />
              <span>Live Camera</span>
            </button>
            <button
              onClick={() => setScanMode('upload')}
              className="btn"
              style={{
                padding: '0.4rem 0.9rem',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: scanMode === 'upload' ? '#3b82f6' : 'transparent',
                color: scanMode === 'upload' ? '#ffffff' : 'var(--text-secondary)',
                boxShadow: 'none'
              }}
            >
              <Upload size={12} style={{ marginRight: '0.25rem' }} />
              <span>Upload Image</span>
            </button>
          </div>

          {/* Webcam Scanner Panel */}
          {scanMode === 'camera' ? (
            <div 
              id="webcam-scanner-container" 
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '340px',
                minHeight: '340px',
                borderRadius: '16px',
                overflow: 'hidden',
                borderColor: 'var(--border-color)'
              }}
            ></div>
          ) : (
            /* Upload Scanner Panel */
            <div style={{
              width: '100%',
              maxWidth: '340px',
              height: '240px',
              border: '2px dashed var(--border-color)',
              background: 'var(--bg-secondary)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              cursor: 'pointer'
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
                id="qr-file-upload"
              />
              <label htmlFor="qr-file-upload" style={{ textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Scan size={36} color="#3b82f6" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.5rem' }}>
                  Select QR Label Image
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Decodes snapshot of QR sticker
                </span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* RENDER SCANNED ITEM RESULTS PANEL */}
      {scanResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Scanned Card Details */}
          <div className="glass-panel" style={{ padding: '2rem', borderLeft: `4px solid ${scanResult.status === 'recovered' ? 'var(--success)' : 'var(--danger)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scanned Property</span>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 700 }}>{scanResult.itemName}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '0.15rem' }}>
                  Token: {scanResult.qrCodeToken}
                </p>
              </div>
              <span className={`status-badge status-${scanResult.status}`}>{scanResult.status}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Category:</span>
                <p style={{ textTransform: 'capitalize', fontWeight: 600 }}>{scanResult.category}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Serial / Identification S/N:</span>
                <p style={{ fontFamily: 'monospace', fontWeight: 600 }}>{scanResult.serialNumber || 'N/A'}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Estimated Value:</span>
                <p style={{ fontWeight: 600 }}>₹{scanResult.estimatedValue ? scanResult.estimatedValue.toLocaleString() : '0.00'}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Linked Incident case:</span>
                <p style={{ fontWeight: 600 }}>{scanResult.complaintId?.complaintNumber || 'N/A'}</p>
              </div>
            </div>

            {scanResult.status === 'recovered' && (
              <div style={{
                marginTop: '1.5rem',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                fontSize: '0.8rem',
                color: 'var(--success)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
                  <CheckCircle size={14} />
                  <span>Property Successfully Recovered</span>
                </div>
                <p style={{ marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                  Recovered on {formatDate(scanResult.recoveredDate)} at: {scanResult.recoveryLocation}
                </p>
              </div>
            )}
          </div>

          {/* Recovery submission form if property is still status: 'stolen' */}
          {scanResult.status === 'stolen' && (
            <form onSubmit={handleRecover} className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <CheckCircle size={18} color="var(--success)" />
                <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Register Recovery Findings</h3>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Recovery Location Coordinates / Area *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Found at pawn shop / 12 Downtown St"
                  value={recoveryLocation}
                  onChange={e => setRecoveryLocation(e.target.value)}
                  required
                  disabled={recovering}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', background: 'var(--success)', color: '#ffffff' }}
                disabled={recovering || !recoveryLocation.trim()}
              >
                <span>{recovering ? 'Saving recovery details...' : 'Confirm Property Recovery'}</span>
              </button>
            </form>
          )}

          {/* Return button */}
          <button onClick={resetScanner} className="btn btn-secondary" style={{ width: '100%' }}>
            <RefreshCw size={16} />
            <span>Scan Another Label</span>
          </button>

        </div>
      )}
    </div>
  );
};

export default QRScanner;
