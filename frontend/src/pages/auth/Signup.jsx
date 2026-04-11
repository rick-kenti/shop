import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'merchant',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Basic email format check on frontend too
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register-merchant', {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      });
      toast.success('Account created! Please login 🎉');
      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.error || 'Signup failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const emailProviders = [
    { label: 'Gmail', example: 'yourname@gmail.com' },
    { label: 'Yahoo', example: 'yourname@yahoo.com' },
    { label: 'Outlook', example: 'yourname@outlook.com' },
    { label: 'Any email', example: 'yourname@company.com' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px', background: '#1e293b',
            borderRadius: '12px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px'
          }}>📦</div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>
            Create Your Account
          </h1>
          <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '13px' }}>
            Use any email — Gmail, Yahoo, Outlook or work email
          </p>
        </div>

        {/* Accepted email providers badges */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px', justifyContent: 'center' }}>
          {emailProviders.map(p => (
            <span key={p.label} style={{
              padding: '4px 10px', background: '#f1f5f9', borderRadius: '20px',
              fontSize: '11px', color: '#475569', fontWeight: '500'
            }}>
              ✓ {p.label}
            </span>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {/* Full Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: '600', color: '#374151', marginBottom: '6px'
            }}>
              Full Name *
            </label>
            <input
              type="text"
              name="full_name"
              placeholder="John Doe"
              value={form.full_name}
              onChange={handleChange}
              required
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: '600', color: '#374151', marginBottom: '6px'
            }}>
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              placeholder="yourname@gmail.com or any email"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
            />
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>
              Gmail, Yahoo, Outlook, or any valid email works
            </p>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: '600', color: '#374151', marginBottom: '6px'
            }}>
              Password *
            </label>
            <input
              type="password"
              name="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block', fontSize: '13px',
              fontWeight: '600', color: '#374151', marginBottom: '6px'
            }}>
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirm_password"
              placeholder="Repeat your password"
              value={form.confirm_password}
              onChange={handleChange}
              required
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? '#94a3b8' : '#1e293b',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '15px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>

        </form>

        {/* Info box */}
        <div style={{
          marginTop: '20px', padding: '14px',
          background: '#f0fdf4', border: '1px solid #86efac',
          borderRadius: '8px'
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#15803d', lineHeight: '1.6' }}>
            ✅ <strong>No restrictions</strong> — use any email provider you prefer.<br/>
            ✅ After signing up you will receive a <strong>welcome email</strong>.<br/>
            ✅ To invite team members, use the <strong>Manage Users</strong> section after login.
          </p>
        </div>

        {/* Login link */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '20px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
            Sign in here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Signup;