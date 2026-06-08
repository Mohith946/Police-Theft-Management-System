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
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500 text-sm">
        <p>Retrieving suspect profile records...</p>
      </div>
    );
  }

  if (error || !criminal) {
    return (
      <div className="max-w-xl mx-auto text-center p-12 glass-panel">
        <p className="text-danger text-sm">{error || 'Suspect profile not found'}</p>
        <button onClick={() => navigate('/criminals')} className="btn btn-secondary mt-4">
          Return to Registry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Action Header bar */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/criminals')} 
          className="bg-transparent border-none text-slate-500 cursor-pointer flex items-center gap-1.5 text-xs p-0 hover:text-slate-900 transition-all duration-200"
        >
          <ArrowLeft size={16} />
          <span>Return to registry</span>
        </button>

        {user?.role === 'admin' && (
          <button
            onClick={handleDeleteCriminal}
            className="btn btn-danger text-xs py-1.5 px-3"
          >
            Delete Suspect Record
          </button>
        )}
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Left Card: Image & Identity */}
        <div className="glass-panel p-6 flex flex-col items-center gap-5 h-fit md:col-span-1">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center shadow-md shrink-0">
            {criminal.photoUrl ? (
              <img 
                src={criminal.photoUrl} 
                alt={criminal.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={64} className="text-slate-400" />
            )}
          </div>
          <div className="text-center">
            <h3 className="text-base font-bold text-slate-900 m-0">{criminal.name}</h3>
            {criminal.aliases && <p className="text-xs text-slate-500 mt-1 m-0">"{criminal.aliases}"</p>}
            <span className={`status-badge mt-3 text-[9px] ${
              criminal.status === 'active' ? 'status-stolen' : 'status-recovered'
            }`}>{criminal.status}</span>
          </div>
        </div>

        {/* Right Card: Features & Operating Areas */}
        <div className="glass-panel p-6 md:p-8 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2 mb-5 font-heading">
            <Sparkles size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-slate-900 m-0">Physical & Geographical Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs text-slate-700">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 m-0">Sex / Gender</p>
              <p className="text-sm font-semibold text-slate-900 capitalize m-0">{criminal.gender}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 m-0">Date of Birth</p>
              <p className="text-sm font-semibold text-slate-900 m-0">
                {criminal.dateOfBirth ? new Date(criminal.dateOfBirth).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 m-0">Height & Weight</p>
              <p className="text-sm font-semibold text-slate-900 m-0">
                {criminal.physicalFeatures?.height ? `${criminal.physicalFeatures.height} cm` : 'N/A'} / {criminal.physicalFeatures?.weight ? `${criminal.physicalFeatures.weight} kg` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 m-0">Hair & Eye Color</p>
              <p className="text-sm font-semibold text-slate-900 m-0">
                {criminal.physicalFeatures?.hairColor || 'N/A'} / {criminal.physicalFeatures?.eyeColor || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 m-0">Tattoos</p>
              <p className="text-sm font-semibold text-slate-900 m-0">{criminal.physicalFeatures?.tattoos || 'none'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 m-0">Scars / Marks</p>
              <p className="text-sm font-semibold text-slate-900 m-0">{criminal.physicalFeatures?.scars || 'none'}</p>
            </div>
          </div>

          <div className="border-t border-slate-200/60 mt-5 pt-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              <MapPin size={16} className="text-danger" />
              <span>Last Known Operating Address:</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 m-0">
              {criminal.lastKnownLocation}
            </p>
          </div>
        </div>
      </div>

      {/* Matching alarms feed linked to this suspect */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} className="text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 font-heading m-0">
            Active Cases Similarity Checks ({matches.length})
          </h3>
        </div>

        {matches.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-400 text-xs">
            <p className="m-0">No active case similarity alarms currently trigger for this suspect.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
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
