import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';
import { Award, Search, MapPin } from 'lucide-react';

const RecoveredItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/items/recovered');
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch recovered items registry:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    const searchLower = search.toLowerCase();
    return (
      item.itemName.toLowerCase().includes(searchLower) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(searchLower)) ||
      (item.recoveryLocation && item.recoveryLocation.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Recovered Property Vault</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Browse logs of retrieved items and view recovery locations</p>
      </div>

      {/* Search Input */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search recovered items by keyword, serial, or area..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Recovered List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <p>Retrieving vault registry...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Award size={40} style={{ marginBottom: '1rem' }} />
          <h3>No Recovered Items</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>No item recoveries are logged matching your request.</p>
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
                  <th>Recovery Date</th>
                  <th>Recovery Location Details</th>
                  <th>Case File Link</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.itemName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          Value: ₹{item.estimatedValue ? item.estimatedValue.toLocaleString() : '0.00'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{item.category}</span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {item.serialNumber || 'N/A'}
                    </td>
                    <td style={{ color: 'var(--success)', fontWeight: 500 }}>
                      {formatDate(item.recoveredDate)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <MapPin size={12} color="var(--success)" />
                        <span>{item.recoveryLocation}</span>
                      </div>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecoveredItems;
