import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Scan, Camera, Upload, CheckCircle, RefreshCw, AlertCircle, User, Sparkles } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { getUploadUrl } from '../utils/imageUtils';

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
    let isMounted = true;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!isMounted) return;

        if (scanMode === 'camera' && scannerActive && !scanResult) {
          // Clear container just in case
          const container = document.getElementById('webcam-scanner-container');
          if (container) container.innerHTML = '';

          scanner = new Html5Qrcode('webcam-scanner-container');

          await scanner.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0
            },
            (decodedText) => {
              handleTokenScanned(decodedText);
              if (scanner && scanner.isScanning) {
                scanner.stop().catch(err => console.warn('Scanner stop failure', err));
              }
            },
            (error) => {
              // Silent scan failure check
            }
          );
        }
      } catch (err) {
        console.error('Failed to load html5-qrcode scanner dynamically:', err);
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(err => console.warn('Scanner stop failure', err));
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
      const { Html5Qrcode } = await import('html5-qrcode');
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
    <div className="max-w-xl mx-auto">

      {/* Invisible dummy scanner div for file scanning uploads */}
      <div id="file-scanner-dummy" className="hidden"></div>

      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-heading tracking-tight m-0">QR Code Recovery Scanner</h1>
      </div>

      {scanError && (
        <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-3 text-danger text-xs mb-6 flex items-center justify-center gap-2">
          <AlertCircle size={16} />
          <span>{scanError}</span>
        </div>
      )}

      {/* RENDER SCANNER SCREEN */}
      {!scanResult && (
        <div className="glass-panel p-8 flex flex-col gap-6 items-center">
          {/* Toggle camera/file */}
          <div className="glass-panel p-1 flex gap-1 rounded-xl bg-slate-950/40 border-white/5 shadow-inner">
            <button
              onClick={() => setScanMode('camera')}
              className={`btn px-4 py-1.5 text-xs rounded-lg shadow-none ${scanMode === 'camera' ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-xs' : 'bg-transparent text-slate-400 hover:text-white'
                }`}
            >
              <Camera size={12} className="mr-1" />
              <span>Live Camera</span>
            </button>
            <button
              onClick={() => setScanMode('upload')}
              className={`btn px-4 py-1.5 text-xs rounded-lg shadow-none ${scanMode === 'upload' ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-xs' : 'bg-transparent text-slate-400 hover:text-white'
                }`}
            >
              <Upload size={12} className="mr-1" />
              <span>Upload Image</span>
            </button>
          </div>

          {/* Webcam Scanner Panel */}
          {scanMode === 'camera' ? (
            <div
              id="webcam-scanner-container"
              className="glass-panel w-full max-w-[340px] min-h-[340px] rounded-2xl overflow-hidden border-white/10"
            ></div>
          ) : (
            /* Upload Scanner Panel */
            <div className="w-full max-w-[340px] h-60 border-2 border-dashed border-white/10 bg-white/2 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all duration-200">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="qr-file-upload"
              />
              <label htmlFor="qr-file-upload" className="text-center cursor-pointer flex flex-col items-center">
                <Scan size={36} className="text-primary-light mb-2" />
                <span className="text-sm font-semibold text-white">
                  Select QR Label Image
                </span>

              </label>
            </div>
          )}
        </div>
      )}

      {/* RENDER SCANNED RESULTS PANEL */}
      {scanResult && (
        <div className="flex flex-col gap-6">

          {scanResult.type === 'complaint' ? (
            /* COMPLAINT SCAN RESULT VIEW */
            <div className="flex flex-col gap-6">

              {/* Complaint Overview Card */}
              <div className="glass-panel p-6 border-l-4 border-l-primary">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scanned Theft Case File</span>
                    <h3 className="text-base font-bold text-white font-heading mt-1 m-0">{scanResult.complaint.title}</h3>
                    <p className="text-xs text-primary-light font-mono font-bold mt-1 m-0">
                      Case #: {scanResult.complaint.complaintNumber}
                    </p>
                  </div>
                  <span className={`status-badge status-${scanResult.complaint.status}`}>{scanResult.complaint.status}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400 mt-4 border-t border-white/5 pt-4">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Incident Category:</span>
                    <p className="font-semibold text-slate-200 capitalize m-0">{scanResult.complaint.category}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Theft Location:</span>
                    <p className="font-semibold text-slate-200 m-0">{scanResult.complaint.theftLocation}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Theft Date:</span>
                    <p className="font-semibold text-slate-200 m-0">{new Date(scanResult.complaint.theftDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Reporter Profile:</span>
                    <p className="font-semibold text-slate-200 m-0">{scanResult.complaint.reporterName} ({scanResult.complaint.reporterContact || 'no phone'})</p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 mt-4 text-xs">
                  <span className="text-slate-400 block mb-1">Description Summary:</span>
                  <p className="text-slate-300 leading-relaxed m-0">{scanResult.complaint.description}</p>
                </div>
              </div>

              {/* Registered Items Card */}
              <div className="glass-panel p-6">
                <h4 className="text-xs font-bold text-white border-b border-white/5 pb-2 mb-4 font-heading m-0">
                  Associated Stolen Property ({scanResult.items.length})
                </h4>
                {scanResult.items.length === 0 ? (
                  <p className="text-xs text-slate-400 m-0">No items listed for this complaint case.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {scanResult.items.map(item => (
                      <div key={item._id} className="flex justify-between items-center bg-white/3 border border-white/5 p-3 rounded-xl text-xs hover:bg-white/5 hover:border-white/10 transition-all">
                        <div>
                          <p className="font-bold text-white m-0">{item.itemName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 m-0">S/N: {item.serialNumber || 'N/A'} • Est: ₹{item.estimatedValue?.toLocaleString()}</p>
                        </div>
                        <span className={`status-badge status-${item.status} text-[9px]`}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Matched Suspects & History Card */}
              <div className="glass-panel p-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-4">
                  <Sparkles size={18} className="text-primary-light" />
                  <h4 className="text-xs font-bold text-white font-heading m-0">
                    Matched Suspect & Criminal History ({scanResult.matches.length})
                  </h4>
                </div>

                {scanResult.matches.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <p className="m-0">No active suspect profiles match this complaint's characteristics yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {scanResult.matches.map(({ match, criminal, history }) => (
                      <div key={match._id} className="glass-panel p-4 bg-white/2 border border-white/5 flex flex-col gap-4">

                        {/* Suspect summary */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex gap-3 items-center">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-950 border border-white/10 flex items-center justify-center shrink-0">
                              {criminal.photoUrl ? (
                                <img src={getUploadUrl(criminal.photoUrl)} alt={criminal.name} className="w-full h-full object-cover" />
                              ) : (
                                <User size={20} className="text-slate-400" />
                              )}
                            </div>
                            <div>
                              <h5 className="text-sm font-bold text-white m-0 font-heading">{criminal.name}</h5>
                              {criminal.aliases && <p className="text-[10px] text-slate-400 mt-0.5 m-0">Aliases: {criminal.aliases}</p>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-extrabold text-xs px-2.5 py-1 rounded-full border ${match.matchScore >= 80 ? 'bg-red-950/20 text-danger border-red-500/20' : 'bg-indigo-950/20 text-primary-light border-indigo-500/20'
                              }`}>
                              {Math.round(match.matchScore)}% Match
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1 m-0">Similarity Score</p>
                          </div>
                        </div>

                        {/* Physical Traits */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/40 border border-white/5 p-3.5 rounded-xl">
                          <div>
                            <span className="text-slate-400">Status:</span>
                            <span className="font-semibold text-slate-200 ml-1 capitalize">{criminal.status}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Gender:</span>
                            <span className="font-semibold text-slate-200 ml-1 capitalize">{criminal.gender}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-slate-400">Last Location:</span>
                            <span className="font-semibold text-slate-200 ml-1">{criminal.lastKnownLocation}</span>
                          </div>
                          {criminal.physicalFeatures?.tattoos && criminal.physicalFeatures.tattoos !== 'none' && (
                            <div className="sm:col-span-2">
                              <span className="text-slate-400">Tattoos:</span>
                              <span className="text-slate-300 ml-1">{criminal.physicalFeatures.tattoos}</span>
                            </div>
                          )}
                          {criminal.physicalFeatures?.scars && criminal.physicalFeatures.scars !== 'none' && (
                            <div className="sm:col-span-2">
                              <span className="text-slate-400">Scars:</span>
                              <span className="text-slate-300 ml-1">{criminal.physicalFeatures.scars}</span>
                            </div>
                          )}
                        </div>

                        {/* CRIMINAL CASE HISTORY LOG */}
                        <div className="mt-3 border-t border-white/5 pt-4">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            Other Matches on File (Suspect Crime Log)
                          </span>
                          {history.length === 0 ? (
                            <p className="text-xs text-slate-400 italic mt-1 m-0">
                              No other matching cases found in database.
                            </p>
                          ) : (
                            <div className="flex flex-col gap-2 mt-2">
                              {history.map(hist => (
                                <div key={hist._id} className="flex justify-between items-center bg-white/2 border border-white/5 p-2.5 rounded-xl text-xs hover:bg-white/5 hover:border-white/10 transition-all">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-white">{hist.complaintId?.title}</span>
                                    <span className="font-mono text-[10px] text-slate-400 mt-0.5">{hist.complaintId?.complaintNumber}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={`font-extrabold ${hist.matchScore >= 80 ? 'text-danger' : 'text-slate-400'}`}>
                                      {Math.round(hist.matchScore)}%
                                    </span>
                                    <span className={`status-badge status-${hist.complaintId?.status} text-[9px]`}>
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
          ) : scanResult.type === 'criminal' ? (
            /* CRIMINAL SCAN RESULT VIEW */
            <div className="flex flex-col gap-6 text-left">
              {/* Criminal Profile Card */}
              <div className="glass-panel p-6 border-l-4 border-l-primary bg-white text-[#3a302a]">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-900 border-2 border-white flex items-center justify-center shrink-0 shadow-sm">
                      {scanResult.criminal.photoUrl ? (
                        <img src={getUploadUrl(scanResult.criminal.photoUrl)} alt={scanResult.criminal.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">👤</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scanned Suspect Profile</span>
                      <h3 className="text-base font-bold text-slate-900 font-heading mt-1 m-0">{scanResult.criminal.name}</h3>
                      {scanResult.criminal.aliases && (
                        <p className="text-xs text-slate-500 mt-0.5 m-0 font-medium">"{scanResult.criminal.aliases}"</p>
                      )}
                    </div>
                  </div>
                  <span className={`rounded-full py-1 px-3.5 text-[9px] font-bold tracking-wider uppercase inline-block border ${scanResult.criminal.status === 'active'
                    ? 'bg-gradient-to-r from-primary/10 to-primary-light/10 text-primary border-primary/20'
                    : 'bg-gradient-to-r from-success/10 to-emerald-500/10 text-success border-success/20'
                    }`}>{scanResult.criminal.status}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500 mt-4 border-t border-[#eae2da]/40 pt-4">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Gender:</span>
                    <p className="font-semibold text-slate-800 capitalize m-0">{scanResult.criminal.gender}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Last Known Address / Caught Area:</span>
                    <p className="font-semibold text-slate-800 m-0">{scanResult.criminal.lastKnownLocation}</p>
                  </div>
                  {scanResult.criminal.physicalFeatures?.height && (
                    <div>
                      <span className="text-slate-400 block mb-0.5">Height:</span>
                      <p className="font-semibold text-slate-800 m-0">{scanResult.criminal.physicalFeatures.height} cm</p>
                    </div>
                  )}
                  {scanResult.criminal.physicalFeatures?.weight && (
                    <div>
                      <span className="text-slate-400 block mb-0.5">Weight:</span>
                      <p className="font-semibold text-slate-800 m-0">{scanResult.criminal.physicalFeatures.weight} kg</p>
                    </div>
                  )}
                  {scanResult.criminal.physicalFeatures?.hairColor && (
                    <div>
                      <span className="text-slate-400 block mb-0.5">Hair Color:</span>
                      <p className="font-semibold text-slate-800 capitalize m-0">{scanResult.criminal.physicalFeatures.hairColor}</p>
                    </div>
                  )}
                  {scanResult.criminal.physicalFeatures?.eyeColor && (
                    <div>
                      <span className="text-slate-400 block mb-0.5">Eye Color:</span>
                      <p className="font-semibold text-slate-800 capitalize m-0">{scanResult.criminal.physicalFeatures.eyeColor}</p>
                    </div>
                  )}
                </div>

                {((scanResult.criminal.physicalFeatures?.scars && scanResult.criminal.physicalFeatures.scars !== 'none') ||
                  (scanResult.criminal.physicalFeatures?.tattoos && scanResult.criminal.physicalFeatures.tattoos !== 'none')) && (
                    <div className="border-t border-[#eae2da]/40 pt-4 mt-4 text-xs text-slate-500 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {scanResult.criminal.physicalFeatures.scars !== 'none' && (
                        <div>
                          <span className="text-slate-400 block mb-0.5">Identified Scars:</span>
                          <p className="text-slate-800 m-0">{scanResult.criminal.physicalFeatures.scars}</p>
                        </div>
                      )}
                      {scanResult.criminal.physicalFeatures.tattoos !== 'none' && (
                        <div>
                          <span className="text-slate-400 block mb-0.5">Identified Tattoos:</span>
                          <p className="text-slate-800 m-0">{scanResult.criminal.physicalFeatures.tattoos}</p>
                        </div>
                      )}
                    </div>
                  )}
              </div>

              {/* Case History Log Card */}
              <div className="glass-panel p-6 bg-white text-[#3a302a]">
                <h4 className="text-xs font-bold text-slate-900 border-b border-[#eae2da]/40 pb-2 mb-4 font-heading m-0">
                  Associated Crime Cases & Matching Records ({scanResult.history.length})
                </h4>
                {scanResult.history.length === 0 ? (
                  <p className="text-xs text-slate-400 italic m-0">No other incident matching reports found on file for this suspect.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {scanResult.history.map(hist => (
                      <div key={hist._id} className="flex justify-between items-center bg-slate-50 border border-[#d8d0c8]/60 p-3 rounded-xl text-xs hover:bg-slate-100 transition-all">
                        <div>
                          <p className="font-bold text-slate-800 m-0">{hist.complaintId?.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 m-0">Case #: {hist.complaintId?.complaintNumber}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-extrabold ${hist.matchScore >= 80 ? 'text-[#c0392b]' : 'text-slate-500'}`}>
                            {Math.round(hist.matchScore)}% Match
                          </span>
                          <span className={`status-badge status-${hist.complaintId?.status} text-[9px]`}>{hist.complaintId?.status}</span>
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
              <div className={`glass-panel p-6 border-l-4 ${scanResult.status === 'recovered' ? 'border-l-success' : 'border-l-danger'}`}>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Scanned Property</span>
                    <h3 className="text-base font-bold text-white font-heading mt-1 m-0">{scanResult.itemName}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1 m-0">
                      Token: {scanResult.qrCodeToken}
                    </p>
                  </div>
                  <span className={`status-badge status-${scanResult.status}`}>{scanResult.status}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400 mt-4 border-t border-white/5 pt-4">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Category:</span>
                    <p className="font-semibold text-slate-200 capitalize m-0">{scanResult.category}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Serial / Identification S/N:</span>
                    <p className="font-mono font-semibold text-slate-200 m-0">{scanResult.serialNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Estimated Value:</span>
                    <p className="font-semibold text-slate-200 m-0">₹{scanResult.estimatedValue ? scanResult.estimatedValue.toLocaleString() : '0.00'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Linked Incident case:</span>
                    <p className="font-semibold text-slate-200 m-0">{scanResult.complaintId?.complaintNumber || 'N/A'}</p>
                  </div>
                </div>

                {scanResult.status === 'recovered' && (
                  <div className="mt-5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 text-success text-xs">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <CheckCircle size={14} />
                      <span>Property Successfully Recovered</span>
                    </div>
                    <p className="text-slate-300 m-0">
                      Recovered on {formatDate(scanResult.recoveredDate)} at: {scanResult.recoveryLocation}
                    </p>
                  </div>
                )}
              </div>

              {/* Recovery submission form if property is still status: 'stolen' */}
              {scanResult.status === 'stolen' && (
                <form onSubmit={handleRecover} className="glass-panel p-6 md:p-8 flex flex-col gap-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={18} className="text-success" />
                    <h3 className="text-sm font-bold text-white font-heading m-0">Register Recovery Findings</h3>
                  </div>

                  <div>
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
                    className="btn btn-primary bg-success hover:bg-emerald-600 border-none w-full py-3 text-sm"
                    disabled={recovering || !recoveryLocation.trim()}
                  >
                    <span>{recovering ? 'Saving recovery details...' : 'Confirm Property Recovery'}</span>
                  </button>
                </form>
              )}
            </>
          )}

          {/* Return button */}
          <button onClick={resetScanner} className="btn btn-secondary w-full py-3 text-sm flex justify-center items-center gap-2">
            <RefreshCw size={16} />
            <span>Scan Another Label</span>
          </button>

        </div>
      )}
    </div>
  );
};

export default QRScanner;
