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
    <div className={`glass-panel ${status === 'pending' && matchScore >= 80 ? 'alert-pulse' : ''}`} style={{
      padding: '1.5rem',
      marginBottom: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      borderLeft: `4px solid ${scoreColor}`
    }}>
      {/* Header section with score & status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: scoreColor,
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.25rem',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 15px ${scoreColor}40`
          }}>
            {Math.round(matchScore)}%
          </div>
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem' }}>Suspect Match Alert</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Score computed automatically</p>
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        marginTop: '0.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        paddingTop: '1rem'
      }}>
        {/* Suspect profile details */}
        <div>
          <h5 style={{ color: '#3b82f6', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Suspect Profile</h5>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>{criminal.name}</p>
          {criminal.aliases && <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Aliases: {criminal.aliases}</p>}
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {criminal.physicalFeatures?.height && <span>Height: {criminal.physicalFeatures.height} cm</span>}
            {criminal.physicalFeatures?.hairColor && <span>Hair: {criminal.physicalFeatures.hairColor}</span>}
            {criminal.physicalFeatures?.tattoos && criminal.physicalFeatures.tattoos !== 'none' && (
              <span style={{ color: '#cbd5e1' }}>Tattoos: {criminal.physicalFeatures.tattoos}</span>
            )}
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Last Known Address: {criminal.lastKnownLocation}</span>
          </div>
        </div>

        {/* Crime incident details */}
        <div>
          <h5 style={{ color: '#6366f1', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Theft Incident</h5>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>{complaint.title}</p>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>{complaint.complaintNumber}</p>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span>Category: <strong style={{ textTransform: 'capitalize' }}>{complaint.category}</strong></span>
            <span>Theft Location: {complaint.theftLocation}</span>
            {complaint.theftDate && <span>Date: {new Date(complaint.theftDate).toLocaleDateString()}</span>}
          </div>
        </div>
      </div>

      {/* Expanded Match Reasons list */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem' }}>
        <button 
          onClick={() => setExpanded(!expanded)} 
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontWeight: 600
          }}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{expanded ? 'Hide match explanation' : 'Show match explanation'}</span>
        </button>

        {expanded && (
          <ul style={{
            listStyleType: 'none',
            marginTop: '0.5rem',
            paddingLeft: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            {reasonsList.map((reason, index) => (
              <li key={index} style={{
                fontSize: '0.8rem',
                color: '#cbd5e1',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.4rem'
              }}>
                <span style={{ color: scoreColor, marginTop: '2px' }}>•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      {status === 'pending' && !showVerifyForm && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginTop: '0.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '1rem'
        }}>
          <button 
            onClick={() => setShowVerifyForm(true)} 
            className="btn btn-primary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
          >
            <Check size={14} />
            <span>Verify Connection</span>
          </button>
          <button 
            onClick={handleDismiss} 
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
          >
            <X size={14} />
            <span>Dismiss Alert</span>
          </button>
        </div>
      )}

      {/* Verification notes form */}
      {showVerifyForm && (
        <form onSubmit={handleVerify} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginTop: '0.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '1rem'
        }}>
          <div>
            <label className="form-label">Verification Logs & Notes</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="e.g. Suspect was seen riding this motorcycle. Verification confirmed. Initiating arrest warrant..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              required
              disabled={submitting}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting || !notes.trim()}
              style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
            >
              <span>{submitting ? 'Saving...' : 'Submit Verification'}</span>
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => { setShowVerifyForm(false); setNotes(''); }}
              style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
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
