import { useState, useCallback } from 'react'
import { Globe, ArrowLeftRight, Copy, Trash2, Zap, Info } from 'lucide-react'
import { translateText, detectLanguage } from '../utils/api'
import { LANGUAGES, LANGUAGES_NO_AUTO, getLangName } from '../utils/helpers'
import AccuracyBar from '../components/AccuracyBar'
import LoadingSpinner from '../components/LoadingSpinner'

const MAX_CHARS = 2000

export default function Translator() {
  const [inputText, setInputText]     = useState('')
  const [sourceLang, setSourceLang]   = useState('auto')
  const [targetLang, setTargetLang]   = useState('hi')
  const [result, setResult]           = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [copied, setCopied]           = useState(false)
  const [detectedLang, setDetectedLang] = useState('')

  const handleTranslate = async () => {
    if (!inputText.trim()) { setError('Please enter some text to translate.'); return }
    setError(''); setResult(null); setLoading(true)
    try {
      const data = await translateText(inputText.trim(), sourceLang, targetLang)
      setResult(data)
      if (data.detected_lang) setDetectedLang(getLangName(data.detected_lang))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') return
    const prevSource = sourceLang
    const prevTarget = targetLang
    setSourceLang(prevTarget)
    setTargetLang(prevSource)
    if (result?.translated_text) {
      setInputText(result.translated_text)
      setResult(null)
    }
  }

  const handleCopy = async () => {
    if (!result?.translated_text) return
    await navigator.clipboard.writeText(result.translated_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setInputText(''); setResult(null); setError(''); setDetectedLang('')
  }

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleTranslate()
  }, [inputText, sourceLang, targetLang])

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Text Translator</h1>
            <p className="page-sub">Powered by MarianMT · Offline AI</p>
          </div>
        </div>
      </div>

      {/* Language Selectors */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">From</label>
          <select className="select" value={sourceLang} onChange={e => setSourceLang(e.target.value)}>
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
          {detectedLang && sourceLang === 'auto' && (
            <p className="text-xs text-primary-500 mt-1 font-medium">Detected: {detectedLang}</p>
          )}
        </div>

        <button
          onClick={handleSwapLanguages}
          disabled={sourceLang === 'auto'}
          title="Swap languages"
          className="mt-5 w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-slate-600 dark:text-slate-400 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">To</label>
          <select className="select" value={targetLang} onChange={e => setTargetLang(e.target.value)}>
            {LANGUAGES_NO_AUTO.map(l => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Translation Panels */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Source */}
        <div className="card p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Source Text</p>
          <textarea
            className="textarea w-full"
            placeholder="Enter text to translate…"
            value={inputText}
            onChange={e => setInputText(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            rows={6}
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs ${inputText.length >= MAX_CHARS ? 'text-red-500' : 'text-slate-400'}`}>
              {inputText.length}/{MAX_CHARS}
            </span>
            <button onClick={handleClear} className="btn-ghost text-xs py-1 px-2">
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="card p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Translation</p>
          <div className="textarea bg-slate-50 dark:bg-dark-950 min-h-[140px] flex items-start relative overflow-auto">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingSpinner size="md" label="Translating…" />
              </div>
            ) : (
              <p className={`text-sm leading-relaxed ${result?.translated_text ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                {result?.translated_text || 'Translation will appear here…'}
              </p>
            )}
          </div>
          {result && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{result.model_used?.split('/').pop()}</span>
              <button onClick={handleCopy} className="btn-ghost text-xs py-1 px-2">
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Accuracy Bar */}
      {result?.accuracy != null && (
        <div className="card p-4">
          <AccuracyBar accuracy={result.accuracy} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm animate-fade-in">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Translate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleTranslate}
          disabled={loading || !inputText.trim()}
          className="btn-primary px-10 py-3 text-base shadow-lg shadow-primary-500/30"
        >
          {loading ? <LoadingSpinner size="sm" label="" /> : <Zap className="w-4 h-4" />}
          {loading ? 'Translating…' : 'Translate'}
        </button>
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-slate-400 dark:text-slate-600">
        💡 <strong>First translation</strong> will download the AI model (~300MB). Subsequent translations are instant and work offline.
        Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">Ctrl+Enter</kbd> to translate.
      </p>
    </div>
  )
}
