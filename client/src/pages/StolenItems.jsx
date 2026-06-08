import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDate } from '../utils/dateUtils';
import { Search, Filter, Compass, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 font-heading m-0">Stolen Property Inventory</h2>
        <p className="text-slate-500 text-xs mt-0.5 m-0">Monitor registered stolen items, audit classifications, and record recoveries</p>
      </div>

      {/* Filters */}
      <div className="glass-panel p-5 mb-2">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[240px] relative">
            <input
              type="text"
              className="form-input pl-9"
              placeholder="Search items by name, serial/VIN, specs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Category selection */}
          <div className="min-w-[160px] flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
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

          <button type="submit" className="btn btn-secondary text-xs sm:text-sm">
            <span>Filter</span>
          </button>
        </form>
      </div>

      {/* Grid inventory list */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          <p>Querying property database...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel p-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <Compass size={40} className="text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800 m-0">Property Inventory Empty</h3>
          <p className="text-xs m-0">No stolen items are currently logged in the active registry.</p>
        </div>
      ) : (
        <div className="table-container p-1">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Item Details</th>
                <th>Category</th>
                <th>Serial / Ident Number</th>
                <th>Estimated Value</th>
                <th>Case File Link</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id}>
                  <td>
                    <div>
                      <div className="font-semibold text-slate-900">{item.itemName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 m-0">
                        {item.description || 'No specs provided'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="capitalize text-slate-800">{item.category}</span>
                  </td>
                  <td className="font-mono text-slate-700 text-xs">
                    {item.serialNumber || 'N/A'}
                  </td>
                  <td className="font-semibold text-slate-900">
                    ₹{item.estimatedValue ? item.estimatedValue.toLocaleString() : '0.00'}
                  </td>
                  <td>
                    {item.complaintId ? (
                      <Link 
                        to={`/complaints/${item.complaintId._id}`} 
                        className="text-blue-500 font-mono font-semibold hover:underline"
                      >
                        {item.complaintId.complaintNumber}
                      </Link>
                    ) : (
                      <span className="text-slate-400">Orphan</span>
                    )}
                  </td>
                  <td className="flex justify-center">
                    <button 
                      onClick={() => handleOpenRecovery(item)} 
                      className="btn btn-primary bg-success hover:bg-emerald-600 border-none py-1.5 px-3 text-xs flex items-center gap-1"
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
      )}

      {/* Manual Recovery Popup Modal */}
      {showRecoverModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50">
          <form onSubmit={handleExecuteRecovery} className="glass-panel p-6 md:p-8 w-full max-w-md relative flex flex-col gap-5">
            <button 
              type="button" 
              onClick={() => { setShowRecoverModal(false); setSelectedItem(null); }}
              className="absolute right-4 top-4 bg-transparent border-none text-slate-400 cursor-pointer p-1 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading m-0">
                Confirm Property Recovery
              </h3>
              <p className="text-xs text-slate-500 mt-1 m-0">
                Register recovery status for: <strong className="text-slate-700">{selectedItem.itemName}</strong>
              </p>
            </div>

            <div>
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
              className="btn btn-primary bg-success hover:bg-emerald-600 border-none w-full py-3 text-sm mt-2"
              disabled={recovering || !recoveryLocation.trim()}
            >
              <span>{recovering ? 'Registering Recovery...' : 'Mark Item Recovered'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default StolenItems;
