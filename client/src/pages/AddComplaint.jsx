import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Plus, Trash2, Lightbulb, Image, Mic, MapPin, AlertTriangle, FileText } from 'lucide-react';

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

  // Attachments state
  const [scenePhotos, setScenePhotos] = useState([]);
  const [audioStatement, setAudioStatement] = useState(null);
  const [audioName, setAudioName] = useState('');

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const convertToWebP = (file) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }
      if (file.type === 'image/webp') {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
              const webpFile = new File([blob], `${nameWithoutExt}.webp`, { type: 'image/webp' });
              resolve(webpFile);
            } else {
              resolve(file);
            }
          }, 'image/webp', 0.85);
        };
        img.onerror = () => resolve(file);
        img.src = event.target.result;
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    try {
      const webpFiles = await Promise.all(files.map(file => convertToWebP(file)));
      const base64Promises = webpFiles.map(file => fileToBase64(file));
      const base64Files = await Promise.all(base64Promises);
      setScenePhotos(prev => [...prev, ...base64Files]);
    } catch (err) {
      console.error('Failed to convert photos to base64:', err);
      setError('Failed to process image files.');
    }
  };

  const handleAudioChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setAudioName(file.name);
      const base64File = await fileToBase64(file);
      setAudioStatement(base64File);
    } catch (err) {
      console.error('Failed to convert audio to base64:', err);
      setError('Failed to process audio file.');
    }
  };

  const handleRemovePhoto = (index) => {
    setScenePhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAudio = () => {
    setAudioStatement(null);
    setAudioName('');
  };

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
        scenePhotos,
        audioStatement,
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
    <div className="max-w-6xl mx-auto flex flex-col gap-6">

      {/* Return link */}
      <button
        onClick={() => navigate(-1)}
        className="bg-transparent border-none text-[#9a9088] cursor-pointer flex items-center gap-1.5 text-xs p-0 hover:text-[#3a302a] transition-colors self-start font-semibold"
      >
        <ArrowLeft size={14} />
        <span>Return to case list</span>
      </button>

      {/* Main Grid: Form Left, Sidebar Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Section (8 Cols): The Official Form 402-B */}
        <div className="lg:col-span-8 bg-white p-8 md:p-12 border border-[#d8d0c8]/60 shadow-xs rounded-sm">

          <header className="mb-10 text-center border-b border-[#d8d0c8]/30 pb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-heading tracking-tight mb-2 m-0">Complaint Registration</h1>
          </header>

          {error && (
            <div className="bg-red-50 border border-red-200 text-[#c0392b] text-xs p-3.5 rounded-lg mb-6 flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">

            {/* Section 01: Complainant Information */}
            <section className="border-b border-[#d8d0c8]/60 pb-8">
              <h3 className="text-lg font-heading font-semibold text-[#3a302a] mb-6 flex items-center gap-3">
                <span className="bg-[#c2652a]/10 text-[#c2652a] w-8 h-8 rounded-full flex items-center justify-center text-sm font-body font-bold">01</span>
                Complainant Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="form-label">Full Legal Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Reporter or Complainant name"
                    value={reporterName}
                    onChange={e => setReporterName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Contact Phone / Mail</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Phone number"
                    value={reporterContact}
                    onChange={e => setReporterContact(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Section 02: Incident Details */}
            <section className="border-b border-[#d8d0c8]/60 pb-8">
              <h3 className="text-lg font-heading font-semibold text-[#3a302a] mb-6 flex items-center gap-3">
                <span className="bg-[#c2652a]/10 text-[#c2652a] w-8 h-8 rounded-full flex items-center justify-center text-sm font-body font-bold">02</span>
                Incident Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                <div className="md:col-span-2">
                  <label className="form-label">Incident Report Title *</label>
                  <input
                    type="text"
                    className="form-input"
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
                      // Sync items category by default
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
                  <label className="form-label">Incident Date & Time *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={theftDate}
                    onChange={e => setTheftDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Incident Location Address *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g : Incident address"
                    value={theftLocation}
                    onChange={e => setTheftLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Narrative Summary *</label>
                <textarea
                  className="form-input resize-none"
                  rows={4}
                  placeholder="evidence detail."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>
            </section>

            {/* Section 03: Property Inventory */}
            <section className="pb-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-heading font-semibold text-[#3a302a] m-0 flex items-center gap-3">
                  <span className="bg-[#c2652a]/10 text-[#c2652a] w-8 h-8 rounded-full flex items-center justify-center text-sm font-body font-bold">03</span>
                  Property Inventory ({items.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
                >
                  <Plus size={14} />
                  <span>ADD ITEM LINE</span>
                </button>
              </div>

              <div className="space-y-5">
                {items.map((item, index) => (
                  <div key={index} className="p-5 border border-[#d8d0c8]/60 bg-[#f2ece4]/10 rounded-lg relative">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="absolute right-4 top-4 bg-transparent border-none text-[#c0392b] cursor-pointer p-1 hover:bg-red-50 rounded transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    <h4 className="text-[10px] font-bold text-[#9a9088] uppercase tracking-wider mb-4 font-body">
                      Property Line #{index + 1}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="md:col-span-2">
                        <label className="form-label">Item Name *</label>
                        <input
                          type="text"
                          className="form-input text-sm"
                          placeholder="e.g. Item name"
                          value={item.itemName}
                          onChange={e => handleItemChange(index, 'itemName', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">Item Category</label>
                        <select
                          className="form-input text-sm"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="form-label">Serial / Frame / VIN Number</label>
                        <input
                          type="text"
                          className="form-input text-sm"
                          placeholder="Unique identifier"
                          value={item.serialNumber}
                          onChange={e => handleItemChange(index, 'serialNumber', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="form-label">Estimated Value (₹)</label>
                        <input
                          type="number"
                          className="form-input text-sm"
                          placeholder="Approx. value in INR"
                          value={item.estimatedValue}
                          onChange={e => handleItemChange(index, 'estimatedValue', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Item Description & Specifications</label>
                      <textarea
                        className="form-input text-sm"
                        rows={2}
                        placeholder="Identifiable marks, visual state, custom stickers, etc..."
                        value={item.description}
                        onChange={e => handleItemChange(index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                <p className="text-[11px] text-[#605850] mt-2">
                  * Unique QR tracking codes will be generated for each property line upon lodging this report.
                </p>
              </div>
            </section>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[#d8d0c8]/60">
              <button
                type="button"
                onClick={() => navigate('/complaints')}
                className="flex-1 px-6 py-4 bg-white text-[#605850] font-bold uppercase tracking-widest text-xs border border-[#d8d0c8] rounded-lg hover:bg-[#f6f0e8] transition-colors cursor-pointer"
              >
                Cancel Entry
              </button>
              <button
                type="submit"
                className="flex-[2] px-6 py-4 bg-primary text-white font-bold uppercase tracking-widest text-xs rounded-lg hover:opacity-95 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                disabled={submitting}
              >
                <Save size={14} />
                <span>{submitting ? 'Lodging Case File...' : 'Submit Official Record'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Section (4 Cols): Quick Attachments Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-4">

          {/* Quick Attachments Card */}
          <div className="bg-white p-6 rounded-xl border border-[#d8d0c8]/60 shadow-xs">
            <h4 className="font-heading text-lg font-bold mb-4 text-[#3a302a] m-0">Quick Attachments</h4>
            <div className="flex flex-col gap-3">
              {/* Scene Photos Button */}
              <div 
                onClick={() => document.getElementById('photo-input').click()}
                className="flex items-center justify-between p-3 bg-[#f6f0e8]/30 rounded-lg cursor-pointer hover:bg-[#f2ece4]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Image size={18} className="text-[#605850]" />
                  <span className="text-[11px] font-bold text-[#3a302a] uppercase">Scene Photos</span>
                </div>
                {scenePhotos.length > 0 ? (
                  <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">
                    {scenePhotos.length} {scenePhotos.length === 1 ? 'Photo' : 'Photos'}
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400">None</span>
                )}
                <input 
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* Thumbnails preview */}
              {scenePhotos.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-[#f6f0e8]/10 border border-[#d8d0c8]/40 rounded-lg">
                  {scenePhotos.map((photo, idx) => (
                    <div key={idx} className="relative w-12 h-12 border border-[#d8d0c8] rounded overflow-hidden">
                      <img src={photo} className="w-full h-full object-cover" alt={`preview-${idx}`} />
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); handleRemovePhoto(idx); }}
                        className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] border-none cursor-pointer font-bold hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Audio Statement Button */}
              <div 
                onClick={() => document.getElementById('audio-input').click()}
                className="flex items-center justify-between p-3 bg-[#f6f0e8]/30 rounded-lg cursor-pointer hover:bg-[#f2ece4]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Mic size={18} className="text-[#605850]" />
                  <span className="text-[11px] font-bold text-[#3a302a] uppercase">Audio Statement</span>
                </div>
                {audioStatement ? (
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                    Attached
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400">None</span>
                )}
                <input 
                  id="audio-input"
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleAudioChange}
                />
              </div>

              {/* Audio selected display */}
              {audioStatement && (
                <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded text-[10px] text-[#605850]">
                  <span className="truncate max-w-[180px] font-medium">{audioName}</span>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveAudio(); }}
                    className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer font-bold text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Decorative Media Frame */}
          <div className="relative rounded-xl overflow-hidden h-44 border border-[#d8d0c8]/60 shadow-xs">
            <img
              alt="Officer writing report"
              className="w-full h-full object-cover grayscale opacity-30"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQs1lmMz80bYdKH5CuoQ3mnVln-pqi0LfqgvJUFFWjMR5Qz_11P7kaLNHnKevKQ5Qj7q9131put0u3YihGML5ffOAxnCL3yUDyGMgVVLu2eyW5sA8bFQ09Ntq6eUZZsZrnkH3tYxy3_1CU7rbF7Oi2oaS6ZCcxFSNzSL1MY2XPfraYLWWXGpI3p7Ap2Rl4ffTVCS51Vxzg7Gqor0BWZgB5r3czcbCo_aj5XNKV_TSjZMYHSiCG2N-rd0CjlDHAKUXRwn4KFHzgJ-_g"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#faf5ee]/90 to-transparent flex items-end p-4">
              <span className="text-[10px] font-bold text-[#605850] uppercase tracking-widest flex items-center gap-1.5">
                <FileText size={12} />
                Documenting cases
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AddComplaint;
