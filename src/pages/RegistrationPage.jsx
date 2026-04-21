import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { sendQREmail } from '../lib/email'
import { Loader2 } from 'lucide-react'
import Layout from '../components/Layout'

const ENTRY_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function generateEntryCode(length = 4) {
  let code = ''
  for (let i = 0; i < length; i += 1) {
    code += ENTRY_CODE_CHARS[Math.floor(Math.random() * ENTRY_CODE_CHARS.length)]
  }
  return code
}

const S = {
  page: {
    minHeight: 'calc(100vh - 61px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: 'rgba(255,255,255,0.035)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '44px 40px',
  },
  label: {
    display: 'block',
    fontSize: 11,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '13px 16px',
    fontSize: 14,
    color: '#e2e8f0',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  btn: {
    width: '100%',
    padding: '14px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    color: 'white',
    background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
    boxShadow: '0 4px 24px rgba(124,58,237,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'opacity 0.15s',
  },
}

export default function RegistrationPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [entryCode, setEntryCode] = useState('')

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    let data = null
    let error = null

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const candidateCode = generateEntryCode()
      const response = await supabase
        .from('participants')
        .insert([{ name: form.name, email: form.email, phone: form.phone, entry_code: candidateCode }])
        .select('id, entry_code')
        .single()

      if (!response.error) {
        data = response.data
        break
      }

      const isEntryCodeCollision =
        response.error.code === '23505' && (response.error.message || '').includes('entry_code')

      if (isEntryCodeCollision) continue

      error = response.error
      break
    }

    if (!data) {
      setStatus('error')
      setErrorMsg(
        error?.code === '23505' && (error.message || '').includes('email')
          ? 'This email is already registered.'
          : 'Something went wrong. Please try again.',
      )
      return
    }

    setEntryCode(data.entry_code)

    try {
      await sendQREmail({
        name: form.name,
        email: form.email,
        participantId: data.id,
        entryCode: data.entry_code,
      })
    } catch {
      console.warn('Email send failed')
    }

    setStatus('success')
  }

  if (status === 'success') {
    return (
      <Layout>
        <div style={S.page}>
          <div style={{ ...S.card, textAlign: 'center', padding: '56px 40px' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', fontSize: 24,
            }}>✓</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
              You are registered!
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              We emailed your QR pass to{' '}
              <span style={{ color: '#a78bfa' }}>{form.email}</span>.<br />
              Screenshot it and show it at every station.
            </p>
            <div style={{
              marginTop: 16,
              background: 'rgba(167,139,250,0.12)',
              border: '1px solid rgba(167,139,250,0.3)',
              borderRadius: 10,
              padding: '10px 14px',
              color: '#ddd6fe',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}>
              Manual fallback code: {entryCode}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={S.page}>
        <div style={S.card}>
          <div style={{ marginBottom: 36 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 6, letterSpacing: '0.05em' }}>
              Join the
            </p>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 4 }}>
              Hackathon
            </h1>
            <h1 style={{
              fontSize: 32, fontWeight: 800, lineHeight: 1.15, marginBottom: 20,
              background: 'linear-gradient(90deg, #a78bfa, #ec4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>2026</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
              Fill in your details and we will send your personal QR pass — present it at every food, drinks and swag counter.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { label: 'Full Name', name: 'name', type: 'text', placeholder: 'John Doe' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'john@example.com' },
              { label: 'Phone', name: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label style={S.label}>{label}</label>
                <input
                  type={type}
                  name={name}
                  required
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  style={S.input}
                  onFocus={e => (e.target.style.borderColor = 'rgba(167,139,250,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
            ))}

            {errorMsg && (
              <p style={{
                fontSize: 13, color: '#f87171',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8, padding: '10px 14px',
              }}>{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{ ...S.btn, opacity: status === 'loading' ? 0.6 : 1, marginTop: 4 }}
            >
              {status === 'loading' ? (
                <><Loader2 size={15} className="animate-spin" /> Registering</>
              ) : 'Get My QR Pass'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}
