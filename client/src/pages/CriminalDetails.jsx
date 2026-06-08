import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, MapPin, Sparkles, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MatchScoreCard from '../components/MatchScoreCard';

const CriminalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [criminal, setCriminal] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1. Fetch Criminal details
      const response = await axios.get(`/api/criminals/${id}`);
      if (response.data.success) {
        setCriminal(response.data.data);
      }
      
      // 2. Fetch matches for this criminal
      const matchRes = await axios.get(`/api/matches?criminalId=${id}`);
      if (matchRes.data.success) {
        setMatches(matchRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load suspect profile details:', err);
      setError('Suspect profile not found in registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusUpdate = (matchId, newStatus) => {
    setMatches(prev => prev.map(m => m._id === matchId ? { ...m, status: newStatus } : m));
  };

  const handleDeleteCriminal = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this suspect record? This action cannot be undone.")) return;
    try {
      setLoading(true);
      const response = await axios.delete(`/api/criminals/${id}`);
      if (response.data.success) {
        alert("Suspect record deleted successfully.");
        navigate('/criminals');
      }
    } catch (err) {
      console.error('Failed to delete suspect profile:', err);
      alert(err.response?.data?.message || 'Failed to delete suspect profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-secondary)' }}>
        <p>Retrieving suspect profile records...</p>
      </div>
    );
  }

  if (error || !criminal) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem' }} className="glass-panel">
        <p style={{ color: 'var(--danger)' }}>{error || 'Suspect profile not found'}</p>
        <button onClick={() => navigate('/criminals')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Return to Registry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Action Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => navigate('/criminals')} 
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
            padding: 0
          }}
        >
          <ArrowLeft size={16} />
          <span>Return to registry</span>
        </button>

        {user?.role === 'admin' && (
          <button
            onClick={handleDeleteCriminal}
            className="btn btn-danger"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
          >
            Delete Suspect Record
          </button>
        )}
      </div>

      {/* Main Profile Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Left Card: Image & Identity */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', height: 'fit-content' }}>
          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            overflow: 'hidden',
            background: 'var(--bg-secondary)',
            border: '2px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {criminal.photoUrl ? (
              <img 
                src={criminal.photoUrl} 
                alt={criminal.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <User size={64} color="var(--text-muted)" />
            )}
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{criminal.name}</h3>
            {criminal.aliases && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>"{criminal.aliases}"</p>}
            <span className="status-badge" style={{
              marginTop: '0.5rem',
              background: criminal.status === 'active' ? 'rgba(186,26,26,0.1)' : 'rgba(16,185,129,0.1)',
              color: criminal.status === 'active' ? 'var(--danger)' : 'var(--success)',
              border: criminal.status === 'active' ? '1px solid rgba(186,26,26,0.2)' : '1px solid rgba(16,185,129,0.2)'
            }}>{criminal.status}</span>
          </div>
        </div>

        {/* Right Card: Features & Operating Areas */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Sparkles size={18} color="#3b82f6" />
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Physical & Geographical Profile</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.9rem' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sex / Gender</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, textTransform: 'capitalize', marginTop: '0.15rem' }}>{criminal.gender}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date of Birth</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.15rem' }}>
                {criminal.dateOfBirth ? new Date(criminal.dateOfBirth).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Height & Weight</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.15rem' }}>
                {criminal.physicalFeatures?.height ? `${criminal.physicalFeatures.height} cm` : 'N/A'} / {criminal.physicalFeatures?.weight ? `${criminal.physicalFeatures.weight} kg` : 'N/A'}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hair & Eye Color</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.15rem' }}>
                {criminal.physicalFeatures?.hairColor || 'N/A'} / {criminal.physicalFeatures?.eyeColor || 'N/A'}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tattoos</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.15rem' }}>{criminal.physicalFeatures?.tattoos || 'none'}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scars / Marks</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.15rem' }}>{criminal.physicalFeatures?.scars || 'none'}</p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <MapPin size={16} color="var(--danger)" />
              <span>Last Known Operating Address:</span>
            </div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {criminal.lastKnownLocation}
            </p>
          </div>
        </div>
      </div>

      {/* Matching alarms feed linked to this suspect */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Bell size={18} color="#f59e0b" />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            Active Cases Similarity Checks ({matches.length})
          </h3>
        </div>

        {matches.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No active case similarity alarms currently trigger for this suspect.</p>
          </div>
        ) : (
          <div>
            {matches.map(match => (
              <MatchScoreCard 
                key={match._id} 
                match={match} 
                onStatusUpdate={handleStatusUpdate} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CriminalDetails;
