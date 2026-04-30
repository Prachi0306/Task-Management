import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="container" style={{ minHeight: '100vh', padding: '2rem' }}>
        <header className="flex justify-between items-center glass-panel" style={{ padding: '1rem 2rem', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>TaskNexus</h1>
          <nav className="flex gap-4">
            <button className="btn btn-secondary">Login</button>
            <button className="btn btn-primary">Sign Up</button>
          </nav>
        </header>

        <main className="animate-fade-in">
          <Routes>
            <Route path="/" element={
              <div className="glass-panel flex flex-col items-center justify-center gap-4" style={{ padding: '4rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Manage Tasks at the Speed of Light
                </h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '600px' }}>
                  A production-grade, highly responsive task management system built with premium aesthetics and powerful real-time collaboration.
                </p>
                <div style={{ marginTop: '2rem' }}>
                  <button className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1.1rem' }}>Get Started</button>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
