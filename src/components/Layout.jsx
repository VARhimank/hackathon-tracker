export default function Layout({ children, navRight }) {
  return (
    <div className="relative min-h-screen bg-cosmos" style={{ backgroundColor: '#080812' }}>
      {/* Glow orbs */}
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 80% 50% at 20% 0%, rgba(124,58,237,0.12) 0%, transparent 60%),' +
            'radial-gradient(ellipse 60% 40% at 80% 100%, rgba(139,92,246,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Nav */}
      <nav
        style={{
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'white',
            boxShadow: '0 0 16px rgba(124,58,237,0.4)',
          }}>H</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.01em' }}>
            Hackathon
          </span>
        </div>
        {navRight && (
          <div style={{ display: 'flex', gap: 8 }}>{navRight}</div>
        )}
      </nav>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10 }}>{children}</div>
    </div>
  )
}
