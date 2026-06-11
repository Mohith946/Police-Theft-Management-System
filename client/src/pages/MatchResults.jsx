import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';
import MatchScoreCard from '../components/MatchScoreCard';

const MatchResults = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending'); // Default to showing active alarms

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/matches?status=${filterStatus}`);
      if (response.data.success) {
        setMatches(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load matching suspect logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [filterStatus]);

  const handleStatusUpdate = (matchId, newStatus) => {
    // If the filter status is set to something specific, filter out the updated card immediately
    // to match standard inbox pattern, or show its verified state if searching all
    if (filterStatus) {
      setMatches(prev => prev.filter(m => m._id !== matchId));
    } else {
      setMatches(prev => prev.map(m => m._id === matchId ? { ...m, status: newStatus } : m));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-heading tracking-tight m-0">Automated Suspect Match Alerts</h1>
        </div>

        {/* Filter statuses tabs */}
        <div className="glass-panel p-1 flex gap-1 rounded-xl bg-slate-950/40 border-white/5 shadow-inner">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`btn px-4 py-1.5 text-xs rounded-lg shadow-none font-semibold ${
              filterStatus === 'pending' ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-xs' : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            Active Alarms
          </button>
          <button
            onClick={() => setFilterStatus('verified')}
            className={`btn px-4 py-1.5 text-xs rounded-lg shadow-none font-semibold ${
              filterStatus === 'verified' ? 'bg-success text-white shadow-xs' : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            Verified Connections
          </button>
          <button
            onClick={() => setFilterStatus('dismissed')}
            className={`btn px-4 py-1.5 text-xs rounded-lg shadow-none font-semibold ${
              filterStatus === 'dismissed' ? 'bg-slate-800 text-slate-200 shadow-xs' : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            Dismissed Alerts
          </button>
        </div>
      </div>

      {/* Matches Alarms List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          <p>Querying matching engines...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="glass-panel p-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <Bell size={40} className="text-slate-500" />
          <h3 className="text-sm font-bold text-slate-200 m-0">No Match Results</h3>
          <p className="text-xs m-0">
            {filterStatus === 'pending' 
              ? 'No active alarms exist. Your caseload is completely matched and vetted.' 
              : `No alerts match status filter '${filterStatus}'.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-w-4xl">
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
  );
};

export default MatchResults;
