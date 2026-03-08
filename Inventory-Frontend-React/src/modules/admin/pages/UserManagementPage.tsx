import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Shield,
  Calendar,
  Filter,
  Loader2,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import { authApi } from '../../../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at?: string;
  is_active?: boolean;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'staff',
    is_active: true
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authApi.get('/api/v1/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([
        { id: '1', username: 'admin', email: 'admin@example.com', role: 'ADMIN', created_at: '2023-10-01' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      if (isEditMode && editingUserId) {
        // Prepare update data (password optional)
        const updateData: any = {
          username: formData.username,
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active
        };
        if (formData.password) updateData.password = formData.password;

        await authApi.put(`/api/v1/users/${editingUserId}`, updateData);
      } else {
        await authApi.post('/api/v1/register', formData);
      }

      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || `Failed to ${isEditMode ? 'update' : 'add'} user.`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await authApi.delete(`/api/v1/users/${userId}`);
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      alert(error.response?.data?.detail || 'Failed to delete user.');
    }
  };

  const openEditModal = (user: User) => {
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Don't show hashed password
      role: user.role,
      is_active: user.is_active !== false
    });
    setEditingUserId(user.id);
    setIsEditMode(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await authApi.put(`/api/v1/users/${user.id}`, { is_active: !user.is_active });
      setActiveMenu(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      alert(error.response?.data?.detail || 'Failed to update user status.');
    }
  };

  const resetForm = () => {
    setFormData({ username: '', email: '', password: '', role: 'staff', is_active: true });
    setEditingUserId(null);
    setIsEditMode(false);
    setFormError('');
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="users-page">
      <div className="page-header">
        <div className="title-section">
          <div className="icon-wrapper">
            <Users size={24} />
          </div>
          <div>
            <h1>User Management</h1>
            <p>Administer system access and user roles</p>
          </div>
        </div>
        <button className="add-user-btn" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <UserPlus size={18} />
          <span>Add New User</span>
        </button>
      </div>

      <div className="table-controls glass-card">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <button className="filter-btn">
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="table-container glass-card">
        {loading ? (
          <div className="loading-state">
            <Loader2 className="animate-spin" size={32} />
            <p>Loading users...</p>
          </div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>User Information</th>
                <th>Role</th>
                <th>Created Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <span className="username">{user.username}</span>
                        <span className="email">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={`role-badge ${user.role.toLowerCase()}`}>
                      <Shield size={14} />
                      {user.role}
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <Calendar size={14} />
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${user.is_active !== false ? 'active' : 'inactive'}`}>
                      {user.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button title="Edit" onClick={() => openEditModal(user)}><Edit2 size={16} /></button>
                      <button
                        title="Delete"
                        className="delete"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="more-menu-wrapper">
                        <button
                          title="More"
                          onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                          className={activeMenu === user.id ? 'active' : ''}
                        >
                          <MoreVertical size={16} />
                        </button>

                        <AnimatePresence>
                          {activeMenu === user.id && (
                            <>
                              <div className="menu-backdrop" onClick={() => setActiveMenu(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="dropdown-menu glass-card"
                              >
                                <button onClick={() => handleToggleStatus(user)}>
                                  {user.is_active !== false ? 'Deactivate User' : 'Activate User'}
                                </button>
                                <button onClick={() => { alert('Password reset link sent to ' + user.email); setActiveMenu(null); }}>
                                  Reset Password
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="modal-content glass-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{isEditMode ? 'Edit System User' : 'Add New System User'}</h3>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
              </div>

              <form onSubmit={handleSaveUser} className="user-form">
                {formError && <div className="form-error">{formError}</div>}

                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. john_doe"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. john@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Password {isEditMode && '(Leave blank to keep current)'}</label>
                  <input
                    type="password"
                    required={!isEditMode}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div className="form-group">
                  <label>System Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="staff">Staff Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="form-group status-row">
                  <label>Account Status</label>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <span className="slider round"></span>
                  </label>
                  <span className="status-text">{formData.is_active ? 'Active' : 'Inactive'}</span>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="submit-btn" disabled={formLoading}>
                    {formLoading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      isEditMode ? 'Update User' : 'Create User'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .users-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-wrapper {
          width: 48px;
          height: 48px;
          background: var(--primary-glow);
          color: var(--primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .page-header h1 {
          font-size: 24px;
          font-weight: 700;
        }

        .page-header p {
          color: var(--text-dim);
          font-size: 14px;
        }

        .add-user-btn {
          background: var(--primary);
          color: white;
          padding: 10px 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          cursor: pointer;
          position: relative;
          z-index: 10;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .add-user-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
          filter: brightness(1.1);
        }

        .add-user-btn:active {
          transform: translateY(0);
        }

        .table-controls {
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-surface-elevated);
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid var(--border);
          width: 320px;
        }

        .search-box input {
          background: none;
          border: none;
          color: var(--text-main);
          width: 100%;
          font-size: 14px;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          background: var(--bg-surface-elevated);
          color: var(--text-muted);
          border: 1px solid var(--border);
          font-size: 14px;
        }

        .table-container {
          overflow-x: auto;
          background: var(--bg-surface);
        }

        .user-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .user-table th {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          color: var(--text-dim);
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .user-table td {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          font-size: 14px;
        }

        .user-info-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--bg-surface-elevated);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--primary);
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .username { font-weight: 600; color: var(--text-main); }
        .email { font-size: 12px; color: var(--text-dim); }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .role-badge.admin { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
        .role-badge.staff { background: rgba(148, 163, 184, 0.1); color: var(--text-muted); }

        .date-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-dim);
        }

        .status-pill {
          padding: 2px 10px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-pill.active { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .status-pill.inactive { background: rgba(100, 116, 139, 0.1); color: var(--text-dim); }

        .action-btns {
          display: flex;
          gap: 12px;
          color: var(--text-dim);
        }

        .action-btns button:hover { color: var(--text-main); }
        .action-btns button.delete:hover { color: var(--danger); }
        .action-btns button.active { color: var(--primary); }

        .more-menu-wrapper {
          position: relative;
        }

        .menu-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 100;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          min-width: 160px;
          display: flex;
          flex-direction: column;
          padding: 8px;
          z-index: 101;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }

        .dropdown-menu button {
          width: 100%;
          text-align: left;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
          transition: all 0.2s;
        }

        .dropdown-menu button:hover {
          background: var(--bg-surface-elevated);
          color: var(--primary);
        }

        .loading-state {
          padding: 60px;
          text-align: center;
          color: var(--text-dim);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          width: 100%;
          max-width: 500px;
          padding: 32px;
          border: 1px solid var(--border);
          position: relative;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .modal-header h3 {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-main);
        }

        .close-btn {
          color: var(--text-dim);
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: var(--danger);
        }

        .user-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .form-group input, .form-group select {
          padding: 12px 16px;
          border-radius: 10px;
          background: var(--bg-surface-elevated);
          border: 1px solid var(--border);
          color: var(--text-main);
          font-size: 14px;
          transition: all 0.2s;
        }

        .form-group input:focus, .form-group select:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 2px var(--primary-glow);
        }

        .form-error {
          padding: 12px;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--danger);
          color: var(--danger);
          font-size: 13px;
          font-weight: 500;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 12px;
        }

        .cancel-btn {
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          color: var(--text-muted);
          transition: all 0.2s;
        }

        .cancel-btn:hover {
          background: var(--bg-surface-elevated);
          color: var(--text-main);
        }

        .submit-btn {
          background: var(--primary);
          color: white;
          padding: 10px 24px;
          border-radius: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 120px;
          transition: all 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Toggle Switch Styles */
        .status-row {
          flex-direction: row !important;
          align-items: center;
          gap: 16px;
          padding: 8px 0;
        }

        .status-text {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--border);
          transition: .4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: var(--primary);
        }

        input:focus + .slider {
          box-shadow: 0 0 1px var(--primary);
        }

        input:checked + .slider:before {
          transform: translateX(20px);
        }
      `}</style>
    </div >
  );
};

export default UserManagementPage;
