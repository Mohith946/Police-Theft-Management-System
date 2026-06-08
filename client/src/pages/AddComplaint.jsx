import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

const AddComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('vehicle');
  const [theftDate, setTheftDate] = useState('');
  const [theftLocation, setTheftLocation] = useState('');
  const [reporterName, setReporterName] = useState(user ? user.username : '');
  const [reporterContact, setReporterContact] = useState('');

  // Stolen items subform state
  const [items, setItems] = useState([
    { itemName: '', category: 'vehicle', description: '', serialNumber: '', estimatedValue: '' }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { itemName: '', category, description: '', serialNumber: '', estimatedValue: '' }
    ]);
  };

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !theftLocation || !theftDate || !reporterName) {
      setError('Please fill in all mandatory fields');
      return;
    }

    // Validate that if items are specified, they possess names
    const invalidItem = items.find(item => !item.itemName.trim());
    if (items.length > 0 && invalidItem) {
      setError('Please specify names for all registered stolen items');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        title,
        description,
        category,
        theftDate: new Date(theftDate).toISOString(),
        theftLocation,
        reporterName,
        reporterContact,
        items
      };

      const response = await axios.post('/api/complaints', payload);
      if (response.data.success) {
        navigate('/complaints');
      }
    } catch (err) {
      console.error('Failed to lodge complaint:', err);
      setError(err.response?.data?.message || 'Failed to register complaint in system');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Return link */}
      <button
        onClick={() => navigate(-1)}
        className="bg-transparent border-none text-slate-500 cursor-pointer flex items-center gap-1.5 text-xs mb-4 p-0 hover:text-slate-900 transition-all duration-200"
      >
        <ArrowLeft size={16} />
        <span>Return to case list</span>
      </button>

      <h2 className="text-xl font-bold text-slate-950 mb-6 font-heading">
        File Theft Complaint Report
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-danger text-xs text-center mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">

        {/* Panel 1: Incident Description */}
        <div className="glass-panel p-6 md:p-8">
          <h3 className="text-sm font-bold text-primary border-b border-slate-200/60 pb-2 mb-5 font-heading">
            1. Incident Overview
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div className="md:col-span-2">
              <label className="form-label">Report Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Stolen BMW outside downtown complex"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-1">
              <label className="form-label">Primary Category *</label>
              <select
                className="form-input"
                value={category}
                onChange={e => {
                  setCategory(e.target.value);
                  // Update categories of existing items in subform to match by default
                  setItems(prev => prev.map(item => ({ ...item, category: e.target.value })));
                }}
              >
                <option value="vehicle">Vehicle</option>
                <option value="electronics">Electronics</option>
                <option value="jewelry">Jewelry</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="form-label">Theft Date & Time *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={theftDate}
                onChange={e => setTheftDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Crime Location Address *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Street address or junction area"
                value={theftLocation}
                onChange={e => setTheftLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Theft Details Description *</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Provide a detailed description of the incident, suspect appearance if seen, and modus operandi."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Panel 2: Reporter Information */}
        <div className="glass-panel p-6 md:p-8">
          <h3 className="text-sm font-bold text-primary border-b border-slate-200/60 pb-2 mb-5 font-heading">
            2. Reporter Contact Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="form-label">Reporter Name *</label>
              <input
                type="text"
                className="form-input"
                value={reporterName}
                onChange={e => setReporterName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Reporter Contact Phone / Mail</label>
              <input
                type="text"
                className="form-input"
                placeholder="Phone number or secondary contact details"
                value={reporterContact}
                onChange={e => setReporterContact(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Panel 3: Dynamic Stolen Items List */}
        <div className="glass-panel p-6 md:p-8">
          <div className="flex justify-between items-center border-b border-slate-200/60 pb-3 mb-5">
            <h3 className="text-sm font-bold text-primary m-0 font-heading">
              3. Stolen Property Registry ({items.length})
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="btn btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
            >
              <Plus size={14} />
              <span>Add Item Line</span>
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {items.map((item, index) => (
              <div key={index} className="p-5 border border-slate-200 bg-slate-50/50 rounded-2xl relative">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="absolute right-4 top-4 bg-transparent border-none text-danger cursor-pointer p-1 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Property Item #{index + 1}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
                  <div className="md:col-span-2">
                    <label className="form-label">Item Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. BMW 5 Series / Space Grey MacBook Pro"
                      value={item.itemName}
                      onChange={e => handleItemChange(index, 'itemName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="form-label">Item Category</label>
                    <select
                      className="form-input"
                      value={item.category}
                      onChange={e => handleItemChange(index, 'category', e.target.value)}
                    >
                      <option value="vehicle">Vehicle</option>
                      <option value="electronics">Electronics</option>
                      <option value="jewelry">Jewelry</option>
                      <option value="cash">Cash</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                  <div>
                    <label className="form-label">Serial / Frame / VIN Number</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Unique manufacturer identifier"
                      value={item.serialNumber}
                      onChange={e => handleItemChange(index, 'serialNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Estimated Value (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="approx value"
                      value={item.estimatedValue}
                      onChange={e => handleItemChange(index, 'estimatedValue', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Item Description & Specifications</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="e.g. Dent on rear mudguard, custom stickers, specific components..."
                    value={item.description}
                    onChange={e => handleItemChange(index, 'description', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full py-3.5 text-base flex justify-center items-center gap-2 mt-2"
          disabled={submitting}
        >
          <Save size={18} />
          <span>{submitting ? 'Lodging Case File...' : 'Submit Complaint & Generate QR Labels'}</span>
        </button>

      </form>
    </div>
  );
};

export default AddComplaint;
