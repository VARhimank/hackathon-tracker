import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../supabaseClient'
import { ITEMS } from '../lib/items'
import { useNavigate } from 'react-router-dom'
import { Camera, LayoutDashboard, LogOut, ScanLine } from 'lucide-react'
import Layout from '../components/Layout'

const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i

export default function ScannerPage() {
  const scannerRef = useRef(null)
  const scanLockRef = useRef(false)
  const lastProcessedRef = useRef({ value: '', time: 0 })
  const [scanning, setScanning] = useState(false)
  const [selectedItem, setSelectedItem] = useState(ITEMS[0].key)
  const [manualCode, setManualCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    return () => { if (scannerRef.current) scannerRef.current.stop().catch(() => {}) }
  }, [])

  const selectedItemMeta = ITEMS.find(item => item.key === selectedItem) || ITEMS[0]

  async function startScanner() {
    setError('')
    setResult(null)
    const scanner = scannerRef.current || new Html5Qrcode('qr-reader')
    scannerRef.current = scanner
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 14, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        async (decodedText) => { await handleScannedValue(decodedText) },
        () => {},
      )
      setScanning(true)
    } catch {
      setError('Could not access camera. Please allow camera permission and try again.')
    }
  }

  async function stopScanner() {
    if (scannerRef.current) { await scannerRef.current.stop().catch(() => {}); scannerRef.current = null }
    setScanning(false)
  }

  async function applyCheckIn(participant) {
    if (participant[selectedItem]) {
      setResult({
        type: 'info',
        text: `${participant.name} is already checked in for ${selectedItemMeta.label}.`,
      })
      return
    }

    setBusy(true)
    const { error: updateError } = await supabase
      .from('participants')
      .update({ [selectedItem]: true })
      .eq('id', participant.id)

    setBusy(false)

    if (updateError) {
      setResult({
        type: 'error',
        text: `Could not update ${selectedItemMeta.label}. Please try again.`,
      })
      return
    }

    setResult({
      type: 'success',
      text: `${participant.name} checked in for ${selectedItemMeta.label}.`,
    })
  }

  function extractUuid(input) {
    const text = input.trim()
    const match = text.match(UUID_REGEX)
    return match ? match[0] : text
  }

  async function lookupAndCheckInById(rawValue) {
    const uuid = extractUuid(rawValue)
    const { data, error: dbError } = await supabase.from('participants').select('*').eq('id', uuid).single()
    if (dbError || !data) {
      setResult({ type: 'error', text: 'Participant not found for scanned QR.' })
      return
    }
    await applyCheckIn(data)
  }

  async function lookupAndCheckInByEntryCode(rawCode) {
    const code = rawCode.trim().toUpperCase()
    if (!/^[A-Z0-9]{4}$/.test(code)) {
      setResult({ type: 'error', text: 'Enter a valid 4-character code (A-Z, 0-9).' })
      return
    }
    setManualCode(code)
    const { data, error: dbError } = await supabase.from('participants').select('*').eq('entry_code', code).single()
    if (dbError || !data) {
      setResult({ type: 'error', text: 'No participant found for that manual code.' })
      return
    }
    await applyCheckIn(data)
  }

  async function handleScannedValue(decodedText) {
    if (scanLockRef.current || busy) return

    const now = Date.now()
    const normalized = decodedText.trim()
    if (normalized === lastProcessedRef.current.value && now - lastProcessedRef.current.time < 1800) return

    scanLockRef.current = true
    lastProcessedRef.current = { value: normalized, time: now }
    await lookupAndCheckInById(normalized)
    window.setTimeout(() => { scanLockRef.current = false }, 700)
  }

  const navBtnStyle = {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 12, color: 'rgba(255,255,255,0.4)',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, padding: '7px 12px',
    cursor: 'pointer',
  }

  const navRight = (
    <>
      <button style={navBtnStyle} onClick={() => navigate('/admin/dashboard')}>
        <LayoutDashboard size={13} /> Dashboard
      </button>
      <button style={{ ...navBtnStyle, color: 'rgba(248,113,113,0.7)' }} onClick={() => { sessionStorage.removeItem('admin_auth'); navigate('/admin') }}>
        <LogOut size={13} /> Logout
      </button>
    </>
  )

  return (
    <Layout navRight={navRight}>
      <div style={{
        minHeight: 'calc(100vh - 61px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 20px',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <ScanLine size={16} style={{ color: '#a78bfa' }} />
            <h1 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Check-in Scanner</h1>
          </div>

          <div
            style={{
              position: 'relative',
              display: scanning ? 'block' : 'none',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <div id="qr-reader" style={{ width: '100%', minHeight: 320, borderRadius: 16, overflow: 'hidden', position: 'relative', zIndex: 1 }} />
            {scanning && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: 220,
                    height: 220,
                    borderRadius: 16,
                    border: '1px solid rgba(167,139,250,0.22)',
                  }}
                >
                  {[
                    { top: -1, left: -1, borderTop: '3px solid #a78bfa', borderLeft: '3px solid #a78bfa' },
                    { top: -1, right: -1, borderTop: '3px solid #a78bfa', borderRight: '3px solid #a78bfa' },
                    { bottom: -1, left: -1, borderBottom: '3px solid #a78bfa', borderLeft: '3px solid #a78bfa' },
                    { bottom: -1, right: -1, borderBottom: '3px solid #a78bfa', borderRight: '3px solid #a78bfa' },
                  ].map((corner, index) => (
                    <span
                      key={index}
                      style={{
                        position: 'absolute',
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        ...corner,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {!scanning && (
            <div style={{
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '56px 36px', textAlign: 'center',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Camera size={26} style={{ color: '#a78bfa' }} />
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28, lineHeight: 1.6 }}>
                Open the camera and scan a participant QR code to check them in.
              </p>
              <button
                onClick={startScanner}
                style={{
                  padding: '12px 32px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600, color: 'white',
                  background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                  boxShadow: '0 4px 24px rgba(124,58,237,0.3)',
                }}
              >
                Start Scanner
              </button>
            </div>
          )}

          {scanning && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
                Place the QR code inside the frame.
              </p>
              <button onClick={stopScanner} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Cancel
              </button>
            </div>
          )}

          <div style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: '16px 14px',
            marginTop: 16,
          }}>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Active Station / Item
            </label>
            <select
              value={selectedItem}
              onChange={(event) => setSelectedItem(event.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '10px 12px',
                color: '#e2e8f0',
                fontSize: 13,
                outline: 'none',
                marginBottom: 14,
              }}
            >
              {ITEMS.map(item => (
                <option key={item.key} value={item.key}>
                  {item.emoji} {item.label}
                </option>
              ))}
            </select>

            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Manual Fallback Code
            </label>
            <form
              onSubmit={async (event) => {
                event.preventDefault()
                if (busy) return
                await lookupAndCheckInByEntryCode(manualCode)
              }}
              style={{ display: 'flex', gap: 8 }}
            >
              <input
                value={manualCode}
                onChange={(event) => setManualCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))}
                placeholder="AB12"
                maxLength={4}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  color: '#e2e8f0',
                  fontSize: 13,
                  outline: 'none',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              />
              <button
                type="submit"
                disabled={busy}
                style={{
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 14px',
                  cursor: busy ? 'not-allowed' : 'pointer',
                  color: 'white',
                  background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                  fontSize: 12,
                  fontWeight: 600,
                  opacity: busy ? 0.7 : 1,
                }}
              >
                Check In
              </button>
            </form>
          </div>

          {(error || result) && (
            <div style={{
              background: error || result?.type === 'error'
                ? 'rgba(239,68,68,0.07)'
                : result?.type === 'success'
                  ? 'rgba(16,185,129,0.08)'
                  : 'rgba(167,139,250,0.1)',
              border: error || result?.type === 'error'
                ? '1px solid rgba(239,68,68,0.2)'
                : result?.type === 'success'
                  ? '1px solid rgba(16,185,129,0.28)'
                  : '1px solid rgba(167,139,250,0.3)',
              borderRadius: 12, padding: '16px 20px', textAlign: 'center', color: '#f87171', fontSize: 13,
              marginTop: 16,
            }}>
              <span style={{
                color: error || result?.type === 'error'
                  ? '#f87171'
                  : result?.type === 'success'
                    ? '#6ee7b7'
                    : '#c4b5fd',
              }}>
                {error || result?.text}
              </span>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
