import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEntries, fetchSummary } from '../../store/slices/inventorySlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const ClerkDashboard = () => {
  const dispatch = useDispatch();
  const { entries, summary, loading, pages, currentPage } = useSelector(s => s.inventory);
  const { user } = useSelector(s => s.auth);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    dispatch(fetchEntries({ page: 1 }));
    dispatch(fetchSummary());
  }, [dispatch]);

  const handlePageChange = (page) => dispatch(fetchEntries({ page }));

  const handleDelete = async (entryId) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await api.delete(`/inventory/${entryId}`);
      toast.success('Entry deleted');
      dispatch(fetchEntries({ page: currentPage }));
      dispatch(fetchSummary());
    } catch (e) {
      toast.error(e.response?.data?.error || 'Delete failed');
    }
  };

  const handleEditOpen = (entry) => {
    setEditingEntry(entry.id);
    setEditForm({
      quantity_received: entry.quantity_received,
      quantity_in_stock: entry.quantity_in_stock,
      quantity_spoilt: entry.quantity_spoilt,
      buying_price: entry.buying_price,
      selling_price: entry.selling_price,
      payment_status: entry.payment_status,
    });
  };

  const handleEditSave = async (entryId) => {
    try {
      await api.put(`/inventory/${entryId}`, editForm);
      toast.success('Entry updated ✅');
      setEditingEntry(null);
      dispatch(fetchEntries({ page: currentPage }));
      dispatch(fetchSummary());
    } catch (e) {
      toast.error(e.response?.data?.error || 'Update failed');
    }
  };

  const tdStyle = { padding: '10px 12px', fontSize: '13px', borderBottom: '1px solid #f1f5f9' };
  const inputStyle = { padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px', width: '70px' };

  return (
    <DashboardLayout title={`Welcome back, ${user?.full_name || 'Clerk'} 👋`}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Items Received" value={summary?.total_items_received || 0} icon="📥" color="bg-blue-500" />
        <StatCard title="In Stock" value={summary?.total_items_in_stock || 0} icon="📦" color="bg-green-500" />
        <StatCard title="Spoilt" value={summary?.total_items_spoilt || 0} icon="🗑️" color="bg-red-500" />
        <StatCard title="My Entries" value={summary?.total_entries || 0} icon="📋" color="bg-purple-500" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>My Inventory Entries</h3>
        </div>

        {loading ? <LoadingSpinner /> : entries.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📋</div>
            <p>No entries yet. Use the sidebar to record your first entry.</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Product','Received','In Stock','Spoilt','Buy Price','Sell Price','Payment','Date','Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id} style={{ background: editingEntry === entry.id ? '#f0fdf4' : '#fff' }}>
                      <td style={tdStyle}><strong>{entry.product_name}</strong></td>

                      {editingEntry === entry.id ? (
                        <>
                          <td style={tdStyle}><input style={inputStyle} type="number" value={editForm.quantity_received} onChange={e => setEditForm({...editForm, quantity_received: parseInt(e.target.value)})} /></td>
                          <td style={tdStyle}><input style={inputStyle} type="number" value={editForm.quantity_in_stock} onChange={e => setEditForm({...editForm, quantity_in_stock: parseInt(e.target.value)})} /></td>
                          <td style={tdStyle}><input style={inputStyle} type="number" value={editForm.quantity_spoilt} onChange={e => setEditForm({...editForm, quantity_spoilt: parseInt(e.target.value)})} /></td>
                          <td style={tdStyle}><input style={inputStyle} type="number" value={editForm.buying_price} onChange={e => setEditForm({...editForm, buying_price: parseFloat(e.target.value)})} /></td>
                          <td style={tdStyle}><input style={inputStyle} type="number" value={editForm.selling_price} onChange={e => setEditForm({...editForm, selling_price: parseFloat(e.target.value)})} /></td>
                          <td style={tdStyle}>
                            <select style={{ ...inputStyle, width: '80px' }} value={editForm.payment_status} onChange={e => setEditForm({...editForm, payment_status: e.target.value})}>
                              <option value="unpaid">Unpaid</option>
                              <option value="paid">Paid</option>
                            </select>
                          </td>
                          <td style={tdStyle}>{entry.recorded_at}</td>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => handleEditSave(entry.id)} style={{ padding: '4px 10px', fontSize: '12px', background: '#d1fae5', border: '1px solid #86efac', borderRadius: '6px', cursor: 'pointer', color: '#065f46', fontWeight: '600' }}>Save</button>
                              <button onClick={() => setEditingEntry(null)} style={{ padding: '4px 10px', fontSize: '12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#475569' }}>Cancel</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={tdStyle}>{entry.quantity_received}</td>
                          <td style={tdStyle}>{entry.quantity_in_stock}</td>
                          <td style={{ ...tdStyle, color: '#dc2626' }}>{entry.quantity_spoilt}</td>
                          <td style={tdStyle}>KES {entry.buying_price}</td>
                          <td style={tdStyle}>KES {entry.selling_price}</td>
                          <td style={tdStyle}>
                            <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', background: entry.payment_status === 'paid' ? '#d1fae5' : '#fee2e2', color: entry.payment_status === 'paid' ? '#065f46' : '#991b1b' }}>
                              {entry.payment_status}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap' }}>{entry.recorded_at}</td>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => handleEditOpen(entry)} style={{ padding: '4px 10px', fontSize: '12px', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '6px', cursor: 'pointer', color: '#1d4ed8', fontWeight: '600' }}>Edit</button>
                              <button onClick={() => handleDelete(entry.id)} style={{ padding: '4px 10px', fontSize: '12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', color: '#991b1b', fontWeight: '600' }}>Delete</button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px' }}>
              <Pagination currentPage={currentPage} totalPages={pages} onPageChange={handlePageChange} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClerkDashboard;