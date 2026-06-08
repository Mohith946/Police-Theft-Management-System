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
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 font-heading m-0">Recovered Property Vault</h2>
        <p className="text-slate-500 text-xs mt-0.5 m-0">Browse logs of retrieved items and view recovery locations</p>
      </div>

      {/* Search Input */}
      <div className="glass-panel p-5 mb-2">
        <div className="relative max-w-md">
          <input
            type="text"
            className="form-input pl-9"
            placeholder="Search recovered items by keyword, serial, or area..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Recovered List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          <p>Retrieving vault registry...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel p-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <Award size={40} className="text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800 m-0">No Recovered Items</h3>
          <p className="text-xs m-0">No item recoveries are logged matching your request.</p>
        </div>
      ) : (
        <div className="table-container p-1">
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
                      <div className="font-semibold text-slate-900">{item.itemName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 m-0">
                        Value: ₹{item.estimatedValue ? item.estimatedValue.toLocaleString() : '0.00'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="capitalize text-slate-800 text-xs">{item.category}</span>
                  </td>
                  <td className="font-mono text-slate-700 text-xs">
                    {item.serialNumber || 'N/A'}
                  </td>
                  <td className="text-success font-semibold text-xs">
                    {formatDate(item.recoveredDate)}
                  </td>
                  <td>
                    <div className="flex items-center gap-1 text-slate-700 text-xs">
                      <MapPin size={12} className="text-success shrink-0" />
                      <span>{item.recoveryLocation}</span>
                    </div>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecoveredItems;
