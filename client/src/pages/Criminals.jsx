import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, UserPlus, Eye, Filter, UserX } from 'lucide-react';

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
          <h2 className="text-xl font-bold text-slate-900 font-heading m-0">Active Suspect Registry</h2>
          <p className="text-slate-500 text-xs mt-0.5 m-0">Search and manage profiles of suspects in active investigations</p>
        </div>
        <Link to="/criminals/add" className="btn btn-primary text-xs sm:text-sm">
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

          <button type="submit" className="btn btn-secondary text-xs sm:text-sm">
            <span>Execute Search</span>
          </button>
        </form>
      </div>

      {/* Suspect Listing Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          <p>Querying suspect profiles...</p>
        </div>
      ) : criminals.length === 0 ? (
        <div className="glass-panel p-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <UserX size={40} className="text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800 m-0">No Suspects Found</h3>
          <p className="text-xs m-0">No suspect profiles match your query or exist in the registry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {criminals.map(crim => (
            <div key={crim._id} className="glass-panel p-5 flex flex-col justify-between min-h-[220px]">
              <div>
                {/* Photo or placeholder */}
                <div className="flex gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    {crim.photoUrl ? (
                      <img 
                        src={crim.photoUrl} 
                        alt={crim.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 m-0">{crim.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 m-0">
                      {crim.aliases ? `"${crim.aliases}"` : 'No known aliases'}
                    </p>
                    <span className={`status-badge mt-2 text-[9px] ${
                      crim.status === 'active' ? 'status-stolen' : 'status-recovered'
                    }`}>{crim.status}</span>
                  </div>
                </div>

                {/* Characteristics summary */}
                <div className="text-xs text-slate-600 border-t border-slate-100 pt-3 flex flex-col gap-1.5">
                  {crim.physicalFeatures?.height && <span>Height: {crim.physicalFeatures.height} cm</span>}
                  {crim.physicalFeatures?.scars && crim.physicalFeatures.scars !== 'none' && (
                    <span className="truncate">
                      Scars: {crim.physicalFeatures.scars}
                    </span>
                  )}
                  {crim.physicalFeatures?.tattoos && crim.physicalFeatures.tattoos !== 'none' && (
                    <span className="truncate">
                      Tattoos: {crim.physicalFeatures.tattoos}
                    </span>
                  )}
                </div>
              </div>

              {/* View details button */}
              <div className="mt-4 border-t border-slate-100 pt-3">
                <Link 
                  to={`/criminals/${crim._id}`} 
                  className="btn btn-secondary w-full py-2 text-xs flex justify-center items-center gap-1.5"
                >
                  <Eye size={14} />
                  <span>Inspect Profile</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Criminals;
