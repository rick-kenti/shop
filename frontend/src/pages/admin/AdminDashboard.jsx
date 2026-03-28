import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEntries, fetchSummary } from '../../store/slices/inventorySlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { entries, summary, loading, pages, currentPage } = useSelector(s => s.inventory);
  const { user } = useSelector(s => s.auth);

  const [products, setProducts] = useState([]);
  const [supplyRequests, setSupplyRequests] = useState([]);
  const [clerks, setClerks] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Determine active tab from URL
  const path = location.pathname;
  const activeTab = path.includes('products') ? 'products'
    : path.includes('inventory') ? 'inventory'
    : path.includes('supply') ? 'supply'
    : path.includes('clerks') ? 'clerks'
    : 'dashboard';

  useEffect(() => {
    dispatch(fetchEntries({ page: 1, per_page: 20 }));
    dispatch(fetchSummary());
    loadProducts();
    loadSupplyRequests();
    loadClerks();
  }, [dispatch]);

  const loadProducts = async () => {
    try {
      const res = await api.get('/products/');
      setProducts(res.data.products || []);
    } catch (e) {
      console.error('Products error:', e.response?.data || e.message);
    }
  };

  const loadSupplyRequests = async () => {
    try {
      const res = await api.get('/supply-requests/');
      setSupplyRequests(res.data.requests || []);
    } catch (e) {
      console.error('Supply requests error:', e.response?.data || e.message);
    }
  };

  const loadClerks = async () => {
    try {
      const res = await api.get('/auth/users');
      setClerks((res.data.users || []).filter(u => u.role === 'clerk'));
    } catch (e) {
      console.error('Clerks error:', e.response?.data || e.message);
    }
  };

  const handleRespond = async (requestId, status) => {
    try {
      await api.patch(`/supply-requests/${requestId}/respond`, { status });
      toast.success(`Request ${status} ✅`);
      loadSupplyRequests();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed');
    }
  };

  const chartData = entries.slice(0, 8).map(e => ({
    name: (e.product_name || 'Item').slice(0, 10),
    received: e.quantity_received,
    inStock: e.quantity_in_stock,
    spoilt: e.quantity_spoilt,
  }));

  // ── DASHBOARD TAB ──
  const DashboardTab = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Total Received" value={summary?.total_items_received || 0} icon="📥" color="bg-blue-500" />
        <StatCard title="In Stock" value={summary?.total_items_in_stock || 0} icon="📦" color="bg-green-500" />
        <StatCard title="Total Spoilt" value={summary?.total_items_spoilt || 0} icon="🗑️" color="bg-red-500" />
        <StatCard title="Unpaid Amount" value={`KES ${summary?.total_unpaid_amount || 0}`} icon="💰" color="bg-yellow-500" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="card">
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '600' }}>Stock Overview</h3>
          {loading || chartData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              {loading ? 'Loading...' : 'No data yet. Record inventory entries to see charts.'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="received" fill="#4F46E5" name="Received" radius={[4,4,0,0]} />
                <Bar dataKey="inStock" fill="#10B981" name="In Stock" radius={[4,4,0,0]} />
                <Bar dataKey="spoilt" fill="#EF4444" name="Spoilt" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '600' }}>Stock Trend</h3>
          {loading || chartData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              {loading ? 'Loading...' : 'No data yet. Charts will appear after entries are recorded.'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="received" stroke="#4F46E5" strokeWidth={2} name="Received" />
                <Line type="monotone" dataKey="inStock" stroke="#10B981" strokeWidth={2} name="In Stock" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="card" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
          <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '13px' }}>Total Paid</p>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#15803d' }}>KES {summary?.total_paid_amount || 0}</p>
        </div>
        <div className="card" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
          <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '13px' }}>Total Unpaid</p>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#dc2626' }}>KES {summary?.total_unpaid_amount || 0}</p>
        </div>
      </div>
    </>
  );

  // ── PRODUCTS TAB ──
  const ProductsTab = () => (
    <div className="card">
      <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>Products in Your Store</h3>
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
          <p>No products yet. Ask your merchant to add products to this store.</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['#', 'Product Name', 'Description', 'Added'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 14px', color: '#9ca3af' }}>{i + 1}</td>
                <td style={{ padding: '10px 14px', fontWeight: '500', color: '#111827' }}>{p.name}</td>
                <td style={{ padding: '10px 14px', color: '#6b7280' }}>{p.description || '—'}</td>
                <td style={{ padding: '10px 14px', color: '#6b7280' }}>{p.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // ── INVENTORY TAB ──
  const InventoryTab = () => (
    <div className="card">
      <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>Inventory Entries</h3>
      {loading ? <LoadingSpinner /> : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
          <p>No inventory entries yet. Clerks will record entries here.</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Product', 'Clerk', 'Received', 'In Stock', 'Spoilt', 'Buy Price', 'Sell Price', 'Payment', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: '500' }}>{e.product_name}</td>
                    <td style={{ padding: '10px 12px', color: '#6b7280' }}>{e.clerk_name}</td>
                    <td style={{ padding: '10px 12px' }}>{e.quantity_received}</td>
                    <td style={{ padding: '10px 12px' }}>{e.quantity_in_stock}</td>
                    <td style={{ padding: '10px 12px', color: '#dc2626' }}>{e.quantity_spoilt}</td>
                    <td style={{ padding: '10px 12px' }}>KES {e.buying_price}</td>
                    <td style={{ padding: '10px 12px' }}>KES {e.selling_price}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: e.payment_status === 'paid' ? '#d1fae5' : '#fee2e2', color: e.payment_status === 'paid' ? '#065f46' : '#991b1b' }}>
                        {e.payment_status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap' }}>{e.recorded_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={pages} onPageChange={p => dispatch(fetchEntries({ page: p }))} />
        </>
      )}
    </div>
  );

  // ── SUPPLY REQUESTS TAB ──
  const SupplyTab = () => (
    <div className="card">
      <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>Supply Requests</h3>
      {supplyRequests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚚</div>
          <p>No supply requests yet.</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Product', 'Clerk', 'Qty', 'Note', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '12px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {supplyRequests.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 14px', fontWeight: '500' }}>{r.product_name}</td>
                <td style={{ padding: '10px 14px', color: '#6b7280' }}>{r.clerk_name}</td>
                <td style={{ padding: '10px 14px' }}>{r.quantity_requested}</td>
                <td style={{ padding: '10px 14px', color: '#6b7280', maxWidth: '200px' }}>{r.note || '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: r.status === 'approved' ? '#d1fae5' : r.status === 'declined' ? '#fee2e2' : '#fef9c3', color: r.status === 'approved' ? '#065f46' : r.status === 'declined' ? '#991b1b' : '#713f12' }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  {r.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleRespond(r.id, 'approved')}
                        style={{ padding: '4px 12px', fontSize: '12px', background: '#d1fae5', border: '1px solid #86efac', borderRadius: '6px', cursor: 'pointer', color: '#065f46', fontWeight: '600' }}>
                        Approve
                      </button>
                      <button onClick={() => handleRespond(r.id, 'declined')}
                        style={{ padding: '4px 12px', fontSize: '12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', color: '#991b1b', fontWeight: '600' }}>
                        Decline
                      </button>
                    </div>
                  )}
                  {r.status !== 'pending' && <span style={{ color: '#9ca3af', fontSize: '12px' }}>Done</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // ── CLERKS TAB ──
  const ClerksTab = () => (
    <div className="card">
      <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>Clerks in Your Store</h3>
      {clerks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
          <p>No clerks assigned to your store yet.</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Name', 'Email', 'Status', 'Joined'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '12px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clerks.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 14px', fontWeight: '500' }}>{c.full_name || 'Pending'}</td>
                <td style={{ padding: '10px 14px', color: '#6b7280' }}>{c.email}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', background: c.is_active ? '#d1fae5' : '#fee2e2', color: c.is_active ? '#065f46' : '#991b1b' }}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', color: '#9ca3af', fontSize: '12px' }}>{c.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const tabTitle = {
    dashboard: `Admin Dashboard 👔`,
    products: 'Products 📦',
    inventory: 'Inventory Entries 📋',
    supply: 'Supply Requests 🚚',
    clerks: 'Clerks 📝',
  };

  return (
    <DashboardLayout title={tabTitle[activeTab]}>
      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'products' && <ProductsTab />}
      {activeTab === 'inventory' && <InventoryTab />}
      {activeTab === 'supply' && <SupplyTab />}
      {activeTab === 'clerks' && <ClerksTab />}
    </DashboardLayout>
  );
};

export default AdminDashboard;