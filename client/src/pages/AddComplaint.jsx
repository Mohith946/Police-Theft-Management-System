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
      setError('Please fill in all mandatory fields highlighted in red');
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
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Return link */}
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.85rem',
          marginBottom: '1rem',
          padding: 0
        }}
      >
        <ArrowLeft size={16} />
        <span>Return to case list</span>
      </button>

      <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
        File Theft Complaint Report
      </h2>

      {error && (
        <div style={{
          background: 'rgba(186, 26, 26, 0.08)',
          border: '1px solid rgba(186, 26, 26, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem',
          color: 'var(--danger)',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Panel 1: Incident Description */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem', marginBottom: '1.25rem' }}>
            1. Incident Overview
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
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
            <div>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
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
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem', marginBottom: '1.25rem' }}>
            2. Reporter Contact Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
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
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>
              3. Stolen Property Registry ({items.length})
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <Plus size={14} />
              <span>Add Item Line</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {items.map((item, index) => (
              <div key={index} style={{
                padding: '1.25rem',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-md)',
                position: 'relative'
              }}>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '1rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                  Property Item #{index + 1}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1rem' }}>
                  <div>
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
                  <div>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1rem' }}>
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
          className="btn btn-primary"
          disabled={submitting}
          style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
        >
          <Save size={18} />
          <span>{submitting ? 'Lodging Case File...' : 'Submit Complaint & Generate QR Labels'}</span>
        </button>

      </form>
    </div>
  );
};

export default AddComplaint;
