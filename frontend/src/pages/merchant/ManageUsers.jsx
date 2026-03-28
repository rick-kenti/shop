import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const ManageUsers = () => {
  const [admins, setAdmins] = useState([]);
  const [clerks, setClerks] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'admin', store_id: '' });
  const [inviting, setInviting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Fetch users and stores separately so one failure doesn't block both
      let users = [];
      let storeList = [];

      try {
        const usersRes = await api.get('/auth/users');
        users = usersRes.data.users || [];
      } catch (e) {
        toast.error('Could not load users: ' + (e.response?.data?.error || e.message));
      }

      try {
        const storesRes = await api.get('/stores/');
        storeList = storesRes.data.stores || [];
      } catch (e) {
        toast.error('Could not load stores: ' + (e.response?.data?.error || e.message));
      }

      setAdmins(users.filter(u => u.role === 'admin'));
      setClerks(users.filter(u => u.role === 'clerk'));
      setStores(storeList);
    } finally {
      setLoading(false);
    }
  };

  const [lastInviteLink, setLastInviteLink] = useState(null);

const handleInvite = async (e) => {
  e.preventDefault();
  if (!inviteForm.email) { toast.error('Email is required'); return; }
  setInviting(true);
  try {
    const payload = { email: inviteForm.email, role: inviteForm.role };
    if (inviteForm.store_id) payload.store_id = parseInt(inviteForm.store_id);
    const res = await api.post('/auth/invite', payload);
    const link = res.data.invite_link;
    setLastInviteLink(link);
    toast.success(`Invite created for ${inviteForm.email} ✅`);
    setInviteForm({ email: '', role: 'admin', store_id: '' });
    fetchAll();
  } catch (error) {
    toast.error(error.response?.data?.error || 'Failed to send invite');
  } finally {
    setInviting(false);
  }
};

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Remove ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/auth/users/${userId}`);
      toast.success(`${name} removed`);
      fetchAll();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  };

  const handleToggle = async (userId, isActive, name) => {
    try {
      await api.patch(`/auth/users/${userId}/toggle`, { is_active: !isActive });
      toast.success(`${name} ${!isActive ? 'activated' : 'deactivated'}`);
      fetchAll();
    } catch {
      toast.error('Update failed');
    }
  };

  const getStoreName = (storeId) => stores.find(s => s.id === storeId)?.name || '—';

  const UserRow = ({ user }) => (
    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
      <td style={{ padding: '10px 16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>{user.full_name || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Pending</span>}</td>
      <td style={{ padding: '10px 16px', fontSize: '14px', color: '#6b7280' }}>{user.email}</td>
      <td style={{ padding: '10px 16px', fontSize: '14px', color: '#6b7280' }}>{getStoreName(user.store_id)}</td>
      <td style={{ padding: '10px 16px' }}>
        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: user.is_active ? '#d1fae5' : '#fee2e2', color: user.is_active ? '#065f46' : '#991b1b' }}>
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td style={{ padding: '10px 16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => handleToggle(user.id, user.is_active, user.full_name || user.email)}
            style={{ padding: '5px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#374151' }}>
            {user.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <button onClick={() => handleDelete(user.id, user.full_name || user.email)}
            style={{ padding: '5px 12px', fontSize: '12px', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fef2f2', cursor: 'pointer', color: '#991b1b' }}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  const UserTable = ({ users, title, color }) => (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '24px', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{title}</h3>
        <span style={{ padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', ...color }}>{users.length} total</span>
      </div>
      {users.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👤</div>
          <p style={{ margin: 0, fontSize: '14px' }}>No {title.toLowerCase()} yet. Use the invite form above.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Name', 'Email', 'Store', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => <UserRow key={u.id} user={u} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout title="Manage Users 👥">
      {/* Invite Form */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Invite New User</h3>
        <form onSubmit={handleInvite}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email *</label>
              <input type="email" placeholder="user@company.com" value={inviteForm.email}
                onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} required
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Role *</label>
              <select value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}>
                <option value="admin">Admin</option>
                <option value="clerk">Clerk</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Assign Store {stores.length === 0 && <span style={{ color: '#ef4444', fontWeight: '400' }}>(no stores yet)</span>}
              </label>
              <select value={inviteForm.store_id} onChange={e => setInviteForm({ ...inviteForm, store_id: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}>
                <option value="">No store assigned</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          {stores.length === 0 && (
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#f59e0b', background: '#fffbeb', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fde68a' }}>
              ⚠️ No stores exist yet. Go to <strong>Stores</strong> in the sidebar to create one first, then come back to invite users.
            </p>
          )}
          <button type="submit" disabled={inviting}
            style={{ padding: '10px 24px', background: inviting ? '#94a3b8' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: inviting ? 'not-allowed' : 'pointer' }}>
                  {lastInviteLink && (
  <div style={{ marginTop: '16px', padding: '14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}>
    <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '600', color: '#15803d' }}>
      ✅ Invite link ready — share this with the user:
    </p>
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input
        readOnly
        value={lastInviteLink}
        style={{ flex: 1, padding: '8px 10px', border: '1px solid #86efac', borderRadius: '6px', fontSize: '12px', background: '#fff', color: '#374151' }}
      />
      <button
        type="button"
        onClick={() => { navigator.clipboard.writeText(lastInviteLink); toast.success('Link copied!'); }}
        style={{ padding: '8px 14px', background: '#15803d', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
        Copy Link
      </button>
    </div>
    <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#64748b' }}>
      The user opens this link to set their name and password.
    </p>
  </div>
)}
            {inviting ? 'Sending...' : 'Send Invite ✉️'}
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <p>Loading users...</p>
        </div>
      ) : (
        <>
          <UserTable users={admins} title="Admins" color={{ background: '#eff6ff', color: '#1d4ed8' }} />
          <UserTable users={clerks} title="Clerks" color={{ background: '#f0fdf4', color: '#15803d' }} />
        </>
      )}
    </DashboardLayout>
  );
};

export default ManageUsers;