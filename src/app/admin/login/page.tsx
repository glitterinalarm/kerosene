'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Mot de passe incorrect');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans, sans-serif)',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '2rem' }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-condensed, sans-serif)',
            fontSize: '3rem',
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-0.02em',
            margin: '0 0 0.5rem',
          }}>KÉROSÈNE</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            ACCÈS ÉDITORIAL
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>
              MOT DE PASSE
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                background: '#0a0a0a',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '1rem',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p style={{ color: '#ff4d00', fontSize: '0.75rem', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#fff',
              color: '#000',
              border: 'none',
              padding: '1rem',
              fontWeight: 800,
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: loading ? 'wait' : 'pointer',
              marginTop: '0.5rem',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'CONNEXION...' : 'ACCÉDER À L\'ÉDITEUR'}
          </button>
        </form>
      </div>
    </div>
  );
}
