import { supabase } from '../supabaseClient'
import { ITEMS } from '../lib/items'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function CheckInCard({ participant, onClose }) {
  const [data, setData] = useState(participant)
  const [updating, setUpdating] = useState(null)

  async function markItem(key) {
    if (data[key]) return
    setUpdating(key)
    const { error } = await supabase.from('participants').update({ [key]: true }).eq('id', data.id)
    if (!error) setData(prev => ({ ...prev, [key]: true }))
    setUpdating(null)
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, padding: '28px 24px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{data.name}</h2>
          <p style={{ fontSize: 13, color: '#a78bfa' }}>{data.email}</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{data.phone}</p>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: 20, lineHeight: 1, padding: 4 }}
        >×</button>
      </div>

      {/* Items grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {ITEMS.map(item => {
          const claimed = data[item.key]
          const isUpdating = updating === item.key
          return (
            <button
              key={item.key}
              onClick={() => markItem(item.key)}
              disabled={claimed || isUpdating}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '11px 14px', borderRadius: 10, border: 'none', cursor: claimed ? 'default' : 'pointer',
                fontSize: 13, fontWeight: 500, transition: 'all 0.15s', textAlign: 'left',
                background: claimed ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.04)',
                color: claimed ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                outline: claimed ? '1px solid rgba(124,58,237,0.25)' : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {isUpdating
                ? <Loader2 size={14} className="animate-spin" style={{ flexShrink: 0 }} />
                : <span style={{ fontSize: 9, width: 8, height: 8, borderRadius: '50%', background: claimed ? '#a78bfa' : 'rgba(255,255,255,0.2)', flexShrink: 0, display: 'inline-block', boxShadow: claimed ? '0 0 6px rgba(167,139,250,0.7)' : 'none' }} />
              }
              {item.emoji} {item.label}
            </button>
          )
        })}
      </div>

      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 16 }}>
        Purple = claimed · tap to mark
      </p>
    </div>
  )
}
