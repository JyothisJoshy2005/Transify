import { useState, useEffect, useCallback } from 'react'
import { History as HistoryIcon, Trash2, Trash, RefreshCw, Search, ScanText, MessageSquare, Globe, Info, ChevronDown } from 'lucide-react'
import { getHistory, deleteHistoryItem, clearAllHistory } from '../utils/api'
import { getLangName, getAccuracyClass, formatTimestamp, truncate } from '../utils/helpers'
import AccuracyBar from '../components/AccuracyBar'
import LoadingSpinner from '../components/LoadingSpinner'

const TYPE_META = {
  text: { icon: Globe,          color: 'var(--teal)',   bg: 'var(--teal-pale)',   label: 'Text'  },
  ocr:  { icon: ScanText,       color: 'var(--orange)', bg: 'var(--orange-pale)', label: 'OCR'   },
  chat: { icon: MessageSquare,  color: 'var(--navy)',   bg: 'rgba(28,43,57,0.1)', label: 'Chat'  },
}

function HistoryCard({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const meta = TYPE_META[item.type] || TYPE_META.text
  const Icon = meta.icon

  const handleDelete = async e => {
    e.stopPropagation()
    setDeleting(true)
    await onDelete(item._id)
  }

  return (
    <div className="card p-4 cursor-pointer group animate-fade-in hover:shadow-md transition-all"
      onClick={() => setExpanded(v => !v)}>
      <div className="flex items-start gap-3">
        {/* Type icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{background: meta.bg}}>
          <Icon className="w-4 h-4" style={{color: meta.color}} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="pill" style={{background: meta.bg, color: meta.color, fontSize:'10px', padding:'2px 8px'}}>
              {meta.label}
            </span>
            <span style={{fontSize:'12px', color:'var(--text-light)'}}>
              {getLangName(item.source_lang)} → {getLangName(item.target_lang)}
            </span>
            <span style={{fontSize:'11px', color:'var(--text-light)', marginLeft:'auto'}}>
              {formatTimestamp(item.timestamp)}
            </span>
          </div>

          <p style={{fontSize:'13px', fontWeight:600, color:'var(--text-dark)', lineHeight:'1.4'}}>
            {truncate(item.input_text, expanded ? 9999 : 80)}
          </p>
          <p style={{fontSize:'13px', color:'var(--teal)', lineHeight:'1.4', marginTop:'2px'}}>
            {truncate(item.translated_text, expanded ? 9999 : 80)}
          </p>

          {expanded && item.accuracy != null && (
            <div className="mt-3">
              <AccuracyBar accuracy={item.accuracy} />
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.accuracy != null && (
            <span style={{fontSize:'12px', fontWeight:700, color: item.accuracy >= 85 ? 'var(--teal)' : 'var(--orange)'}}>
              {Math.round(item.accuracy)}%
            </span>
          )}
          <ChevronDown className="w-4 h-4 transition-transform" style={{
            color:'var(--text-light)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0)'
          }} />
          <button onClick={handleDelete} disabled={deleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg"
            style={{color:'#ef4444', background:'transparent'}}
            onMouseEnter={e => e.currentTarget.style.background='#fee2e2'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            {deleting
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function History() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')
  const [stats, setStats]       = useState(null)
  const [clearing, setClearing] = useState(false)

  const fetchHistory = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await getHistory(100)
      setItems(data.history || [])
      setStats(data.stats)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const handleDelete = async id => {
    try {
      await deleteHistoryItem(id)
      setItems(prev => prev.filter(i => i._id !== id))
    } catch (err) { setError(err.message) }
  }

  const handleClearAll = async () => {
    if (!window.confirm('Delete all translation history? This cannot be undone.')) return
    setClearing(true)
    try {
      await clearAllHistory()
      setItems([]); setStats(null)
    } catch (err) { setError(err.message) }
    finally { setClearing(false) }
  }

  const filtered = items.filter(item => {
    const matchType   = filter === 'all' || item.type === filter
    const q           = search.toLowerCase()
    const matchSearch = !search ||
      item.input_text?.toLowerCase().includes(q) ||
      item.translated_text?.toLowerCase().includes(q)
    return matchType && matchSearch
  })

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'var(--navy)'}}>
            <HistoryIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Translation History</h1>
            <p className="page-sub">{stats?.total ?? items.length} records saved</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchHistory} className="btn-ghost py-2 px-3">
            <RefreshCw className="w-4 h-4" />
          </button>
          {items.length > 0 && (
            <button onClick={handleClearAll} disabled={clearing} className="btn-danger py-2 px-3 text-xs">
              {clearing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash className="w-3.5 h-3.5" />}
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Text', key: 'text', color: 'var(--teal)',   bg: 'var(--teal-pale)'   },
            { label: 'OCR',  key: 'ocr',  color: 'var(--orange)', bg: 'var(--orange-pale)' },
            { label: 'Chat', key: 'chat', color: 'var(--navy)',   bg: 'rgba(28,43,57,0.07)'},
          ].map(({ label, key, color, bg }) => (
            <div key={key} className="card p-3 text-center" style={{background: bg, border:'none'}}>
              <p style={{fontSize:'22px', fontWeight:800, color}}>{stats.by_type?.[key] || 0}</p>
              <p style={{fontSize:'11px', color:'var(--text-light)', marginTop:'2px', fontWeight:500}}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{color:'var(--text-light)'}} />
          <input className="input pl-9" placeholder="Search history…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 items-center">
          {['all', 'text', 'ocr', 'chat'].map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className="px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
              style={{
                background: filter === t ? 'var(--teal)' : 'var(--white)',
                color:      filter === t ? '#fff' : 'var(--text-mid)',
                border:     filter === t ? 'none' : '1px solid var(--border)',
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
          style={{background:'#fee2e2', color:'#b91c1c'}}>
          <Info className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Loading history…" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background:'var(--cream-dark)'}}>
            <HistoryIcon className="w-8 h-8" style={{color:'var(--text-light)'}} />
          </div>
          <p style={{fontWeight:700, color:'var(--text-dark)'}}>
            {search || filter !== 'all' ? 'No matching records' : 'No translations yet'}
          </p>
          <p style={{fontSize:'13px', color:'var(--text-light)'}}>
            {search || filter !== 'all' ? 'Try a different search or filter.' : 'Start translating — history appears here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <HistoryCard key={item._id} item={item} onDelete={handleDelete} />
          ))}
          <p className="text-center pt-2" style={{fontSize:'11px', color:'var(--text-light)'}}>
            Showing {filtered.length} of {items.length} records · Click a card to expand
          </p>
        </div>
      )}
    </div>
  )
}
