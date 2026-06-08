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
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={22} color="var(--primary)" />
          <span>User Access Control & Members Directory</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Grant, upgrade, or revoke authorization levels for police officers and administrators
        </p>
      </div>

      {/* Message Banners */}
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

      {success && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem',
          color: 'var(--success)',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          {success}
        </div>
      )}

      {/* Filters Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search users by name, email, badge..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Role Filter */}
          <div style={{ minWidth: '160px' }}>
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
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <p>Querying security credentials database...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <UsersIcon size={40} style={{ marginBottom: '1rem' }} />
          <h3>No Accounts Found</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>No user records match your search criteria.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email Address</th>
                  <th>Badge Number</th>
                  <th>Current Role</th>
                  <th>Change Permission</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(usr => {
                  const isSelf = usr._id === currentUser._id;
                  
                  return (
                    <tr key={usr._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        @{usr.username} {isSelf && <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 'normal' }}>(You)</span>}
                      </td>
                      <td>{usr.email}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: usr.badgeNumber ? '#3b82f6' : 'var(--text-muted)' }}>
                        {usr.badgeNumber || 'N/A'}
                      </td>
                      <td>
                        <span className={`status-badge`} style={{
                          background: usr.role === 'admin' ? 'rgba(4, 22, 39, 0.08)' : usr.role === 'officer' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(116, 119, 125, 0.08)',
                          color: usr.role === 'admin' ? 'var(--primary)' : usr.role === 'officer' ? '#3b82f6' : 'var(--text-muted)',
                          border: usr.role === 'admin' ? '1px solid var(--primary)' : usr.role === 'officer' ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                        }}>
                          {usr.role}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-input"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', width: 'auto', display: 'inline-block' }}
                          value={usr.role}
                          onChange={(e) => handleRoleChange(usr._id, e.target.value)}
                          disabled={isSelf}
                        >
                          <option value="officer">Officer</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteUser(usr._id, usr.username)}
                          disabled={isSelf}
                          className="btn btn-secondary"
                          style={{
                            padding: '0.4rem 0.6rem',
                            fontSize: '0.75rem',
                            borderColor: 'var(--border-color)',
                            color: isSelf ? 'var(--text-muted)' : 'var(--danger)',
                            opacity: isSelf ? 0.5 : 1
                          }}
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
        </div>
      )}
    </div>
  );
};

export default Users;
