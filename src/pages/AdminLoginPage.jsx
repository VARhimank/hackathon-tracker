import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true')
      navigate('/admin/scanner')
    } else {
      setError(true)
      setPassword('')
    }
  }

  return (
    <Layout>
      <div style={{
        minHeight: 'calc(100vh - 61px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
        <div style={{
          width: '100%', maxWidth: 360,
          background: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '44px 36px',
        }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 20, fontSize: 16,
            }}>🔒</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Admin Access</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Enter the password to continue</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              type="password"
              required
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false) }}
              placeholder="Password"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: error ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '13px 16px',
                fontSize: 14, color: '#e2e8f0', outline: 'none',
              }}
              onFocus={e => !error && (e.target.style.borderColor = 'rgba(167,139,250,0.5)')}
              onBlur={e => !error && (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            {error && (
              <p style={{ fontSize: 13, color: '#f87171' }}>Incorrect password. Try again.</p>
            )}
            <button
              type="submit"
              style={{
                padding: '13px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, color: 'white',
                background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                boxShadow: '0 4px 24px rgba(124,58,237,0.3)',
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
