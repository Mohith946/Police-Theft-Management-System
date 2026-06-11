import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users as UsersIcon, ShieldAlert, Trash2, Search, UserPlus } from 'lucide-react';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add User Form States
  const [addUsername, setAddUsername] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState('officer');
  const [addBadgeNumber, setAddBadgeNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Quick client-side validations
    if (!addEmail.endsWith('@police.gov')) {
      setError('Registration is restricted to official @police.gov email addresses.');
      setSubmitting(false);
      return;
    }

    if (addPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        username: addUsername,
        email: addEmail,
        password: addPassword,
        role: addRole
      };
      if (addRole === 'officer' && addBadgeNumber) {
        payload.badgeNumber = addBadgeNumber;
      }

      // Call register API
      const response = await axios.post('/api/auth/register', payload);

      if (response.data.success) {
        setSuccess(`Account @${addUsername} created successfully.`);
        // Reset form
        setAddUsername('');
        setAddEmail('');
        setAddPassword('');
        setAddRole('officer');
        setAddBadgeNumber('');
        // Refresh list
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to create user:', err);
      setError(err.response?.data?.message || 'Failed to create user account');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/auth/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Access denied or failed to load users registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const confirmMsg = `Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setError('');
      setSuccess('');
      const response = await axios.put(`/api/auth/users/${userId}/role`, { role: newRole });
      if (response.data.success) {
        setSuccess('User role updated successfully');
        fetchUsers(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to update user role:', err);
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId, targetUsername) => {
    if (userId === currentUser._id) {
      alert('You cannot delete your own logged-in administrator account.');
      return;
    }

    const confirmMsg = `Are you sure you want to permanently delete user account @${targetUsername}? This action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setError('');
      setSuccess('');
      const response = await axios.delete(`/api/auth/users/${userId}`);
      if (response.data.success) {
        setSuccess('User account deleted successfully');
        fetchUsers(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError(err.response?.data?.message || 'Failed to delete user account');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      setError('');
      setSuccess('');
      const response = await axios.put(`/api/auth/users/${userId}/status`, { status: newStatus });
      if (response.data.success) {
        setSuccess(`User status updated to ${newStatus} successfully.`);
        fetchUsers(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to update user status:', err);
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  // Client-side filtering
  const filteredUsers = users.filter(usr => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      usr.username.toLowerCase().includes(searchLower) ||
      usr.email.toLowerCase().includes(searchLower) ||
      (usr.badgeNumber && usr.badgeNumber.toLowerCase().includes(searchLower));

    const matchesRole = roleFilter === '' || usr.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 font-heading tracking-tight flex items-center gap-3.5 m-0">
          <ShieldAlert size={36} className="text-primary shrink-0" />
          <span>User Access Control & Members Directory</span>
        </h1>
      </div>

      {/* Message Banners */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-danger text-xs text-center mb-2">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-success text-xs text-center mb-2">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Users list and filters */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Filters Bar */}
          <div className="glass-panel p-5">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="flex-1 min-w-[240px] relative">
                <input
                  type="text"
                  className="form-input pl-9"
                  placeholder="Search users by name, email, badge..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              {/* Role Filter */}
              <div className="min-w-[160px]">
                <select
                  className="form-input"
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="admin">Administrators</option>
                  <option value="officer">Police Officers</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Registry List */}
          {loading ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              <p>Querying security credentials database...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="glass-panel p-16 text-center text-slate-400 flex flex-col items-center gap-3">
              <UsersIcon size={40} className="text-slate-300" />
              <h3 className="text-sm font-bold text-slate-800 m-0">No Accounts Found</h3>
              <p className="text-xs m-0">No user records match your search criteria.</p>
            </div>
          ) : (
            <div className="table-container p-1">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email Address</th>
                    <th>Badge Number</th>
                    <th>Current Role</th>
                    <th>Change Permission</th>
                    <th>Status</th>
                    <th>Access Actions</th>
                    <th className="text-center">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(usr => {
                    const isSelf = usr._id === currentUser._id;

                    return (
                      <tr key={usr._id}>
                        <td className="font-semibold text-slate-900">
                          @{usr.username} {isSelf && <span className="text-[10px] text-blue-500 font-normal ml-1">(You)</span>}
                        </td>
                        <td className="text-slate-600">{usr.email}</td>
                        <td className={`font-mono text-xs ${usr.badgeNumber ? 'text-blue-500' : 'text-slate-400'}`}>
                          {usr.badgeNumber || 'N/A'}
                        </td>
                        <td>
                          <span className={`status-badge text-[9px] ${usr.role === 'admin'
                            ? 'bg-indigo-50 text-primary border border-indigo-200/50'
                            : 'bg-blue-50 text-blue-600 border border-blue-200/50'
                            }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td>
                          <select
                            className="form-input py-1 px-2.5 text-xs w-auto inline-block"
                            value={usr.role}
                            onChange={(e) => handleRoleChange(usr._id, e.target.value)}
                            disabled={isSelf}
                          >
                            <option value="officer">Officer</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>
                        <td>
                          <span className={`status-badge text-[9px] font-bold ${usr.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                            : usr.status === 'denied'
                              ? 'bg-red-50 text-danger border border-red-200/50'
                              : 'bg-amber-50 text-amber-600 border border-amber-200/50'
                            }`}>
                            {usr.status || 'pending'}
                          </span>
                        </td>
                        <td>
                          {!isSelf && (
                            <div className="flex gap-1.5">
                              {usr.status !== 'approved' && (
                                <button
                                  onClick={() => handleStatusChange(usr._id, 'approved')}
                                  className="btn btn-primary py-1 px-2.5 text-[10px] rounded-lg bg-emerald-600 border-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              {usr.status !== 'denied' && (
                                <button
                                  onClick={() => handleStatusChange(usr._id, 'denied')}
                                  className="btn btn-secondary py-1 px-2.5 text-[10px] rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 cursor-pointer"
                                >
                                  Deny
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => handleDeleteUser(usr._id, usr.username)}
                            disabled={isSelf}
                            className={`btn btn-secondary py-1.5 px-3 text-xs flex justify-center items-center gap-1.5 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 ${isSelf ? 'opacity-50 pointer-events-none' : ''
                              }`}
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Add user account form */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 sticky top-6">
            <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2 mb-4 pb-3 border-b border-outline-variant/60 m-0">
              <UserPlus size={18} className="text-primary" />
              <span>Add Official Account</span>
            </h3>

            <form onSubmit={handleAddUser} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="form-label">Username</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. officer3"
                  value={addUsername}
                  onChange={e => setAddUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="name@police.gov"
                  value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Must end with @police.gov
                </span>
              </div>

              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={addPassword}
                  onChange={e => setAddPassword(e.target.value)}
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Minimum of 6 characters
                </span>
              </div>

              <div>
                <label className="form-label">Account Role</label>
                <select
                  className="form-input"
                  value={addRole}
                  onChange={e => setAddRole(e.target.value)}
                >
                  <option value="officer">Officer (Staff)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {addRole === 'officer' && (
                <div>
                  <label className="form-label">Badge Number (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. BADGE-301"
                    value={addBadgeNumber}
                    onChange={e => setAddBadgeNumber(e.target.value)}
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Autogenerated if left blank
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full mt-2"
              >
                <span>{submitting ? 'Creating...' : 'Provision Account'}</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Users;
