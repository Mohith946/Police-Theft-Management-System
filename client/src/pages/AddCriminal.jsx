import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Image } from 'lucide-react';

const AddCriminal = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [aliases, setAliases] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('male');
  
  // Physical features
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [hairColor, setHairColor] = useState('');
  const [eyeColor, setEyeColor] = useState('');
  const [scars, setScars] = useState('none');
  const [tattoos, setTattoos] = useState('none');

  // Location
  const [lastKnownLocation, setLastKnownLocation] = useState('');
  const [status, setStatus] = useState('active');

  // File upload
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !lastKnownLocation) {
      setError('Please fill in name and address');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Multipart FormData creation
      const formData = new FormData();
      formData.append('name', name);
      formData.append('aliases', aliases);
      if (dateOfBirth) formData.append('dateOfBirth', dateOfBirth);
      formData.append('gender', gender);
      if (height) formData.append('height', height);
      if (weight) formData.append('weight', weight);
      formData.append('hairColor', hairColor);
      formData.append('eyeColor', eyeColor);
      formData.append('scars', scars);
      formData.append('tattoos', tattoos);
      formData.append('lastKnownLocation', lastKnownLocation);
      formData.append('status', status);
      
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const response = await axios.post('/api/criminals', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        navigate('/criminals');
      }
    } catch (err) {
      console.error('Failed to save suspect:', err);
      setError(err.response?.data?.message || 'Error occurred while saving suspect profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Navigation Header */}
      <button 
        onClick={() => navigate(-1)} 
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
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
        <span>Return to registry</span>
      </button>

      <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '1.5rem', fontFamily: 'Outfit' }}>
        Create Suspect Profile
      </h2>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '8px',
          padding: '0.75rem',
          color: '#ef4444',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
        {/* Profile photo upload */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '2px dashed rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.02)',
            position: 'relative'
          }}>
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b' }}>
                <Image size={24} style={{ margin: '0 auto 0.25rem' }} />
                <span style={{ fontSize: '0.65rem' }}>No Photo</span>
              </div>
            )}
          </div>
          <div>
            <label className="form-label">Attach suspect photograph</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
              id="photo-upload-input"
            />
            <label htmlFor="photo-upload-input" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', cursor: 'pointer' }}>
              Select Image File
            </label>
            <p style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '0.35rem' }}>
              Allowed formats: JPG, PNG, WEBP. Max size: 5MB.
            </p>
          </div>
        </div>

        {/* Section 1: Basic Information */}
        <h3 style={{ fontSize: '0.95rem', color: '#3b82f6', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.35rem', marginBottom: '1.25rem' }}>
          1. Identity Details
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="form-label">Suspect Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Full legal name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="form-label">Aliases / Street Names</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Slick, Shadow"
              value={aliases}
              onChange={(e) => setAliases(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-input"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Gender *</label>
            <select className="form-input" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Section 2: Physical Description */}
        <h3 style={{ fontSize: '0.95rem', color: '#3b82f6', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.35rem', marginBottom: '1.25rem' }}>
          2. Physical Features
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <label className="form-label">Height (cm)</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 180"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Weight (kg)</label>
            <input
              type="number"
              className="form-input"
              placeholder="e.g. 75"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active (At Large)</option>
              <option value="incarcerated">Incarcerated</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>
          <div>
            <label className="form-label">Hair Color</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Black"
              value={hairColor}
              onChange={(e) => setHairColor(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Eye Color</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Brown"
              value={eyeColor}
              onChange={(e) => setEyeColor(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="form-label">Distinguishing Scars</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. scar on left jawline"
              value={scars}
              onChange={(e) => setScars(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Distinguishing Tattoos</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. scorpion on neck"
              value={tattoos}
              onChange={(e) => setTattoos(e.target.value)}
            />
          </div>
        </div>

        {/* Section 3: Geolocation */}
        <h3 style={{ fontSize: '0.95rem', color: '#3b82f6', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.35rem', marginBottom: '1.25rem' }}>
          3. Operating Region & Coordinates
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <label className="form-label">Last Known Area Address *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 123 Downtown Alley, Cityville"
              value={lastKnownLocation}
              onChange={(e) => setLastKnownLocation(e.target.value)}
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={submitting} 
          style={{ width: '100%', gap: '0.5rem' }}
        >
          <Save size={18} />
          <span>{submitting ? 'Creating suspect profile...' : 'Save Suspect Record'}</span>
        </button>
      </form>
    </div>
  );
};

export default AddCriminal;
