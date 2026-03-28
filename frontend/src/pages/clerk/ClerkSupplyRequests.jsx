import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const ClerkSupplyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ product_id: '', quantity_requested: '', note: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchProducts();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/supply-requests/');
      setRequests(res.data.requests || []);
    } catch (e) {
      toast.error('Failed to load requests: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/');
      setProducts(res.data.products || []);
    } catch (e) {
      console.error('Products error:', e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_id) { toast.error('Select a product'); return; }
    if (!form.quantity_requested || form.quantity_requested <= 0) { toast.error('Enter a valid quantity'); return; }
    setSubmitting(true);
    try {
      await api.post('/supply-requests/', {
        product_id: parseInt(form.product_id),
        quantity_requested: parseInt(form.quantity_requested),
        note: form.note,
      });
      toast.success('Supply request submitted ✅');
      setForm({ product_id: '', quantity_requested: '', note: '' });
      fetchRequests();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle = (status) => ({
    padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
    background: status === 'approved' ? '#d1fae5' : status === 'declined' ? '#fee2e2' : '#fef9c3',
    color: status === 'approved' ? '#065f46' : status === 'declined' ? '#991b1b' : '#713f12',
  });

  return (
    <DashboardLayout title="Supply Requests 🚚">
      {/* New request form */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>New Supply Request</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Product *</label>
              <select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })} required
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}>
                <option value="">Select product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Quantity *</label>
              <input type="number" min="1" value={form.quantity_requested}
                onChange={e => setForm({ ...form, quantity_requested: e.target.value })} required
                placeholder="e.g. 50"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Note (optional)</label>
              <input type="text" value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
                placeholder="e.g. Running low on stock"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
          </div>
          <button type="submit" disabled={submitting}
            style={{ padding: '10px 24px', background: submitting ? '#94a3b8' : '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? 'Submitting...' : 'Submit Request 🚚'}
          </button>
        </form>
      </div>

      {/* Requests list */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>My Requests</h3>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading...</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚚</div>
            <p>No requests yet. Use the form above to request supplies.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Product', 'Qty Requested', 'Note', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '12px' }}>{h}</th>
                ))}
              </tr>
            </thead>
           <tbody>
  {requests.map(r => (
    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
      <td style={{ padding: '10px 16px', fontWeight: '500' }}>{r.product_name}</td>
      <td style={{ padding: '10px 16px' }}>{r.quantity_requested}</td>
      <td style={{ padding: '10px 16px', color: '#6b7280' }}>{r.note || '—'}</td>
      <td style={{ padding: '10px 16px' }}>
        <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
          background: r.status === 'approved' ? '#d1fae5' : r.status === 'declined' ? '#fee2e2' : '#fef9c3',
          color: r.status === 'approved' ? '#065f46' : r.status === 'declined' ? '#991b1b' : '#713f12' }}>
          {r.status}
        </span>
      </td>
      <td style={{ padding: '10px 16px', color: '#9ca3af', fontSize: '12px' }}>{r.created_at}</td>
      <td style={{ padding: '10px 16px' }}>
        {r.status === 'pending' && (
          <button
            onClick={async () => {
              if (!window.confirm('Delete this request?')) return;
              try {
                await api.delete(`/supply-requests/${r.id}`);
                toast.success('Request deleted');
                fetchRequests();
              } catch (e) {
                toast.error(e.response?.data?.error || 'Delete failed');
              }
            }}
            style={{ padding: '4px 12px', fontSize: '12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', color: '#991b1b', fontWeight: '600' }}>
            Delete
          </button>
        )}
      </td>
    </tr>
  ))}
</tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClerkSupplyRequests;