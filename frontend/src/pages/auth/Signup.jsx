import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm_password: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/setup', {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      });
      toast.success('Merchant account created! Please login 🎉');
      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.error || '';
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('merchant')) {
        toast.error('A merchant account already exists. Please login instead, or use an invite link to join as Admin/Clerk.');
      } else {
        toast.error(msg || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e293b, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', background: '#1e293b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>📦</div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>Create Merchant Account</h1>
          <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '13px' }}>This creates the main merchant (owner) account. Admins and clerks join via invite link.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {[['full_name','Full Name','John Doe','text'],['email','Email','you@company.com','email'],['password','Password','Min 6 characters','password'],['confirm_password','Confirm Password','Repeat password','password']].map(([name, label, placeholder, type]) => (
            <div key={name} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>{label}</label>
              <input type={type} name={name} placeholder={placeholder} value={form[name]} onChange={handleChange} required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', background: loading ? '#94a3b8' : '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}>
            {loading ? 'Creating...' : 'Create Merchant Account'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.6' }}>
            <strong>Already have an account?</strong> <Link to="/login" style={{ color: '#2563eb' }}>Sign in here</Link><br/>
            <strong>Admin or Clerk?</strong> Use the invite link sent to your email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;