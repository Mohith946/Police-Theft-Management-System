import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDate } from '../utils/dateUtils';
import { Search, Filter, Compass, CheckCircle, QrCode, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCodeCard from '../components/QRCodeCard';

const StolenItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Recovery modal states
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [recoveryLocation, setRecoveryLocation] = useState('');
  const [recovering, setRecovering] = useState(false);

  // QR Modal states
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrItem, setQrItem] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/items/stolen?search=${search}&category=${category}`);
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load stolen items inventory:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleOpenRecovery = (item) => {
    setSelectedItem(item);
    setRecoveryLocation('');
    setShowRecoverModal(true);
  };

  const handleExecuteRecovery = async (e) => {
    e.preventDefault();
    if (!recoveryLocation.trim() || !selectedItem) return;

    try {
      setRecovering(true);
      const response = await axios.put(`/api/items/${selectedItem._id}/recover`, { recoveryLocation });
      if (response.data.success) {
        setShowRecoverModal(false);
        setSelectedItem(null);
        setRecoveryLocation('');
        fetchItems(); // Reload list
      }
    } catch (err) {
      console.error('Failed to execute item recovery:', err.message);
      alert('Recovery registration failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setRecovering(false);
    }
  };

  const handleOpenQR = (item) => {
    setQrItem(item);
    setShowQRModal(true);
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Stolen Property Inventory</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Monitor registered stolen items, print QR identification labels, and record recoveries</p>
      </div>

      {/* Filters */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search items by name, serial/VIN, specs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Category selection */}
          <div style={{ minWidth: '160px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              className="form-input"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="vehicle">Vehicles</option>
              <option value="electronics">Electronics</option>
              <option value="jewelry">Jewelry</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            <span>Filter</span>
          </button>
        </form>
      </div>

      {/* Grid inventory list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <p>Querying property database...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Compass size={40} style={{ marginBottom: '1rem' }} />
          <h3>Property Inventory Empty</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>No stolen items are currently logged in the active registry.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Item Details</th>
                  <th>Category</th>
                  <th>Serial / Ident Number</th>
                  <th>Estimated Value</th>
                  <th>Case File Link</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.itemName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          {item.description || 'No specs provided'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{item.category}</span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {item.serialNumber || 'N/A'}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      ₹{item.estimatedValue ? item.estimatedValue.toLocaleString() : '0.00'}
                    </td>
                    <td>
                      {item.complaintId ? (
                        <Link 
                          to={`/complaints/${item.complaintId._id}`} 
                          style={{ color: '#3b82f6', textDecoration: 'none', fontFamily: 'monospace', fontWeight: 600 }}
                        >
                          {item.complaintId.complaintNumber}
                        </Link>
                      ) : 'Orphan'}
                    </td>
                    <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleOpenQR(item)} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', gap: '0.25rem' }}
                      >
                        <QrCode size={12} />
                        <span>Label</span>
                      </button>
                      <button 
                        onClick={() => handleOpenRecovery(item)} 
                        className="btn btn-primary" 
                        style={{ 
                          padding: '0.35rem 0.75rem', 
                          fontSize: '0.75rem', 
                          background: 'var(--success)',
                          boxShadow: 'none',
                          display: 'flex',
                          gap: '0.25rem'
                        }}
                      >
                        <CheckCircle size={12} />
                        <span>Recover</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Recovery Popup Modal */}
      {showRecoverModal && selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200
        }}>
          <form onSubmit={handleExecuteRecovery} className="glass-panel" style={{
            padding: '2rem',
            width: '100%',
            maxWidth: '420px',
            position: 'relative'
          }}>
            <button 
              type="button" 
              onClick={() => { setShowRecoverModal(false); setSelectedItem(null); }}
              style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem', fontFamily: 'var(--font-heading)' }}>
              Confirm Property Recovery
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Register recovery status for: <strong>{selectedItem.itemName}</strong>
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Recovery Location Coordinates / Area *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Recovered at suspect house / 45 Downtown Rd"
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
              <span>{recovering ? 'Registering Recovery...' : 'Mark Item Recovered'}</span>
            </button>
          </form>
        </div>
      )}

      {/* QR Label View Modal */}
      {showQRModal && qrItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200
        }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => { setShowQRModal(false); setQrItem(null); }}
              style={{ 
                position: 'absolute', 
                right: '-2rem', 
                top: '-2rem', 
                border: 'none', 
                color: '#ffffff', 
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)',
                padding: '4px',
                borderRadius: '50%'
              }}
            >
              <X size={18} />
            </button>
            <QRCodeCard item={qrItem} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StolenItems;
