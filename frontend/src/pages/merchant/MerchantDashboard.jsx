import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSummary } from '../../store/slices/inventorySlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const MerchantDashboard = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { summary } = useSelector(s => s.inventory);
  const { user } = useSelector(s => s.auth);

  const storeNameRef = React.useRef('');
  const storeLocationRef = React.useRef('');
  const [stores, setStores] = useState([]);
  const [storeReports, setStoreReports] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', location: '' });
  const [addingStore, setAddingStore] = useState(false);

  const path = location.pathname;
  const activeTab = path.includes('stores') ? 'stores'
    : path.includes('admins') ? 'admins'
    : path.includes('reports') ? 'reports'
    : 'dashboard';

  useEffect(() => {
    dispatch(fetchSummary());
    loadStores();
    loadAdmins();
  }, [dispatch]);

  const loadStores = async () => {
    setLoadingStores(true);
    try {
      const res = await api.get('/stores/');
      const list = res.data.stores || [];
      setStores(list);
      if (list.length > 0) {
        const reports = await Promise.all(list.map(async (s) => {
          try {
            const r = await api.get(`/inventory/report/summary?store_id=${s.id}`);
            return { name: s.name, ...r.data.summary };
          } catch {
            return { name: s.name, total_items_in_stock: 0, total_items_spoilt: 0, total_paid_amount: 0, total_unpaid_amount: 0 };
          }
        }));
        setStoreReports(reports);
      }
    } catch (e) {
      toast.error('Could not load stores: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoadingStores(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const res = await api.get('/auth/users');
      setAdmins((res.data.users || []).filter(u => u.role === 'admin'));
    } catch (e) {
      console.error('Admins load error:', e.response?.data || e.message);
    }
  };

 const handleAddStore = async (e) => {
  e.preventDefault();
  const name = storeNameRef.current;
  const location = storeLocationRef.current;
  if (!name) { toast.error('Store name is required'); return; }
  setAddingStore(true);
  try {
    await api.post('/stores/', { name, location });
    toast.success('Store created ✅');
    storeNameRef.current = '';
    storeLocationRef.current = '';
    loadStores();
  } catch (e) {
    toast.error(e.response?.data?.error || 'Failed to create store');
  } finally {
    setAddingStore(false);
  }
};
  const handleDeleteStore = async (storeId, name) => {
    if (!window.confirm(`Delete store "${name}"?`)) return;
    try {
      await api.delete(`/stores/${storeId}`);
      toast.success('Store deleted');
      loadStores();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Delete failed');
    }
  };

  const tabTitle = {
    dashboard: `Merchant Overview 👑`,
    stores: 'Stores 🏪',
    admins: 'Admins 👔',
    reports: 'Reports 📈',
  };

  // ── DASHBOARD TAB ──
  const DashboardTab = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Total Stores" value={stores.length} icon="🏪" color="bg-purple-500" />
        <StatCard title="Items in Stock" value={summary?.total_items_in_stock || 0} icon="📦" color="bg-blue-500" />
        <StatCard title="Total Paid" value={`KES ${summary?.total_paid_amount || 0}`} icon="✅" color="bg-green-500" />
        <StatCard title="Total Unpaid" value={`KES ${summary?.total_unpaid_amount || 0}`} icon="⏳" color="bg-red-500" />
      </div>

      {stores.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏪</div>
          <p style={{ margin: '0 0 16px', fontSize: '15px' }}>No stores yet. Go to the <strong>Stores</strong> tab to create your first store.</p>
          <button onClick={() => navigate('/merchant/stores')}
            style={{ padding: '10px 24px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            Create a Store →
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: '16px' }}>
          {stores.map(s => (
            <div key={s.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '24px' }}>🏪</span>
                <div>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{s.name}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{s.location || 'No location'}</p>
                </div>
              </div>
              <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: s.is_active ? '#d1fae5' : '#fee2e2', color: s.is_active ? '#065f46' : '#991b1b' }}>
                {s.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );

  // ── STORES TAB ──
  const StoresTab = () => (
    <>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>Add New Store</h3>
        <form onSubmit={handleAddStore} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Store Name *</label>
            <input defaultValue=""onChange={e => { storeNameRef.current = e.target.value; }} placeholder="e.g. Main Branch" style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}/>
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Location</label>
            <input defaultValue=""onChange={e => { storeLocationRef.current = e.target.value; }} placeholder="e.g. Nairobi CBD"style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={addingStore}
              style={{ padding: '9px 24px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              {addingStore ? 'Adding...' : '+ Add Store'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>All Stores ({stores.length})</h3>
        </div>
        {loadingStores ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
        ) : stores.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏪</div>
            <p>No stores yet. Use the form above to add your first store.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Store Name', 'Location', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stores.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '500', color: '#111827' }}>{s.name}</td>
                  <td style={{ padding: '12px 16px', color: '#6b7280' }}>{s.location || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: s.is_active ? '#d1fae5' : '#fee2e2', color: s.is_active ? '#065f46' : '#991b1b' }}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleDeleteStore(s.id, s.name)}
                      style={{ padding: '5px 14px', fontSize: '12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', color: '#991b1b', fontWeight: '600' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  // ── ADMINS TAB ──
  const AdminsTab = () => (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>All Admins</h3>
        <button onClick={() => navigate('/merchant/users')}
          style={{ padding: '7px 16px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
          + Invite Admin
        </button>
      </div>
      {admins.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👔</div>
          <p>No admins yet.</p>
          <button onClick={() => navigate('/merchant/users')}
            style={{ padding: '8px 20px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            Go to Manage Users →
          </button>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Name', 'Email', 'Store', 'Status', 'Joined'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', fontWeight: '500' }}>{a.full_name || <em style={{ color: '#9ca3af' }}>Pending</em>}</td>
                <td style={{ padding: '12px 16px', color: '#6b7280' }}>{a.email}</td>
                <td style={{ padding: '12px 16px', color: '#6b7280' }}>{stores.find(s => s.id === a.store_id)?.name || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: a.is_active ? '#d1fae5' : '#fee2e2', color: a.is_active ? '#065f46' : '#991b1b' }}>
                    {a.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: '12px' }}>{a.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // ── REPORTS TAB ──
  const ReportsTab = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '600' }}>Stock by Store</h3>
          {storeReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '13px' }}>No store data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={storeReports}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_items_in_stock" fill="#4F46E5" name="In Stock" radius={[4,4,0,0]} />
                <Bar dataKey="total_items_spoilt" fill="#EF4444" name="Spoilt" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '600' }}>Payments by Store</h3>
          {storeReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: '13px' }}>No payment data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={storeReports}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total_paid_amount" stroke="#10B981" strokeWidth={2} name="Paid (KES)" dot={{ r: 5 }} />
                <Line type="monotone" dataKey="total_unpaid_amount" stroke="#EF4444" strokeWidth={2} name="Unpaid (KES)" dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '20px' }}>
          <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '13px' }}>Total Paid (All Stores)</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#15803d' }}>KES {summary?.total_paid_amount || 0}</p>
        </div>
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '20px' }}>
          <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '13px' }}>Total Unpaid (All Stores)</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#dc2626' }}>KES {summary?.total_unpaid_amount || 0}</p>
        </div>
      </div>
    </>
  );

  return (
    <DashboardLayout title={tabTitle[activeTab]}>
      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'stores' && <StoresTab />}
      {activeTab === 'admins' && <AdminsTab />}
      {activeTab === 'reports' && <ReportsTab />}
    </DashboardLayout>
  );
};

export default MerchantDashboard;