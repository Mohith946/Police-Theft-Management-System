import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDate } from '../utils/dateUtils';
import { Search, Filter, Compass, CheckCircle, X, Plus, AlertTriangle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StolenItems = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Recovery modal states
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [recoveryLocation, setRecoveryLocation] = useState('');
  const [recovering, setRecovering] = useState(false);

  // New Evidence registration form states
  const [formItemName, setFormItemName] = useState('');
  const [formCategory, setFormCategory] = useState('electronics');
  const [formSerialNumber, setFormSerialNumber] = useState('');
  const [formStorageLocation, setFormStorageLocation] = useState('');
  const [formEstimatedValue, setFormEstimatedValue] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

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

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    if (!formItemName.trim() || !formStorageLocation.trim()) {
      setFormError('Item Name and Storage Location are required');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError('');
      setFormSuccess('');

      // Create a complaint under the hood to lodge the stolen item
      const complaintPayload = {
        title: `Locker Deposit: ${formItemName}`,
        description: `Direct Evidence Intake. Storage Location: ${formStorageLocation}. Notes: ${formDescription || 'None'}`,
        category: formCategory,
        theftDate: new Date().toISOString(),
        theftLocation: formStorageLocation,
        reporterName: user ? user.username : 'Duty Officer',
        reporterContact: 'Evidence Division',
        items: [
          {
            itemName: formItemName,
            category: formCategory,
            description: formDescription,
            serialNumber: formSerialNumber,
            estimatedValue: formEstimatedValue ? parseFloat(formEstimatedValue) : 0
          }
        ]
      };

      const response = await axios.post('/api/complaints', complaintPayload);
      if (response.data.success) {
        setFormSuccess('Evidence registered and added to locker successfully.');
        // Reset form
        setFormItemName('');
        setFormCategory('electronics');
        setFormSerialNumber('');
        setFormStorageLocation('');
        setFormEstimatedValue('');
        setFormDescription('');
        fetchItems(); // Reload the table
      }
    } catch (err) {
      console.error('Failed to add evidence item:', err);
      setFormError(err.response?.data?.message || 'Failed to register evidence item');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Helper to render category icon
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'electronics':
        return '💻';
      case 'jewelry':
        return '💎';
      case 'vehicle':
        return '🚗';
      case 'cash':
        return '💵';
      default:
        return '📦';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Hero Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-heading tracking-tight m-0">Evidence Locker</h1>
      </div>

      {/* Grid: 12-Columns Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 Cols): Recent Submissions & Inventory */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          
          {/* Filters Card */}
          <div className="glass-panel p-5">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-center">
              {/* Search input */}
              <div className="flex-grow min-w-[240px] relative">
                <input
                  type="text"
                  className="form-input pl-9"
                  placeholder="Search locker by item name, serial, specs..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9088]" />
              </div>

              {/* Category selector */}
              <div className="min-w-[160px] flex items-center gap-2">
                <Filter size={16} className="text-[#9a9088]" />
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

              <button type="submit" className="btn btn-secondary px-4 py-2 text-xs sm:text-sm">
                <span>Filter</span>
              </button>
            </form>
          </div>

          {/* Submissions Table Card */}
          <div className="bg-white rounded-xl shadow-xs border border-[#d8d0c8]/60 overflow-hidden">
            <div className="p-5 border-b border-[#d8d0c8]/60 flex justify-between items-center bg-[#f6f0e8]/20">
              <h3 className="font-body font-bold text-base text-[#3a302a] m-0">Recent Submissions</h3>
              <span className="text-xs font-semibold text-[#605850] bg-[#eae2da] px-2.5 py-1 rounded-full">
                {items.length} Active Stolen Items
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-[#605850] text-sm">
                <p>Querying evidence database...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="p-16 text-center text-[#9a9088] flex flex-col items-center gap-3">
                <Compass size={40} className="text-[#9a9088]" />
                <h4 className="text-sm font-bold text-[#3a302a] m-0">Property Inventory Empty</h4>
                <p className="text-xs m-0">No stolen or evidence items are currently registered matching filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f6f0e8]/50">
                      <th className="px-6 py-4 font-body font-bold text-xs uppercase tracking-widest text-[#605850] border-b border-[#d8d0c8]/40">Item Details</th>
                      <th className="px-6 py-4 font-body font-bold text-xs uppercase tracking-widest text-[#605850] border-b border-[#d8d0c8]/40">Category</th>
                      <th className="px-6 py-4 font-body font-bold text-xs uppercase tracking-widest text-[#605850] border-b border-[#d8d0c8]/40">Serial Number</th>
                      <th className="px-6 py-4 font-body font-bold text-xs uppercase tracking-widest text-[#605850] border-b border-[#d8d0c8]/40">Value & Case</th>
                      <th className="px-6 py-4 font-body font-bold text-xs uppercase tracking-widest text-[#605850] border-b border-[#d8d0c8]/40 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d8d0c8]/30">
                    {items.map(item => (
                      <tr key={item._id} className="hover:bg-[#f2ece4]/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-bold text-[#3a302a] text-sm">{item.itemName}</div>
                            {item.description && (
                              <div className="text-[11px] text-[#605850] mt-0.5 max-w-xs truncate">
                                {item.description}
                              </div>
                            )}
                            <div className="text-[10px] text-[#9a9088] font-mono mt-1">
                              QR Token: {item.qrCodeToken ? item.qrCodeToken.slice(0, 15) : 'N/A'}...
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eae2da] text-[#3a302a] rounded-full text-xs font-semibold capitalize">
                            <span>{getCategoryIcon(item.category)}</span> {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-[#605850]">
                          {item.serialNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#3a302a] text-sm">
                            ₹{item.estimatedValue ? item.estimatedValue.toLocaleString() : '0.00'}
                          </div>
                          {item.complaintId ? (
                            <Link 
                              to={`/complaints/${item.complaintId._id}`} 
                              className="text-primary hover:underline text-xs font-mono font-bold mt-1 block"
                            >
                              {item.complaintId.complaintNumber}
                            </Link>
                          ) : (
                            <span className="text-[10px] text-[#9a9088] block mt-1">Direct Locker Log</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleOpenRecovery(item)} 
                            className="btn bg-[#10b981] hover:bg-emerald-600 text-white border-none py-1.5 px-3 text-xs flex items-center gap-1 font-semibold mx-auto cursor-pointer"
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
          </div>
        </div>

        {/* Right Column (4 Cols): Registration Form & Protocol Reminders */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Add New Evidence Form */}
          <div className="bg-[#f2ece4]/40 rounded-xl p-6 border border-[#d8d0c8]/60 shadow-xs">
            <h3 className="font-heading text-xl md:text-2xl font-bold mb-4 text-[#3a302a]">Add New Evidence</h3>
            
            {formError && (
              <div className="bg-red-50 border border-red-200 text-[#c0392b] text-xs p-3 rounded-lg mb-4 flex items-start gap-1.5">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-[#059669] text-xs p-3 rounded-lg mb-4">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleAddEvidence} className="space-y-4">
              <div>
                <label className="form-label">Evidence Item Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Space Grey MacBook Pro 16"
                  value={formItemName}
                  onChange={e => setFormItemName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                >
                  <option value="electronics">Electronics</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="vehicle">Vehicle Parts</option>
                  <option value="cash">Currency</option>
                  <option value="other">Other / Miscellaneous</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Serial Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Manufacturer ID"
                    value={formSerialNumber}
                    onChange={e => setFormSerialNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Est. Value (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Value in INR"
                    value={formEstimatedValue}
                    onChange={e => setFormEstimatedValue(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Storage Location / Place *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Locker B, Shelf 4"
                  value={formStorageLocation}
                  onChange={e => setFormStorageLocation(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Brief Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Markings, scratch locations, operational status..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full py-3 mt-2 flex items-center justify-center gap-1.5"
                disabled={formSubmitting}
              >
                <Plus size={16} />
                <span>{formSubmitting ? 'Registering...' : 'Register Item'}</span>
              </button>
            </form>
          </div>

          {/* Protocol Reminder Box */}
          <div className="bg-[#c0392b] text-white p-6 rounded-xl relative overflow-hidden group shadow-sm">
            <div className="relative z-10">
              <h4 className="font-heading text-lg font-bold mb-2 text-white">Protocol Reminder</h4>
              <p className="text-xs opacity-90 leading-relaxed text-white">
                All biological or high-value items must be double-bagged and signed off by a supervisor before locker placement. Ensure a secure barcode label is affixed immediately.
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <FileText size={120} className="text-white" />
            </div>
          </div>

        </div>

      </div>

      {/* Manual Recovery Popup Modal */}
      {showRecoverModal && selectedItem && (
        <div className="fixed inset-0 bg-[#3a302a]/60 backdrop-blur-xs flex items-center justify-center z-50">
          <form onSubmit={handleExecuteRecovery} className="glass-panel p-6 md:p-8 w-full max-w-md relative flex flex-col gap-5 bg-white">
            <button 
              type="button" 
              onClick={() => { setShowRecoverModal(false); setSelectedItem(null); }}
              className="absolute right-4 top-4 bg-transparent border-none text-[#9a9088] cursor-pointer p-1 hover:bg-[#f6f0e8] rounded-lg transition-all"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="text-base font-bold text-[#3a302a] font-heading m-0">
                Confirm Property Recovery
              </h3>
              <p className="text-xs text-[#605850] mt-1 m-0 font-medium font-body">
                Register recovery status for: <strong className="text-[#3a302a] font-semibold">{selectedItem.itemName}</strong>
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
              className="btn btn-primary bg-[#10b981] hover:bg-emerald-600 border-none w-full py-3 text-sm mt-2"
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
