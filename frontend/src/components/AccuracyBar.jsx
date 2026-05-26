export default function AccuracyBar({ accuracy }) {
  const pct = Math.round(accuracy ?? 0)
  const color = pct >= 85 ? 'var(--teal)' : pct >= 70 ? 'var(--orange)' : '#ef4444'
  const label = pct >= 85 ? 'High' : pct >= 70 ? 'Medium' : 'Low'

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span style={{fontSize:'11px', color:'var(--text-light)', fontWeight:500}}>Accuracy</span>
        <div className="flex items-center gap-1.5">
          <span style={{fontSize:'12px', fontWeight:700, color}}>{pct}%</span>
          <span className="pill" style={{
            fontSize:'10px', padding:'1px 7px',
            background: pct >= 85 ? 'var(--teal-pale)' : pct >= 70 ? 'var(--orange-pale)' : '#fee2e2',
            color
          }}>{label}</span>
        </div>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{background:'var(--cream-dark)'}}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{width:`${pct}%`, background: color}} />
      </div>
    </div>
  )
}
