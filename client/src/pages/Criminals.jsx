import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Eye, Filter, UserX, Ruler, Scissors, Paintbrush } from 'lucide-react';

const getTattooEmoji = (text) => {
  if (!text) return null;
  const t = text.toLowerCase();
  if (t.includes('scorpion')) return '🦂';
  if (t.includes('anchor')) return '⚓';
  if (t.includes('snake')) return '🐍';
  if (t.includes('dragon')) return '🐉';
  if (t.includes('spider')) return '🕷️';
  if (t.includes('star')) return '⭐';
  if (t.includes('skull')) return '💀';
  if (t.includes('rose')) return '🌹';
  if (t.includes('cross')) return '✝️';
  if (t.includes('heart')) return '❤️';
  if (t.includes('fire') || t.includes('flame')) return '🔥';
  if (t.includes('tiger')) return '🐅';
  if (t.includes('eagle')) return '🦅';
  return null;
};

const Criminals = () => {
  const [criminals, setCriminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const fetchCriminals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/criminals?search=${search}&status=${status}`);
      if (response.data.success) {
        setCriminals(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load criminals registry:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCriminals();
  }, [status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCriminals();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-heading tracking-tight m-0">Active Suspect Registry</h1>
        </div>
        <Link to="/criminals/add" className="btn btn-primary text-xs sm:text-sm font-semibold">
          <UserPlus size={16} />
          <span>Add Suspect</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-5 mb-2">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-4 items-center">
          {/* Search box */}
          <div className="flex-1 min-w-[260px] relative">
            <input
              type="text"
              className="form-input pl-9"
              placeholder="Search by name, aliases, scars, tattoos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 min-w-[180px]">
            <Filter size={16} className="text-slate-400" />
            <select
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="incarcerated">Incarcerated</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary text-xs sm:text-sm font-semibold">
            <span>Execute Search</span>
          </button>
        </form>
      </div>

      {/* Suspect Listing Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          <p>Querying suspect profiles...</p>
        </div>
      ) : criminals.length === 0 ? (
        <div className="glass-panel p-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <UserX size={40} className="text-slate-500" />
          <h3 className="text-sm font-bold text-slate-200 m-0">No Suspects Found</h3>
          <p className="text-xs m-0">No suspect profiles match your query or exist in the registry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {criminals.map(crim => {
            const statusGlowClass = crim.status === 'active' 
              ? 'bg-gradient-to-br from-primary/30 via-primary-light/20 to-primary/40 shadow-[0_0_12px_rgba(194,101,42,0.35)]'
              : crim.status === 'incarcerated'
                ? 'bg-gradient-to-br from-success/30 via-emerald-500/20 to-success/40 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                : 'bg-gradient-to-br from-slate-400/30 via-slate-500/20 to-slate-600/40 shadow-[0_0_12px_rgba(100,116,139,0.2)]';
            
            const statusBadgeStyle = crim.status === 'active'
              ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-[0_4px_10px_rgba(194,101,42,0.3)]'
              : crim.status === 'incarcerated'
                ? 'bg-gradient-to-r from-success to-emerald-500 text-white shadow-[0_4px_10px_rgba(16,185,129,0.3)]'
                : 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-[0_4px_10px_rgba(100,116,139,0.3)]';

            const tattooEmoji = getTattooEmoji(crim.physicalFeatures?.tattoos);

            return (
              <div 
                key={crim._id} 
                className="bg-white rounded-3xl p-6 border border-[#eae2da] shadow-xs flex flex-col justify-between min-h-[280px] relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Background Network Grid Pattern */}
                <svg className="absolute right-0 top-0 h-full w-[45%] opacity-[0.06] text-[#3a302a] pointer-events-none" viewBox="0 0 120 100" fill="currentColor">
                  <path d="M100 20 L80 35 L95 55 L70 65 L85 80" stroke="currentColor" strokeWidth="0.5" fill="none" />
                  <path d="M80 35 L70 65" stroke="currentColor" strokeWidth="0.5" fill="none" />
                  <path d="M100 20 L95 55" stroke="currentColor" strokeWidth="0.5" fill="none" />
                  <path d="M95 55 L85 80" stroke="currentColor" strokeWidth="0.5" fill="none" />
                  <circle cx="100" cy="20" r="1.5" />
                  <circle cx="80" cy="35" r="1.5" />
                  <circle cx="95" cy="55" r="1.5" />
                  <circle cx="70" cy="65" r="1.5" />
                  <circle cx="85" cy="80" r="1.5" />
                  
                  <path d="M110 40 L90 50 L105 70" stroke="currentColor" strokeWidth="0.5" fill="none" />
                  <path d="M100 20 L110 40" stroke="currentColor" strokeWidth="0.5" fill="none" />
                  <path d="M95 55 L90 50" stroke="currentColor" strokeWidth="0.5" fill="none" />
                  <circle cx="110" cy="40" r="1.5" />
                  <circle cx="90" cy="50" r="1.5" />
                  <circle cx="105" cy="70" r="1.5" />
                </svg>

                <div className="relative z-10 flex flex-col gap-5">
                  {/* Photo or placeholder & Identity details */}
                  <div className="flex gap-4 items-center">
                    <div className={`w-20 h-20 rounded-full p-[3px] ${statusGlowClass} flex items-center justify-center shrink-0`}>
                      <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-white flex items-center justify-center">
                        {crim.photoUrl ? (
                          <img 
                            src={crim.photoUrl} 
                            alt={crim.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl">👤</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#3a302a] font-heading m-0">{crim.name}</h3>
                      <p className="text-xs text-[#8c827a] mt-0.5 m-0 font-medium">
                        {crim.aliases ? `"${crim.aliases}"` : 'No known aliases'}
                      </p>
                      <span className={`rounded-full py-1 px-4 text-[9px] font-bold tracking-wider uppercase inline-block mt-2 ${statusBadgeStyle}`}>
                        {crim.status}
                      </span>
                    </div>
                  </div>

                  {/* Characteristics summary */}
                  <div className="text-xs text-[#3a302a] flex flex-col gap-2 pt-2 border-t border-[#eae2da]/40 font-medium relative">
                    {crim.physicalFeatures?.height && (
                      <div className="flex items-center gap-2">
                        <Ruler size={14} className="text-[#8c827a]" />
                        <span><strong>Height:</strong> {crim.physicalFeatures.height} cm</span>
                      </div>
                    )}
                    {crim.physicalFeatures?.scars && crim.physicalFeatures.scars !== 'none' && (
                      <div className="flex items-center gap-2">
                        <Scissors size={14} className="text-[#8c827a]" />
                        <span className="truncate"><strong>Scars:</strong> {crim.physicalFeatures.scars}</span>
                      </div>
                    )}
                    {crim.physicalFeatures?.tattoos && crim.physicalFeatures.tattoos !== 'none' && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <Paintbrush size={14} className="text-[#8c827a]" />
                          <span className="truncate"><strong>Tattoos:</strong> {crim.physicalFeatures.tattoos}</span>
                        </div>
                        {tattooEmoji && (
                          <span className="text-xl mr-2" title={crim.physicalFeatures.tattoos}>
                            {tattooEmoji}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* View details button */}
                <div className="mt-5 pt-3 border-t border-[#eae2da]/40 relative z-10">
                  <Link 
                    to={`/criminals/${crim._id}`} 
                    className="btn text-white w-full py-3.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-light hover:shadow-[0_6px_15px_rgba(194,101,42,0.35)] border-none transition-all duration-200 active:scale-[0.98]"
                  >
                    <Eye size={14} />
                    <span>Inspect Profile</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Criminals;
