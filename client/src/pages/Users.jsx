import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users as UsersIcon, ShieldAlert, Trash2, Search } from 'lucide-react';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        <h2 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2 m-0">
          <ShieldAlert size={22} className="text-primary" />
          <span>User Access Control & Members Directory</span>
        </h2>
        <p className="text-slate-500 text-xs mt-0.5 m-0">
          Grant, upgrade, or revoke authorization levels for police officers and administrators
        </p>
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

      {/* Filters Bar */}
      <div className="glass-panel p-5 mb-2">
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
                <th className="text-center">Actions</th>
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
                      <span className={`status-badge text-[9px] ${
                        usr.role === 'admin' 
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
                    <td className="text-center">
                      <button
                        onClick={() => handleDeleteUser(usr._id, usr.username)}
                        disabled={isSelf}
                        className={`btn btn-secondary py-1.5 px-3 text-xs flex justify-center items-center gap-1.5 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 ${
                          isSelf ? 'opacity-50 pointer-events-none' : ''
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
  );
};

export default Users;
