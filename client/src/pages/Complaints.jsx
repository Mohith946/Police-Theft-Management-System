import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import { FilePlus, Search, ArrowLeft, ClipboardList, Package } from 'lucide-react';
import ComplaintQRCodeCard from '../components/ComplaintQRCodeCard';

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
        <div className="flex items-center justify-center min-h-[50vh] text-slate-500 text-sm">
          <p>Retrieving case records...</p>
        </div>
      );
    }

    if (error || !singleComplaint) {
      return (
        <div className="max-w-xl mx-auto text-center p-12 glass-panel">
          <p className="text-danger text-sm">{error || 'Complaint case details not found'}</p>
          <button onClick={() => navigate('/complaints')} className="btn btn-secondary mt-4">
            Return to Case List
          </button>
        </div>
      );
    }

    const isOfficer = user.role === 'officer' || user.role === 'admin';

    return (
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <button 
          onClick={() => navigate('/complaints')} 
          className="bg-transparent border-none text-slate-500 cursor-pointer flex items-center gap-1.5 text-xs mb-4 p-0 hover:text-slate-900 transition-all duration-200"
        >
          <ArrowLeft size={16} />
          <span>Return to case list</span>
        </button>

        {/* Case File Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          
          {/* Main Complaint info panel */}
          <div className="glass-panel p-6 md:p-8 lg:col-span-3">
            <div className="flex justify-between items-start gap-4 mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 m-0 font-heading">{singleComplaint.title}</h2>
                <p className="font-mono text-xs text-primary mt-1 m-0">
                  Case ID: {singleComplaint.complaintNumber}
                </p>
              </div>
              <span className={`status-badge status-${singleComplaint.status}`}>{singleComplaint.status}</span>
            </div>

            <div className="flex flex-col gap-5 text-sm text-slate-700">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 m-0">Incident Category</p>
                <p className="text-sm font-semibold text-slate-900 capitalize m-0">{singleComplaint.category}</p>
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 m-0">Theft Date & Time</p>
                <p className="text-sm font-semibold text-slate-900 m-0">{formatDateTime(singleComplaint.theftDate)}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 m-0">Location Details</p>
                <p className="text-sm font-semibold text-slate-900 m-0">{singleComplaint.theftLocation}</p>
              </div>

              <div className="border-t border-slate-200/60 pt-4 mt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 m-0">Incident Description</p>
                <p className="text-sm text-slate-700 leading-relaxed white-space-pre-wrap m-0">{singleComplaint.description}</p>
              </div>
            </div>

            {/* Officer & Admin actions */}
            {(isOfficer || user.role === 'admin') && (
              <div className="flex flex-wrap gap-3 mt-8 border-t border-slate-200/60 pt-5 items-center">
                {isOfficer && singleComplaint.status === 'pending' && (
                  <button 
                    onClick={() => handleUpdateStatus('investigating')} 
                    className="btn btn-primary text-xs"
                  >
                    Start Investigation
                  </button>
                )}
                {isOfficer && singleComplaint.status === 'investigating' && (
                  <button 
                    onClick={() => handleUpdateStatus('resolved')} 
                    className="btn btn-primary text-xs bg-success hover:bg-emerald-600 border-none"
                  >
                    Mark Case Resolved
                  </button>
                )}
                {isOfficer && singleComplaint.status !== 'resolved' && singleComplaint.status !== 'closed' && (
                  <button 
                    onClick={() => handleUpdateStatus('closed')} 
                    className="btn btn-secondary text-xs text-danger border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    Close Case File
                  </button>
                )}
                {user.role === 'admin' && (
                  <button 
                    onClick={handleDeleteComplaint} 
                    className="btn btn-danger text-xs ml-auto"
                  >
                    Delete Case File
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Reporter Info & QR Code */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="glass-panel p-5">
              <h3 className="text-xs font-bold text-slate-900 border-b border-slate-200/60 pb-2 mb-4 uppercase tracking-wider font-heading m-0">
                Reporter Profile
              </h3>
              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Full Name</span>
                  <p className="text-sm font-semibold text-slate-900 m-0">{singleComplaint.reporterName}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Contact Info</span>
                  <p className="text-sm font-semibold text-slate-900 m-0">{singleComplaint.reporterContact || 'No contact provided'}</p>
                </div>
                {singleComplaint.reportedBy && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">System User</span>
                    <p className="text-xs font-semibold text-primary m-0">@{singleComplaint.reportedBy.username}</p>
                  </div>
                )}
              </div>
            </div>

            <ComplaintQRCodeCard complaint={singleComplaint} />
          </div>
        </div>

        {/* Associated Stolen Items Section */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 font-heading">
            <Package size={18} className="text-primary" />
            <span>Registered Stolen Items ({associatedItems.length})</span>
          </h3>

          {associatedItems.length === 0 ? (
            <div className="glass-panel p-8 text-center text-slate-400 text-xs">
              <p>No items registered under this case report.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {associatedItems.map(item => (
                <div key={item._id} className="glass-panel p-5 flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Item Details</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1 m-0">{item.itemName}</h4>
                  </div>
                  
                  <div className="text-xs text-slate-600 flex flex-col gap-2">
                    <div className="flex justify-between border-b border-slate-50 pb-1.5">
                      <span className="text-slate-400">Category</span>
                      <span className="font-semibold text-slate-800 capitalize">{item.category}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5">
                      <span className="text-slate-400">Serial Number</span>
                      <span className="font-mono font-semibold text-slate-800">{item.serialNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5">
                      <span className="text-slate-400">Est. Value</span>
                      <span className="font-semibold text-slate-800">₹{item.estimatedValue ? item.estimatedValue.toLocaleString() : '0'}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/60 pt-3 mt-1 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Status:</span>
                    <strong className={`status-badge status-${item.status} text-[9px]`}>{item.status}</strong>
                  </div>
                  
                  {item.status === 'recovered' && (
                    <div className="mt-1 p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs text-success">
                      <p className="font-bold m-0">Recovery Details:</p>
                      <p className="text-[11px] text-slate-500 mt-1 m-0">Date: {formatDate(item.recoveredDate)}</p>
                      <p className="text-[11px] text-slate-500 m-0">Location: {item.recoveryLocation}</p>
                    </div>
                  )}
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
    <div className="flex flex-col gap-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 font-heading m-0">
            Theft Complaints Database
          </h2>
          <p className="text-slate-500 text-xs mt-0.5 m-0">
            Review and audit public theft reports and file updates
          </p>
        </div>
        <Link to="/complaints/add" className="btn btn-primary text-xs sm:text-sm">
          <FilePlus size={16} />
          <span>File New Theft Report</span>
        </Link>
      </div>

      {/* Filters Panel */}
      <div className="glass-panel p-5 mb-2">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search Input */}
          <div className="flex-1 min-w-[240px] relative">
            <input
              type="text"
              className="form-input pl-9"
              placeholder="Search by case #, title, reporter name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Category Filter */}
          <div className="min-w-[160px]">
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
          <div className="min-w-[160px]">
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
        <div className="text-center py-12 text-slate-500 text-sm">
          <p>Querying case history...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="glass-panel p-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <ClipboardList size={40} className="text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800 m-0">No Complaints Logged</h3>
          <p className="text-xs m-0">No case files match your search query.</p>
        </div>
      ) : (
        <div className="table-container p-1">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Incident Details</th>
                <th>Date Logged</th>
                <th>Reporter</th>
                <th>Status</th>
                <th className="text-center">Inspect</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map(comp => (
                <tr key={comp._id}>
                  <td className="font-mono font-semibold text-primary">
                    {comp.complaintNumber}
                  </td>
                  <td>
                    <div>
                      <div className="font-semibold text-slate-900">{comp.title}</div>
                      <div className="text-[11px] text-slate-500 capitalize mt-0.5">
                        Category: {comp.category} • Location: {comp.theftLocation}
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-500">{formatDate(comp.theftDate)}</td>
                  <td>
                    <div>
                      <div className="font-medium text-slate-900">{comp.reporterName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{comp.reporterContact || 'No phone'}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${comp.status}`}>{comp.status}</span>
                  </td>
                  <td className="text-center">
                    <Link 
                      to={`/complaints/${comp._id}`} 
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 border border-slate-200/60 text-primary hover:bg-primary hover:text-white transition-all duration-200 rotate-180"
                    >
                      <ArrowLeft size={14} />
                    </Link>
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

export default Complaints;
