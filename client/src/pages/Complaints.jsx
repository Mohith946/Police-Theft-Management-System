import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import { FilePlus, Search, ArrowLeft, ClipboardList, QrCode } from 'lucide-react';
import QRCodeCard from '../components/QRCodeCard';

const Complaints = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [singleComplaint, setSingleComplaint] = useState(null);
  const [associatedItems, setAssociatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  // 1. Fetch complaints list
  const fetchComplaintsList = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`/api/complaints?status=${statusFilter}&category=${categoryFilter}`);
      if (response.data.success) {
        setComplaints(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err.message);
      setError('Failed to fetch complaints list');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch single complaint details
  const fetchSingleComplaint = async (complaintId) => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`/api/complaints/${complaintId}`);
      if (response.data.success) {
        setSingleComplaint(response.data.data.complaint);
        setAssociatedItems(response.data.data.items);
      }
    } catch (err) {
      console.error('Failed to load complaint details:', err.message);
      setError(err.response?.data?.message || 'Access denied or complaint not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSingleComplaint(id);
    } else {
      fetchComplaintsList();
    }
  }, [id, statusFilter, categoryFilter]);

  // Client-side simple search filter
  const filteredComplaints = complaints.filter(comp => {
    const searchLower = search.toLowerCase();
    return (
      comp.complaintNumber.toLowerCase().includes(searchLower) ||
      comp.title.toLowerCase().includes(searchLower) ||
      comp.description.toLowerCase().includes(searchLower) ||
      comp.reporterName.toLowerCase().includes(searchLower)
    );
  });

  const handleUpdateStatus = async (newStatus) => {
    if (!window.confirm(`Update case status to ${newStatus.toUpperCase()}?`)) return;
    try {
      setLoading(true);
      const response = await axios.put(`/api/complaints/${id}`, { status: newStatus });
      if (response.data.success) {
        setSingleComplaint(response.data.data);
      }
    } catch (err) {
      console.error('Failed to update complaint status:', err);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComplaint = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this complaint case and all its registered stolen items? This action cannot be undone.")) return;
    try {
      setLoading(true);
      const response = await axios.delete(`/api/complaints/${id}`);
      if (response.data.success) {
        alert("Complaint deleted successfully.");
        navigate('/complaints');
      }
    } catch (err) {
      console.error('Failed to delete complaint:', err);
      alert(err.response?.data?.message || 'Failed to delete complaint');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER SINGLE COMPLAINT DETAILS VIEW
  // ==========================================
  if (id) {
    if (loading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--text-secondary)' }}>
          <p>Retrieving case records...</p>
        </div>
      );
    }

    if (error || !singleComplaint) {
      return (
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem' }} className="glass-panel">
          <p style={{ color: 'var(--danger)' }}>{error || 'Complaint case details not found'}</p>
          <button onClick={() => navigate('/complaints')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            Return to Case List
          </button>
        </div>
      );
    }

    const isOfficer = user.role === 'officer' || user.role === 'admin';

    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Back Link */}
        <button 
          onClick={() => navigate('/complaints')} 
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

        {/* Case File Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Main Complaint info panel */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{singleComplaint.title}</h2>
                <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#3b82f6', marginTop: '0.15rem' }}>
                  Case ID: {singleComplaint.complaintNumber}
                </p>
              </div>
              <span className={`status-badge status-${singleComplaint.status}`}>{singleComplaint.status}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Incident Category</p>
                <p style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--text-primary)' }}>{singleComplaint.category}</p>
              </div>
              
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Theft Date & Time</p>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatDateTime(singleComplaint.theftDate)}</p>
              </div>

              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Location Details</p>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{singleComplaint.theftLocation}</p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Incident Description</p>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.88rem' }}>{singleComplaint.description}</p>
              </div>
            </div>

            {/* Officer & Admin status modification and deletion controls */}
            {(isOfficer || user.role === 'admin') && (
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', alignItems: 'center' }}>
                {isOfficer && singleComplaint.status === 'pending' && (
                  <button 
                    onClick={() => handleUpdateStatus('investigating')} 
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  >
                    Start Investigation
                  </button>
                )}
                {isOfficer && singleComplaint.status === 'investigating' && (
                  <button 
                    onClick={() => handleUpdateStatus('resolved')} 
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'var(--success)' }}
                  >
                    Mark Case Resolved
                  </button>
                )}
                {isOfficer && singleComplaint.status !== 'resolved' && singleComplaint.status !== 'closed' && (
                  <button 
                    onClick={() => handleUpdateStatus('closed')} 
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--border-color)' }}
                  >
                    Close Case File
                  </button>
                )}
                {user.role === 'admin' && (
                  <button 
                    onClick={handleDeleteComplaint} 
                    className="btn btn-danger"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', marginLeft: 'auto' }}
                  >
                    Delete Case File
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Reporter Info */}
          <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
              Reporter Profile
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Full Name:</span>
                <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{singleComplaint.reporterName}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Contact Info:</span>
                <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{singleComplaint.reporterContact || 'No contact provided'}</p>
              </div>
              {singleComplaint.reportedBy && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>System User:</span>
                  <p style={{ color: '#3b82f6', fontWeight: 500 }}>@{singleComplaint.reportedBy.username}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Associated Stolen Items & QRs Section */}
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <QrCode size={18} color="#3b82f6" />
            <span>Registered Stolen Items & Labels ({associatedItems.length})</span>
          </h3>

          {associatedItems.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>No items registered under this case report.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {associatedItems.map(item => (
                <div key={item._id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <QRCodeCard item={item} />
                  
                  {/* Additional recovery metadata below the card */}
                  <div className="glass-panel" style={{ padding: '0.75rem 1rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                      <strong style={{ 
                        textTransform: 'uppercase', 
                        color: item.status === 'recovered' ? 'var(--success)' : 'var(--danger)' 
                      }}>{item.status}</strong>
                    </div>
                    {item.status === 'recovered' && (
                      <div style={{ marginTop: '0.35rem', color: 'var(--success)', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                        <span>Date: {formatDate(item.recoveredDate)}</span>
                        <span>Location: {item.recoveryLocation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER COMPLAINTS LIST VIEW
  // ==========================================
  return (
    <div>
      {/* Header Panel */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            Theft Complaints Database
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Review and audit public theft reports and file updates
          </p>
        </div>
        <Link to="/complaints/add" className="btn btn-primary">
          <FilePlus size={16} />
          <span>File New Theft Report</span>
        </Link>
      </div>

      {/* Filters Panel */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by case #, title, reporter name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Category Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              className="form-input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="vehicle">Vehicle</option>
              <option value="electronics">Electronics</option>
              <option value="jewelry">Jewelry</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <p>Querying case history...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ClipboardList size={40} style={{ marginBottom: '1rem' }} />
          <h3>No Complaints Logged</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>No case files match your search query.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Incident Details</th>
                  <th>Date Logged</th>
                  <th>Reporter</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map(comp => (
                  <tr key={comp._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#3b82f6' }}>
                      {comp.complaintNumber}
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{comp.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize', marginTop: '0.15rem' }}>
                          Category: {comp.category} • Location: {comp.theftLocation}
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(comp.theftDate)}</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{comp.reporterName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{comp.reporterContact || 'No phone'}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${comp.status}`}>{comp.status}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Link 
                        to={`/complaints/${comp._id}`} 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          color: '#3b82f6',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#3b82f6';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--bg-secondary)';
                          e.currentTarget.style.color = '#3b82f6';
                        }}
                      >
                        <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
                      </Link>
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

export default Complaints;
