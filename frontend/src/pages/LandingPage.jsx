import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: '🏪', title: 'Multi-Store Management', desc: 'Manage all your branches from one central dashboard with real-time data.' },
    { icon: '📦', title: 'Product Tracking', desc: 'Track every product across stores — received, in stock, and spoilt.' },
    { icon: '📋', title: 'Inventory Entries', desc: 'Clerks record daily stock with buying price, selling price and payment status.' },
    { icon: '🚚', title: 'Supply Requests', desc: 'Clerks request supplies, admins approve or decline with one click.' },
    { icon: '📊', title: 'Live Reports & Charts', desc: 'Visual bar and line charts give instant insight into your stock health.' },
    { icon: '🔐', title: 'Role-Based Access', desc: 'Merchant, Admin, and Clerk roles each see only what they need.' },
  ];

  const roles = [
    { role: 'Merchant', color: '#1e293b', badge: '#334155', icon: '👑', perms: ['View all stores & reports', 'Invite and manage admins', 'Full system overview'] },
    { role: 'Admin', color: '#1d4ed8', badge: '#2563eb', icon: '👔', perms: ['Manage clerks & products', 'Approve supply requests', 'View store dashboard'] },
    { role: 'Clerk', color: '#065f46', badge: '#059669', icon: '📝', perms: ['Record inventory entries', 'Submit supply requests', 'View own activity'] },
  ];

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: '#f8f7f4', minHeight: '100vh', color: '#1a1a1a' }}>

      {/* NAV */}
      <nav style={{ background: '#1e293b', padding: '0 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>📦</span>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '18px', letterSpacing: '0.5px' }}>StockManager Pro</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
         <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
           <span style={{ fontSize: '22px' }}>📦</span>
           <span style={{ color: '#fff', fontWeight: '700', fontSize: '18px' }}>StockManager Pro</span>
        </button>
          <button onClick={() => navigate('/login')}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/signup')}
            style={{ background: '#2563eb', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '100px 5% 90px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)', borderRadius: '20px', padding: '6px 18px', marginBottom: '28px' }}>
          <span style={{ color: '#93c5fd', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>Professional Inventory Management</span>
        </div>
        <h1 style={{ color: '#fff', fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: '700', margin: '0 0 20px', lineHeight: '1.2', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
          Control Your Stock.<br />
          <span style={{ color: '#60a5fa' }}>Grow Your Business.</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '560px', margin: '0 auto 40px', lineHeight: '1.7', fontFamily: 'sans-serif', fontWeight: '400' }}>
          A complete inventory platform for merchants, admins and clerks. Track products, manage stores, and make data-driven decisions.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/signup')}
            style={{ background: '#2563eb', border: 'none', color: '#fff', padding: '14px 32px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', fontFamily: 'sans-serif' }}>
            Start Free Today
          </button>
          <button onClick={() => navigate('/login')}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', color: '#e2e8f0', padding: '14px 32px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontFamily: 'sans-serif' }}>
            Sign In →
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '48px', justifyContent: 'center', marginTop: '64px', flexWrap: 'wrap' }}>
          {[['3', 'User Roles'], ['Real-time', 'Reports'], ['Multi-store', 'Support'], ['60%+', 'Test Coverage']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ color: '#60a5fa', fontSize: '28px', fontWeight: '700' }}>{val}</div>
              <div style={{ color: '#64748b', fontSize: '13px', fontFamily: 'sans-serif', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '90px 5%', background: '#f8f7f4' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px' }}>Everything you need to manage stock</h2>
          <p style={{ color: '#64748b', fontSize: '16px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>Built for retail businesses that need clarity, control, and accountability across every store.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
          {features.map(f => (
            <div key={f.title} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '28px', transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ fontSize: '28px', marginBottom: '14px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: '14px', fontFamily: 'sans-serif', lineHeight: '1.6', margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section style={{ padding: '80px 5%', background: '#1e293b' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '34px', fontWeight: '700', color: '#fff', margin: '0 0 12px' }}>Three roles. One system.</h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', fontFamily: 'sans-serif' }}>Each user sees exactly what they need — nothing more, nothing less.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
          {roles.map(r => (
            <div key={r.role} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '24px' }}>{r.icon}</span>
                <span style={{ background: r.badge, color: '#fff', fontSize: '13px', fontWeight: '600', padding: '4px 14px', borderRadius: '20px', fontFamily: 'sans-serif' }}>{r.role}</span>
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {r.perms.map(p => (
                  <li key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '14px', fontFamily: 'sans-serif', marginBottom: '10px' }}>
                    <span style={{ color: '#34d399', fontSize: '12px' }}>✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '90px 5%', textAlign: 'center', background: '#f8f7f4' }}>
        <h2 style={{ fontSize: '38px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px' }}>Ready to take control of your inventory?</h2>
        <p style={{ color: '#64748b', fontSize: '16px', fontFamily: 'sans-serif', marginBottom: '36px' }}>Create your merchant account and invite your team in minutes.</p>
        <button onClick={() => navigate('/signup')}
          style={{ background: '#1e293b', border: 'none', color: '#fff', padding: '16px 40px', borderRadius: '8px', cursor: 'pointer', fontSize: '17px', fontWeight: '600', fontFamily: 'sans-serif' }}>
          Create Free Account →
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', padding: '32px 5%', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '18px' }}>📦</span>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>StockManager Pro</span>
        </div>
        <p style={{ color: '#475569', fontSize: '13px', fontFamily: 'sans-serif', margin: 0 }}>© 2025 StockManager Pro. Built with Flask + React.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
