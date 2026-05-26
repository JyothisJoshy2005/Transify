import { useState, useEffect, useCallback } from 'react'
import { History as HistoryIcon, Trash2, Trash, RefreshCw, Search, ScanText, MessageSquare, Globe, Info } from 'lucide-react'
import { getHistory, deleteHistoryItem, clearAllHistory } from '../utils/api'
import { getLangName, getAccuracyClass, formatTimestamp, truncate } from '../utils/helpers'
import AccuracyBar from '../components/AccuracyBar'
import LoadingSpinner from '../components/LoadingSpinner'

const TYPE_ICONS = {
  text: Globe,
  ocr:  ScanText,
  chat: MessageSquare,
}
const TYPE_COLORS = {
  text: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
  ocr:  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  chat: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
}

function HistoryCard({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const Icon = TYPE_ICONS[item.type] || Globe

  const handleDelete = async (e) => {
    e.stopPropagation()
    setDeleting(true)
    await onDelete(item._id)
  }

  return (
    <div
      className="card p-4 cursor-pointer group animate-fade-in"
      onClick={() => setExpanded(v => !v)}
    >
      <div className="flex items-start gap-3">
        {/* Type badge */}
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[item.type] || TYPE_COLORS.text}`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${TYPE_COLORS[item.type] || TYPE_COLORS.text}`}>
              {item.type || 'text'}
            </span>
            <span className="text-xs text-slate-400">
              {getLangName(item.source_lang)} → {getLangName(item.target_lang)}
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-600 ml-auto">{formatTimestamp(item.timestamp)}</span>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-snug">
            {truncate(item.input_text, expanded ? 9999 : 80)}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
            {truncate(item.translated_text, expanded ? 9999 : 80)}
          </p>

          {expanded && item.accuracy != null && (
            <div className="mt-3">
              <AccuracyBar accuracy={item.accuracy} />
            </div>
          )}
        </div>

        {/* Accuracy chip */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {item.accuracy != null && (
            <span className={`text-xs font-bold ${getAccuracyClass(item.accuracy)}`}>
              {Math.round(item.accuracy)}%
            </span>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 btn-ghost p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-opacity"
          >
            {deleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id)
      setItems(prev => prev.filter(i => i._id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleClearAll = async () => {
    if (!window.confirm('Delete all translation history? This cannot be undone.')) return
    setClearing(true)
    try {
      await clearAllHistory()
      setItems([])
      setStats(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setClearing(false)
    }
  }

  // Filter + search
  const filtered = items.filter(item => {
    const matchType   = filter === 'all' || item.type === filter
    const searchLower = search.toLowerCase()
    const matchSearch = !search ||
      item.input_text?.toLowerCase().includes(searchLower) ||
      item.translated_text?.toLowerCase().includes(searchLower)
    return matchType && matchSearch
  })

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <HistoryIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Translation History</h1>
            <p className="page-sub">{stats?.total ?? items.length} records saved{stats?.storage ? ` · ${stats.storage}` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchHistory} className="btn-ghost py-2 px-3" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearing}
              className="btn-danger py-2 px-3 text-xs"
            >
              {clearing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash className="w-3.5 h-3.5" />}
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Text', key: 'text', color: 'text-primary-500' },
            { label: 'OCR',  key: 'ocr',  color: 'text-emerald-500' },
            { label: 'Chat', key: 'chat', color: 'text-orange-500' },
          ].map(({ label, key, color }) => (
            <div key={key} className="card p-3 text-center">
              <p className={`text-xl font-bold ${color}`}>{stats.by_type?.[key] || 0}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search history…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 items-center">
          {['all', 'text', 'ocr', 'chat'].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                filter === t
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Loading history…" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-center gap-3 text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <HistoryIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="font-semibold text-slate-600 dark:text-slate-300">
            {search || filter !== 'all' ? 'No matching records' : 'No translations yet'}
          </p>
          <p className="text-sm">
            {search || filter !== 'all' ? 'Try a different search or filter.' : 'Start translating — your history will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <HistoryCard key={item._id} item={item} onDelete={handleDelete} />
          ))}
          <p className="text-center text-xs text-slate-400 pt-2">
            Showing {filtered.length} of {items.length} records · Click a card to expand
          </p>
        </div>
      )}
    </div>
  )
}
