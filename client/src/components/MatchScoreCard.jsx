import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, Check, X, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const MatchScoreCard = ({ match, onStatusUpdate }) => {
  const [showVerifyForm, setShowVerifyForm] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const { complaintId: complaint, criminalId: criminal, matchScore, matchReason, status } = match;

  const scoreColor = 
    matchScore >= 80 ? '#ef4444' : // High risk (red)
    matchScore >= 60 ? '#f59e0b' : // Medium risk (orange)
    '#3b82f6';                    // Low risk (blue)

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!notes.trim()) return;

    try {
      setSubmitting(true);
      const response = await axios.post(`/api/matches/${match._id}/verify`, { notes });
      if (response.data.success) {
        setShowVerifyForm(false);
        setNotes('');
        if (onStatusUpdate) onStatusUpdate(match._id, 'verified');
      }
    } catch (err) {
      console.error('Failed to verify match:', err.message);
      alert('Verification failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    if (!window.confirm('Are you sure you want to dismiss this match alert?')) return;
    try {
      const response = await axios.post(`/api/matches/${match._id}/dismiss`);
      if (response.data.success) {
        if (onStatusUpdate) onStatusUpdate(match._id, 'dismissed');
      }
    } catch (err) {
      console.error('Failed to dismiss match:', err.message);
      alert('Dismissal failed');
    }
  };

  // Split reasons on semicolon
  const reasonsList = matchReason ? matchReason.split(';').map(r => r.trim()).filter(Boolean) : [];

  return (
    <div 
      className={`glass-panel p-5 flex flex-col gap-4 border-l-4 ${status === 'pending' && matchScore >= 80 ? 'alert-pulse' : ''}`}
      style={{ borderLeftColor: scoreColor }}
    >
      {/* Header section with score & status */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div 
            className="text-white font-extrabold text-lg w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: scoreColor, boxShadow: `0 0 15px ${scoreColor}40` }}
          >
            {Math.round(matchScore)}%
          </div>
          <div className="text-left flex flex-col">
            <h4 className="text-sm font-bold text-white m-0 font-heading">Suspect Match Alert</h4>
            <p className="text-slate-400 text-[10px] m-0">Score computed automatically</p>
          </div>
        </div>

        <div>
          <span className={`status-badge status-${status}`}>
            {status === 'verified' && <ShieldCheck size={12} />}
            {status === 'pending' && <AlertTriangle size={12} />}
            {status}
          </span>
        </div>
      </div>

      {/* Grid with suspect & case info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2 border-t border-white/5 pt-4 text-xs">
        {/* Suspect profile details */}
        <div>
          <h5 className="text-[10px] font-bold uppercase tracking-wider mb-2 text-primary-light">Suspect Profile</h5>
          <p className="font-bold text-white m-0 text-sm">{criminal.name}</p>
          {criminal.aliases && <p className="text-slate-400 text-[11px] mt-0.5 m-0 font-medium">Aliases: {criminal.aliases}</p>}
          <div className="mt-2 text-slate-400 flex flex-col gap-1 font-medium">
            {criminal.physicalFeatures?.height && <span>Height: {criminal.physicalFeatures.height} cm</span>}
            {criminal.physicalFeatures?.hairColor && <span>Hair: {criminal.physicalFeatures.hairColor}</span>}
            {criminal.physicalFeatures?.tattoos && criminal.physicalFeatures.tattoos !== 'none' && (
              <span>Tattoos: {criminal.physicalFeatures.tattoos}</span>
            )}
            <span className="text-[10px] text-slate-400 block mt-1">Last Known Address: {criminal.lastKnownLocation}</span>
          </div>
        </div>

        {/* Crime incident details */}
        <div>
          <h5 className="text-[10px] font-bold uppercase tracking-wider mb-2 text-primary-light">Theft Incident</h5>
          <p className="font-bold text-white m-0 text-sm">{complaint.title}</p>
          <p className="text-slate-400 text-[11px] font-mono mt-0.5 m-0">{complaint.complaintNumber}</p>
          <div className="mt-2 text-slate-400 flex flex-col gap-1 font-medium">
            <span>Category: <strong className="capitalize text-slate-200">{complaint.category}</strong></span>
            <span>Theft Location: {complaint.theftLocation}</span>
            {complaint.theftDate && <span>Date: {new Date(complaint.theftDate).toLocaleDateString()}</span>}
          </div>
        </div>
      </div>

      {/* Expanded Match Reasons list */}
      <div className="border-t border-white/5 pt-3">
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="bg-transparent border-none text-primary-light text-xs cursor-pointer flex items-center gap-1 font-semibold p-0 hover:text-white transition-all"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{expanded ? 'Hide match explanation' : 'Show match explanation'}</span>
        </button>

        {expanded && (
          <ul className="list-none mt-2 pl-1.5 flex flex-col gap-1.5">
            {reasonsList.map((reason, index) => (
              <li key={index} className="text-xs text-slate-400 font-medium flex items-start gap-1.5">
                <span style={{ color: scoreColor }} className="mt-0.5 shrink-0">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      {status === 'pending' && !showVerifyForm && (
        <div className="flex gap-3 mt-2 border-t border-white/5 pt-4">
          <button 
            onClick={() => setShowVerifyForm(true)} 
            className="btn btn-primary py-2 px-4 text-xs font-semibold"
          >
            <Check size={14} />
            <span>Verify Connection</span>
          </button>
          <button 
            onClick={handleDismiss} 
            className="btn btn-secondary py-2 px-4 text-xs text-danger border-red-500/20 hover:bg-red-950/20 hover:text-red-400 hover:border-red-500/30"
          >
            <X size={14} />
            <span>Dismiss Alert</span>
          </button>
        </div>
      )}

      {/* Verification notes form */}
      {showVerifyForm && (
        <form onSubmit={handleVerify} className="flex flex-col gap-3 mt-2 border-t border-white/5 pt-4">
          <div>
            <label className="form-label">Verification Logs & Notes</label>
            <textarea
              className="form-input resize-y"
              rows={2}
              placeholder="e.g. Suspect was seen riding this motorcycle. Verification confirmed. Initiating arrest warrant..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="btn btn-primary py-1.5 px-4 text-xs font-semibold" 
              disabled={submitting || !notes.trim()}
            >
              <span>{submitting ? 'Saving...' : 'Submit Verification'}</span>
            </button>
            <button 
              type="button" 
              className="btn btn-secondary py-1.5 px-4 text-xs font-semibold" 
              onClick={() => { setShowVerifyForm(false); setNotes(''); }}
            >
              <span>Cancel</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MatchScoreCard;
