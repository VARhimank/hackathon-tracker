import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { ITEMS } from '../lib/items'
import { useNavigate } from 'react-router-dom'
import { ScanLine, LogOut, Search, RefreshCw } from 'lucide-react'
import Layout from '../components/Layout'
import { sendQREmail } from '../lib/email'

export default function DashboardPage() {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [resendStatus, setResendStatus] = useState({})
  const navigate = useNavigate()

  async function fetchParticipants() {
    setLoading(true)
    const { data } = await supabase.from('participants').select('*').order('registered_at', { ascending: false })
    setParticipants(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchParticipants() }, [])

  async function handleResendQR(participant) {
    setResendStatus(prev => ({ ...prev, [participant.id]: { state: 'sending', message: 'Sending…' } }))
    try {
      await sendQREmail({ name: participant.name, email: participant.email, participantId: participant.id })
      setResendStatus(prev => ({ ...prev, [participant.id]: { state: 'sent', message: 'Sent' } }))
    } catch {
      setResendStatus(prev => ({ ...prev, [participant.id]: { state: 'error', message: 'Failed' } }))
    }
  }

  const filtered = participants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  )

  const stats = ITEMS.map(item => ({ ...item, count: participants.filter(p => p[item.key]).length }))

  const statCard = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 14, padding: '20px 16px', textAlign: 'center',
  }

  const navBtnStyle = {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 12, color: 'rgba(255,255,255,0.4)',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, padding: '7px 12px', cursor: 'pointer',
  }

  const navRight = (
    <>
      <button style={navBtnStyle} onClick={() => navigate('/admin/scanner')}>
        <ScanLine size={13} /> Scanner
      </button>
      <button style={{ ...navBtnStyle, color: 'rgba(248,113,113,0.7)' }} onClick={() => { sessionStorage.removeItem('admin_auth'); navigate('/admin') }}>
        <LogOut size={13} /> Logout
      </button>
    </>
  )

  return (
    <Layout navRight={navRight}>
      <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
            {participants.length} participants registered
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div style={statCard}>
            <div style={{
              fontSize: 28, fontWeight: 800, marginBottom: 4,
              background: 'linear-gradient(135deg,#a78bfa,#ec4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>{participants.length}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
          </div>
          {stats.map(s => (
            <div key={s.key} style={statCard}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#a78bfa', marginBottom: 4 }}>{s.count}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{s.emoji} {s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + refresh */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '10px 14px 10px 36px',
                fontSize: 13, color: '#e2e8f0', outline: 'none',
              }}
            />
          </div>
          <button
            onClick={fetchParticipants}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '10px 16px',
              fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            Refresh
          </button>
        </div>

        {/* Table */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ textAlign: 'left', color: 'rgba(255,255,255,0.25)', fontWeight: 500, padding: '12px 16px', whiteSpace: 'nowrap', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
                  <th style={{ textAlign: 'left', color: 'rgba(255,255,255,0.25)', fontWeight: 500, padding: '12px 16px', whiteSpace: 'nowrap', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                  <th style={{ textAlign: 'left', color: 'rgba(255,255,255,0.25)', fontWeight: 500, padding: '12px 16px', whiteSpace: 'nowrap', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                  <th style={{ textAlign: 'left', color: 'rgba(255,255,255,0.25)', fontWeight: 500, padding: '12px 16px', whiteSpace: 'nowrap', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</th>
                  <th style={{ textAlign: 'left', color: 'rgba(255,255,255,0.25)', fontWeight: 500, padding: '12px 16px', whiteSpace: 'nowrap', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>QR Email</th>
                  {ITEMS.map(item => (
                    <th key={item.key} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontWeight: 500, padding: '12px 10px', whiteSpace: 'nowrap', fontSize: 11 }}>
                      {item.emoji}<br />{item.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5 + ITEMS.length} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', padding: 48, fontSize: 13 }}>Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5 + ITEMS.length} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', padding: 48, fontSize: 13 }}>No participants found.</td></tr>
                ) : filtered.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>{i + 1}</td>
                    <td style={{ padding: '13px 16px', color: '#fff', fontWeight: 500, whiteSpace: 'nowrap' }}>{p.name}</td>
                    <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{p.email}</td>
                    <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>{p.phone}</td>
                    <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => handleResendQR(p)}
                        disabled={resendStatus[p.id]?.state === 'sending'}
                        style={{
                          border: '1px solid rgba(167,139,250,0.35)',
                          background: 'rgba(167,139,250,0.12)',
                          color: '#c4b5fd',
                          borderRadius: 8,
                          padding: '6px 10px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: resendStatus[p.id]?.state === 'sending' ? 'not-allowed' : 'pointer',
                          opacity: resendStatus[p.id]?.state === 'sending' ? 0.6 : 1,
                        }}
                      >
                        {resendStatus[p.id]?.state === 'sending' ? 'Sending…' : 'Resend QR'}
                      </button>
                      {resendStatus[p.id]?.message && (
                        <div
                          style={{
                            fontSize: 11,
                            marginTop: 4,
                            color: resendStatus[p.id].state === 'error' ? '#f87171' : '#a78bfa',
                          }}
                        >
                          {resendStatus[p.id].message}
                        </div>
                      )}
                    </td>
                    {ITEMS.map(item => (
                      <td key={item.key} style={{ padding: '13px 10px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                          background: p[item.key] ? '#a78bfa' : 'rgba(255,255,255,0.1)',
                          boxShadow: p[item.key] ? '0 0 6px rgba(167,139,250,0.6)' : 'none',
                        }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
