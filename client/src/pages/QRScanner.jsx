import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { Scan, Camera, Upload, CheckCircle, RefreshCw, AlertCircle, User, Sparkles } from 'lucide-react';
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

      {/* RENDER SCANNED RESULTS PANEL */}
      {scanResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {scanResult.type === 'complaint' ? (
            /* COMPLAINT SCAN RESULT VIEW */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Complaint Overview Card */}
              <div className="glass-panel" style={{ padding: '2rem', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scanned Theft Case File</span>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 800, marginTop: '0.15rem' }}>{scanResult.complaint.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontFamily: 'monospace', fontWeight: 600, marginTop: '0.15rem' }}>
                      Case #: {scanResult.complaint.complaintNumber}
                    </p>
                  </div>
                  <span className={`status-badge status-${scanResult.complaint.status}`}>{scanResult.complaint.status}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Incident Category:</span>
                    <p style={{ textTransform: 'capitalize', fontWeight: 600 }}>{scanResult.complaint.category}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Theft Location:</span>
                    <p style={{ fontWeight: 600 }}>{scanResult.complaint.theftLocation}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Theft Date:</span>
                    <p style={{ fontWeight: 600 }}>{new Date(scanResult.complaint.theftDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Reporter Profile:</span>
                    <p style={{ fontWeight: 600 }}>{scanResult.complaint.reporterName} ({scanResult.complaint.reporterContact || 'no phone'})</p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Description Summary:</span>
                  <p style={{ fontSize: '0.85rem', lineHeight: '1.5', marginTop: '0.25rem' }}>{scanResult.complaint.description}</p>
                </div>
              </div>

              {/* Registered Items Card */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontWeight: 700 }}>
                  Associated Stolen Property ({scanResult.items.length})
                </h4>
                {scanResult.items.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No items listed for this complaint case.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {scanResult.items.map(item => (
                      <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.itemName}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>S/N: {item.serialNumber || 'N/A'} • Est: ₹{item.estimatedValue?.toLocaleString()}</p>
                        </div>
                        <span className={`status-badge status-${item.status}`}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Matched Suspects & History Card */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <Sparkles size={18} color="var(--primary)" />
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>
                    Matched Suspect & Criminal History ({scanResult.matches.length})
                  </h4>
                </div>

                {scanResult.matches.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '0.85rem' }}>No active suspect profiles match this complaint's characteristics yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {scanResult.matches.map(({ match, criminal, history }) => (
                      <div key={match._id} className="glass-panel" style={{ padding: '1.25rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        
                        {/* Suspect summary */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {criminal.photoUrl ? (
                                <img src={criminal.photoUrl} alt={criminal.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <User size={20} color="var(--text-muted)" />
                              )}
                            </div>
                            <div>
                              <h5 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>{criminal.name}</h5>
                              {criminal.aliases && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Aliases: {criminal.aliases}</p>}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{
                              background: match.matchScore >= 80 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                              color: match.matchScore >= 80 ? 'var(--danger)' : 'var(--primary)',
                              border: match.matchScore >= 80 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(79, 70, 229, 0.2)',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '20px',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              display: 'inline-block'
                            }}>
                              {Math.round(match.matchScore)}% Match
                            </div>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Similarity Score</p>
                          </div>
                        </div>

                        {/* Physical Traits */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                            <span style={{ fontWeight: 600, marginLeft: '0.25rem', textTransform: 'capitalize' }}>{criminal.status}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Gender:</span>
                            <span style={{ fontWeight: 600, marginLeft: '0.25rem', textTransform: 'capitalize' }}>{criminal.gender}</span>
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Last Location:</span>
                            <span style={{ fontWeight: 600, marginLeft: '0.25rem' }}>{criminal.lastKnownLocation}</span>
                          </div>
                          {criminal.physicalFeatures?.tattoos && criminal.physicalFeatures.tattoos !== 'none' && (
                            <div style={{ gridColumn: 'span 2' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Tattoos:</span>
                              <span style={{ marginLeft: '0.25rem' }}>{criminal.physicalFeatures.tattoos}</span>
                            </div>
                          )}
                          {criminal.physicalFeatures?.scars && criminal.physicalFeatures.scars !== 'none' && (
                            <div style={{ gridColumn: 'span 2' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Scars:</span>
                              <span style={{ marginLeft: '0.25rem' }}>{criminal.physicalFeatures.scars}</span>
                            </div>
                          )}
                        </div>

                        {/* CRIMINAL CASE HISTORY LOG */}
                        <div style={{ marginTop: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                            Other Matches on File (Suspect Crime Log)
                          </span>
                          {history.length === 0 ? (
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                              No other matching cases found in database.
                            </p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                              {history.map(hist => (
                                <div key={hist._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{hist.complaintId?.title}</span>
                                    <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{hist.complaintId?.complaintNumber}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontWeight: 700, color: hist.matchScore >= 80 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                                      {Math.round(hist.matchScore)}%
                                    </span>
                                    <span className={`status-badge status-${hist.complaintId?.status}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                                      {hist.complaintId?.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Scanned Item Card Details */
            <>
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
            </>
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
