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
    <div className="max-w-3xl mx-auto">
      {/* Navigation Header */}
      <button 
        onClick={() => navigate(-1)} 
        className="bg-transparent border-none text-slate-500 cursor-pointer flex items-center gap-1.5 text-xs mb-4 p-0 hover:text-slate-900 transition-all duration-200"
      >
        <ArrowLeft size={16} />
        <span>Return to registry</span>
      </button>

      <h2 className="text-xl font-bold text-slate-950 mb-6 font-heading">
        Create Suspect Profile
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-danger text-xs text-center mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8">
        {/* Profile photo upload */}
        <div className="flex gap-6 flex-wrap mb-6 items-center">
          <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 relative shadow-inner">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-slate-400">
                <Image size={24} className="mx-auto mb-1" />
                <span className="text-[10px] block">No Photo</span>
              </div>
            )}
          </div>
          <div>
            <label className="form-label mb-2">Attach suspect photograph</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              id="photo-upload-input"
            />
            <label htmlFor="photo-upload-input" className="btn btn-secondary py-1.5 px-3.5 text-xs cursor-pointer">
              Select Image File
            </label>
            <p className="text-slate-400 text-[10px] mt-1.5">
              Allowed formats: JPG, PNG, WEBP. Max size: 5MB.
            </p>
          </div>
        </div>

        {/* Section 1: Basic Information */}
        <h3 className="text-sm font-bold text-primary border-b border-slate-200/60 pb-2 mb-5 font-heading">
          1. Identity Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
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
        <h3 className="text-sm font-bold text-primary border-b border-slate-200/60 pb-2 mb-5 font-heading mt-6">
          2. Physical Features
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-5">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
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
        <h3 className="text-sm font-bold text-primary border-b border-slate-200/60 pb-2 mb-5 font-heading mt-6">
          3. Operating Region & Coordinates
        </h3>

        <div className="flex flex-col gap-4 mb-6">
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
          className="btn btn-primary w-full py-3 text-sm flex justify-center items-center gap-2 mt-2"
          disabled={submitting} 
        >
          <Save size={18} />
          <span>{submitting ? 'Creating suspect profile...' : 'Save Suspect Record'}</span>
        </button>
      </form>
    </div>
  );
};

export default AddCriminal;
