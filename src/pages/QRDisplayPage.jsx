import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import QRCodeImport from 'react-qr-code'
import { supabase } from '../supabaseClient'
import { Loader2 } from 'lucide-react'
import Layout from '../components/Layout'

const QRCode = QRCodeImport?.default?.default ?? QRCodeImport?.default ?? QRCodeImport

export default function QRDisplayPage() {
  const { id } = useParams()
  const [participant, setParticipant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('participants')
        .select('id, name, email, entry_code')
        .eq('id', id)
        .single()
      if (error || !data) setNotFound(true)
      else setParticipant(data)
      setLoading(false)
    }
    load()
  }, [id])

  const card = {
    width: '100%', maxWidth: 380,
    background: 'rgba(255,255,255,0.035)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20, padding: '44px 36px',
    textAlign: 'center',
  }

  const center = {
    minHeight: 'calc(100vh - 61px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  }

  if (loading) return (
    <Layout>
      <div style={center}>
        <Loader2 className="animate-spin" style={{ color: '#a78bfa' }} size={36} />
      </div>
    </Layout>
  )

  if (notFound) return (
    <Layout>
      <div style={center}>
        <div style={card}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>QR Not Found</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>This link may be invalid or expired.</p>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={center}>
        <div style={card}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            Your QR Pass
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
            Hi, {participant.name}!
          </h1>
          <p style={{ fontSize: 13, color: '#a78bfa', marginBottom: 32 }}>{participant.email}</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 18 }}>
            Manual fallback code: <span style={{ color: '#ddd6fe', letterSpacing: '0.08em', fontWeight: 700 }}>{participant.entry_code}</span>
          </p>

          <div style={{
            display: 'inline-block', padding: 20, borderRadius: 16,
            background: 'white',
            boxShadow: '0 0 48px rgba(139,92,246,0.2)',
            marginBottom: 28,
          }}>
            <QRCode value={participant.id} size={180} />
          </div>

          <p style={{
            fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10, padding: '12px 16px',
          }}>
            📸 Screenshot this — show it at every food, drinks and swag counter.<br />One scan per item.
          </p>
        </div>
      </div>
    </Layout>
  )
}
