import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// A simple navigation header component to extract logic
const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="flex justify-between items-center glass-panel" style={{ padding: '1rem 2rem', marginBottom: '2rem' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>TaskNexus</h1>
        </Link>
        <nav className="flex gap-4 items-center">
          {user ? (
            <>
              <span style={{ color: 'var(--color-text-muted)' }}>Hello, {user.name}</span>
              <button onClick={() => setShowLogoutConfirm(true)} className="btn btn-secondary">Logout</button>
              <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </nav>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👋</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.5rem' }}>Confirm Logout</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Are you sure you want to sign out?
            </p>
            <div className="flex gap-4">
              <button
                className="btn btn-secondary"
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn"
                style={{ flex: 1, padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <div className="container" style={{ minHeight: '100vh', padding: '2rem' }}>
            <Header />

            <main className="animate-fade-in">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                  <div className="glass-panel flex flex-col items-center justify-center gap-4" style={{ padding: '4rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      Manage Tasks at the Speed of Light
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '600px' }}>
                      A production-grade, highly responsive task management system built with premium aesthetics and powerful real-time collaboration.
                    </p>
                    <div style={{ marginTop: '2rem' }}>
                      <Link to="/register" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1.1rem' }}>Get Started</Link>
                    </div>
                  </div>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}



export default App;
