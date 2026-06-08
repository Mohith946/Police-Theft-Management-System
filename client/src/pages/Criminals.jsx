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
    <div>
      {/* Header Panel */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Active Suspect Registry</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Search and manage profiles of suspects in active investigations</p>
        </div>
        <Link to="/criminals/add" className="btn btn-primary">
          <UserPlus size={16} />
          <span>Add Suspect</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Search box */}
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, aliases, scars, tattoos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ paddingRight: '2rem' }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="incarcerated">Incarcerated</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            <span>Execute Search</span>
          </button>
        </form>
      </div>

      {/* Suspect Listing Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <p>Querying suspect profiles...</p>
        </div>
      ) : criminals.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <UserX size={40} style={{ marginBottom: '1rem' }} />
          <h3>No Suspects Found</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>No suspect profiles match your query or exist in the registry.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {criminals.map(crim => (
            <div key={crim._id} className="glass-panel" style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '200px'
            }}>
              <div>
                {/* Photo or placeholder */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {crim.photoUrl ? (
                      <img 
                        src={crim.photoUrl} 
                        alt={crim.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>👤</span>
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{crim.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {crim.aliases ? `"${crim.aliases}"` : 'No known aliases'}
                    </p>
                    <span className="status-badge" style={{
                      fontSize: '0.55rem', 
                      marginTop: '0.25rem',
                      background: crim.status === 'active' ? 'rgba(186,26,26,0.1)' : 'rgba(16,185,129,0.1)',
                      color: crim.status === 'active' ? 'var(--danger)' : 'var(--success)',
                      border: crim.status === 'active' ? '1px solid rgba(186,26,26,0.2)' : '1px solid rgba(16,185,129,0.2)'
                    }}>{crim.status}</span>
                  </div>
                </div>

                {/* Characteristics summary */}
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  {crim.physicalFeatures?.height && <span>Height: {crim.physicalFeatures.height} cm</span>}
                  {crim.physicalFeatures?.scars && crim.physicalFeatures.scars !== 'none' && (
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      Scars: {crim.physicalFeatures.scars}
                    </span>
                  )}
                  {crim.physicalFeatures?.tattoos && crim.physicalFeatures.tattoos !== 'none' && (
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      Tattoos: {crim.physicalFeatures.tattoos}
                    </span>
                  )}
                </div>
              </div>

              {/* View details button */}
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <Link 
                  to={`/criminals/${crim._id}`} 
                  className="btn btn-secondary" 
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
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
